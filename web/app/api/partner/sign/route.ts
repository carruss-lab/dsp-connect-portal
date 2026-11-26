import { NextResponse } from "next/server";
import { esc, send, wrap } from "@/lib/email";
import { syncPerson } from "@/lib/intercom";
import { clientIp, loadPortal, session } from "@/lib/partner";
import { DOCS, VERSION, docHash } from "@/lib/partnerDocs";
import { signedPdf } from "@/lib/partnerPdf";
import { secretRpc } from "@/lib/server";

const tidy = (v: unknown, n: number) => String(v || "").trim().replace(/\s+/g, " ").slice(0, n);

// Records an Authorized Sales Partner's signature, as a person or for a company, and emails a signed PDF copy.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { legal_name?: string; accepted?: string[]; entity?: string; company?: string; title?: string };
  const name = tidy(body.legal_name, 160);
  const entity = body.entity === "company" ? "company" : "individual";
  const company = entity === "company" ? tidy(body.company, 160) : "";
  const title = entity === "company" ? tidy(body.title, 80) : "";
  if (name.length < 4 || !/\s/.test(name)) return NextResponse.json({ error: "Please type your full legal name, first and last." }, { status: 400 });
  if (entity === "company" && (company.length < 2 || title.length < 2)) return NextResponse.json({ error: "Please give your company's full legal name and your title." }, { status: 400 });
  const accepted = new Set(Array.isArray(body.accepted) ? body.accepted : []);
  if (!DOCS.every((d) => accepted.has(d.id))) return NextResponse.json({ error: "Please read and accept each document." }, { status: 400 });

  const portal = await loadPortal();
  if (!portal) return NextResponse.json({ error: "Your session has ended. Please sign in again." }, { status: 401 });
  if (portal.partner.signed_at) return NextResponse.json({ ok: true, already: true });

  const ip = clientIp(req), ua = req.headers.get("user-agent") || "", hash = docHash();
  const ok = await secretRpc<boolean>("partner_sign", {
    p_session: await session(), p_legal_name: name, p_version: VERSION, p_hash: hash, p_ip: ip, p_ua: ua,
    p_entity: entity, p_company: company, p_title: title,
  }).catch((err) => { console.error("partner sign failed", err); return false; });
  if (!ok) return NextResponse.json({ error: "We could not record your signature. Please try again." }, { status: 500 });

  const p = portal.partner;
  try {
    const pdf = await signedPdf({ legalName: name, email: p.email, signedAt: new Date().toISOString().replace("T", " ").slice(0, 19), ip, hash, company, title });
    const who = company ? `${esc(company)}'s` : "Your";
    await send(p.email, "Your signed DSP Connect Authorized Sales Partner Agreement",
      wrap(`<p>Hello ${esc(p.name.split(" ")[0])},</p><p>Thank you. ${who} Authorized Sales Partner Agreement is signed. A copy of what you signed is attached for your records.</p>` +
        `<p>Next in your portal: set up your payouts and complete the short training. Your client link starts crediting you now, and you keep earning on every client you bring for as long as they spend.</p>`),
      undefined, [{ filename: `DSP-Connect-Sales-Partner-Agreement-${VERSION}.pdf`, content: pdf }], process.env.NOTIFY_EMAIL || undefined);
  } catch (err) { console.error("signed copy failed", err); }
  await syncPerson({ email: p.email, name: p.name, role: "sales_partner", extra: { partner_stage: "signed_needs_payouts", ...(company ? { business_name: company } : {}) } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
