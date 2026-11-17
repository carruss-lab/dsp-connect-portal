import { createHash } from "node:crypto";
import { stripe } from "./payments";
import { notifyPayout } from "./notices";
import { secretRpc } from "./server";
import { businessToday } from "./site";

type Line = { id: string; partner_id: string; amount: number; release_on: string };
type Partner = { id: string; name: string; email: string; stripe_account_id: string | null; payouts_ready: boolean };
type Queue = { lines: Line[]; partners: Partner[]; offsets: { partner_id: string; amount: number }[] };
export type Held = { partner: string; amount: number; reason: string };
export type PayoutResult = { paid: { partner: string; amount: number }[]; skipped: { partner: string; reason: string }[]; approved?: number; held?: Held[]; message?: string };

/** The most one partner can be paid in a day without a person approving it. Change in Vercel: AUTO_PAYOUT_LIMIT. */
export const AUTO_PAYOUT_LIMIT = Number(process.env.AUTO_PAYOUT_LIMIT || 1000);

/**
 * The daily rule: approves pending commission that has passed its hold and meets the rule (see the
 * commission_auto_approve database function), and reports what it held back for a person.
 */
export async function autoApprove(): Promise<{ approved: number; held: Held[] }> {
  return secretRpc("commission_auto_approve", { p_today: businessToday(), p_limit: AUTO_PAYOUT_LIMIT });
}

/**
 * Pays every approved commission line that has reached its release date, one Stripe transfer per partner.
 * Used by the daily job and by the "Pay now" button. The same set of lines always uses the same
 * Stripe idempotency key, so two runs at once, or a retry, can never pay twice.
 */
export async function payDue(by: string): Promise<PayoutResult> {
  const client = stripe();
  if (!client) return { paid: [], skipped: [], message: "Stripe is not connected." };
  const q = await secretRpc<Queue>("payout_queue", { p_today: businessToday() });
  if (!q.lines.length) return { paid: [], skipped: [], message: "Nothing is approved and due for payment." };
  // Reversed commission that was already paid is deducted from the partner's next payout.
  const owedCents = (pid: string) => q.offsets.filter((o) => o.partner_id === pid).reduce((a, o) => a + Math.round(Number(o.amount) * 100), 0);

  const paid: PayoutResult["paid"] = [];
  const skipped: PayoutResult["skipped"] = [];
  for (const pid of [...new Set(q.lines.map((l) => l.partner_id))]) {
    const p = q.partners.find((x) => x.id === pid);
    const mine = q.lines.filter((l) => l.partner_id === pid);
    const gross = mine.reduce((a, l) => a + Math.round(Number(l.amount) * 100), 0);
    const owed = owedCents(pid);
    const cents = gross - owed;
    const name = p?.name || pid;
    if (!p?.stripe_account_id || !p.payouts_ready) { skipped.push({ partner: name, reason: "Payout account is not set up yet." }); continue; }
    if (cents <= 0) { if (owed > 0) skipped.push({ partner: name, reason: `Held: reversed commission of $${(owed / 100).toFixed(2)} is larger than what is due.` }); continue; }
    const ids = mine.map((l) => l.id).sort();
    const key = "payout_" + createHash("sha256").update(ids.join(",") + "|" + owed).digest("hex").slice(0, 40);
    try {
      const t = await client.transfers.create(
        { amount: cents, currency: "usd", destination: p.stripe_account_id, description: "DSP Connect Authorized Sales Partner commission", metadata: { partner_id: pid, lines: String(ids.length), deducted_cents: String(owed), run_by: by.slice(0, 80) } },
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
  return { paid, skipped };
}

/** The whole daily run: apply the approval rule, then pay what is due. */
export async function dailyPayouts(): Promise<PayoutResult> {
  const { approved, held } = await autoApprove();
  const out = await payDue("automatic daily run");
  return { ...out, approved, held };
}
