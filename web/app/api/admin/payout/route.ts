import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { stripe } from "@/lib/payments";
import { notifyPayout } from "@/lib/notices";
import { authEmail, rest, secretRpc } from "@/lib/server";
import { businessToday } from "@/lib/site";

type Line = { id: string; partner_id: string; amount: number; release_on: string };
type Partner = { id: string; name: string; email: string; stripe_account_id: string | null; payouts_ready: boolean };

// Pays every approved commission line that has reached its release date. Staff only.
export async function POST(req: Request) {
  const jwt = (req.headers.get("authorization") || "").replace(/^Bearer /, "");
  if (!jwt) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const client = stripe();
  if (!client) return NextResponse.json({ error: "Stripe is not connected." }, { status: 503 });
  try {
    const staff = await rest("rpc/am_i_staff", { method: "POST", body: "{}", jwt });
    if (!staff.ok || (await staff.json()) !== true) return NextResponse.json({ error: "Staff only." }, { status: 403 });
    const by = (await authEmail(jwt)) || "staff";

    const today = businessToday();
    const lines = (await (await rest(`commissions?select=id,partner_id,amount,release_on&status=eq.approved&release_on=lte.${today}`, { jwt })).json()) as Line[];
    if (!Array.isArray(lines) || lines.length === 0) return NextResponse.json({ paid: [], skipped: [], message: "Nothing is approved and due for payment." });
    const partners = (await (await rest("partners?select=id,name,email,stripe_account_id,payouts_ready", { jwt })).json()) as Partner[];
    // Reversed commission that was already paid is deducted from the partner's next payout.
    const offsets = (await (await rest("commission_offsets?select=partner_id,amount&recovered_at=is.null", { jwt })).json()) as { partner_id: string; amount: number }[];
    const owedCents = (pid: string) => (Array.isArray(offsets) ? offsets : []).filter((o) => o.partner_id === pid).reduce((a, o) => a + Math.round(Number(o.amount) * 100), 0);

    const paid: { partner: string; amount: number }[] = [];
    const skipped: { partner: string; reason: string }[] = [];
    for (const pid of [...new Set(lines.map((l) => l.partner_id))]) {
      const p = partners.find((x) => x.id === pid);
      const mine = lines.filter((l) => l.partner_id === pid);
      const gross = mine.reduce((a, l) => a + Math.round(Number(l.amount) * 100), 0);
      const owed = owedCents(pid);
      const cents = gross - owed;
      const name = p?.name || pid;
      if (!p?.stripe_account_id || !p.payouts_ready) { skipped.push({ partner: name, reason: "Payout account is not set up yet." }); continue; }
      if (cents <= 0) { if (owed > 0) skipped.push({ partner: name, reason: `Held: reversed commission of $${(owed / 100).toFixed(2)} is larger than what is due.` }); continue; }
      const ids = mine.map((l) => l.id).sort();
      // The same set of lines always produces the same key, so a retry can never pay twice.
      const key = "payout_" + createHash("sha256").update(ids.join(",") + "|" + owed).digest("hex").slice(0, 40);
      try {
        const t = await client.transfers.create(
          { amount: cents, currency: "usd", destination: p.stripe_account_id, description: "DSP Connect Authorized Sales Partner commission", metadata: { partner_id: pid, lines: String(ids.length), deducted_cents: String(owed) } },
          { idempotencyKey: key },
        );
        await secretRpc("payout_record", { p_partner: pid, p_amount: cents / 100, p_transfer: t.id, p_ids: ids, p_by: by });
        if (owed > 0) await secretRpc("offsets_recover", { p_partner: pid, p_transfer: t.id });
        paid.push({ partner: name, amount: cents / 100 });
        await notifyPayout(p, cents / 100, t.id).catch((e) => console.error("payout email failed", e));
      } catch (err) {
        console.error("transfer failed", pid, err);
        skipped.push({ partner: name, reason: err instanceof Error ? err.message : "Stripe refused the transfer." });
      }
    }
    return NextResponse.json({ paid, skipped });
  } catch (err) {
    console.error("payout run failed", err);
    return NextResponse.json({ error: "The payout run failed. Nothing further was sent." }, { status: 500 });
  }
}
