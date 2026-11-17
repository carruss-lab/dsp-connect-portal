import { NextResponse } from "next/server";
import { esc, send, wrap } from "@/lib/email";
import { syncPerson } from "@/lib/intercom";
import { clientIp, loadPortal, session } from "@/lib/partner";
import { DOCS, VERSION, docHash } from "@/lib/partnerDocs";
import { signedPdf } from "@/lib/partnerPdf";
import { secretRpc } from "@/lib/server";

// Records a Managing Partner's signature on the admission documents and emails them a signed PDF copy.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { legal_name?: string; accepted?: string[] };
  const name = String(body.legal_name || "").trim().replace(/\s+/g, " ").slice(0, 160);
  if (name.length < 4 || !/\s/.test(name)) return NextResponse.json({ error: "Please type your full legal name, first and last." }, { status: 400 });
  const accepted = new Set(Array.isArray(body.accepted) ? body.accepted : []);
  if (!DOCS.every((d) => accepted.has(d.id))) return NextResponse.json({ error: "Please read and accept each document." }, { status: 400 });

  const portal = await loadPortal();
  if (!portal) return NextResponse.json({ error: "Your session has ended. Please sign in again." }, { status: 401 });
  if (portal.partner.signed_at) return NextResponse.json({ ok: true, already: true });

  const ip = clientIp(req), ua = req.headers.get("user-agent") || "", hash = docHash();
  const ok = await secretRpc<boolean>("partner_sign", { p_session: await session(), p_legal_name: name, p_version: VERSION, p_hash: hash, p_ip: ip, p_ua: ua }).catch((err) => { console.error("partner sign failed", err); return false; });
  if (!ok) return NextResponse.json({ error: "We could not record your signature. Please try again." }, { status: 500 });

  const p = portal.partner;
  try {
    const pdf = await signedPdf({ legalName: name, email: p.email, signedAt: new Date().toISOString().replace("T", " ").slice(0, 19), ip, hash });
    await send(p.email, "Your signed DSP Connect Managing Partner documents",
      wrap(`<p>Hello ${esc(p.name.split(" ")[0])},</p><p>Thank you. Your Managing Partner admission is signed. A copy of the documents you signed is attached for your records.</p>` +
        `<p>Next in your portal: set up your payouts and complete the short training. Your client link starts crediting you now.</p>`),
      undefined, [{ filename: `DSP-Connect-Managing-Partner-${VERSION}.pdf`, content: pdf }], process.env.NOTIFY_EMAIL || undefined);
  } catch (err) { console.error("signed copy failed", err); }
  await syncPerson({ email: p.email, name: p.name, role: "managing_partner" }).catch(() => {});
  return NextResponse.json({ ok: true });
}
