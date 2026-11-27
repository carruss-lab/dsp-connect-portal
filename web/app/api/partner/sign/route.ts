import { NextResponse } from "next/server";
import { esc, send, wrap } from "@/lib/email";
import { bodyLang, setLang } from "@/lib/reqLang";
import { syncPerson } from "@/lib/intercom";
import { clientIp, loadPortal, session } from "@/lib/partner";
import { DOCS, VERSION, docHash } from "@/lib/partnerDocs";
import { signedPdf } from "@/lib/partnerPdf";
import { welcomeApproved } from "@/lib/partnerApproved";
import { secretRpc } from "@/lib/server";

const tidy = (v: unknown, n: number) => String(v || "").trim().replace(/\s+/g, " ").slice(0, n);

// Records an Authorized Sales Partner's signature, as a person or for a company, and emails a signed PDF copy.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { legal_name?: string; accepted?: string[]; entity?: string; company?: string; title?: string; lang?: string };
  const lang = bodyLang(body); const es = lang === "es";
  const name = tidy(body.legal_name, 160);
  const entity = body.entity === "company" ? "company" : "individual";
  const company = entity === "company" ? tidy(body.company, 160) : "";
  const title = entity === "company" ? tidy(body.title, 80) : "";
  if (name.length < 4 || !/\s/.test(name)) return NextResponse.json({ error: es ? "Escriba su nombre legal completo, nombre y apellido." : "Please type your full legal name, first and last." }, { status: 400 });
  if (entity === "company" && (company.length < 2 || title.length < 2)) return NextResponse.json({ error: es ? "Escriba el nombre legal completo de su empresa y su cargo." : "Please give your company's full legal name and your title." }, { status: 400 });
  const accepted = new Set(Array.isArray(body.accepted) ? body.accepted : []);
  if (!DOCS.every((d) => accepted.has(d.id))) return NextResponse.json({ error: es ? "Lea y acepte cada documento." : "Please read and accept each document." }, { status: 400 });

  const portal = await loadPortal();
  if (!portal) return NextResponse.json({ error: es ? "Su sesión terminó. Inicie sesión de nuevo." : "Your session has ended. Please sign in again." }, { status: 401 });
  if (portal.role !== "owner") return NextResponse.json({ error: es ? "Solo el socio dueño de esta cuenta puede firmar el acuerdo." : "Only the partner who owns this account can sign the agreement." }, { status: 403 });
  if (portal.partner.signed_at) return NextResponse.json({ ok: true, already: true });

  const ip = clientIp(req), ua = req.headers.get("user-agent") || "", hash = docHash(), esHash = es ? docHash("es") : undefined;
  const sess = await session();
  const ok = await secretRpc<boolean>("partner_sign", {
    p_session: sess, p_legal_name: name, p_version: VERSION, p_hash: hash, p_ip: ip, p_ua: ua,
    p_entity: entity, p_company: company, p_title: title,
  }).catch((err) => { console.error("partner sign failed", err); return false; });
  if (!ok) return NextResponse.json({ error: es ? "No pudimos registrar su firma. Inténtelo de nuevo." : "We could not record your signature. Please try again." }, { status: 500 });
  await setLang("signature", sess, lang, esHash);

  const p = portal.partner;
  try {
    const pdf = await signedPdf({ legalName: name, email: p.email, signedAt: new Date().toISOString().replace("T", " ").slice(0, 19), ip, hash, company, title, lang, translationHash: esHash });
    const who = company ? `${esc(company)}'s` : "Your";
    if (es) await send(p.email, "Su Acuerdo de Socio de Ventas Autorizado de DSP Connect firmado",
      wrap(`<p>Hola, ${esc(p.name.split(" ")[0])}:</p><p>Gracias. ${company ? `El Acuerdo de Socio de Ventas Autorizado de ${esc(company)}` : "Su Acuerdo de Socio de Ventas Autorizado"} está firmado. Adjuntamos una copia de lo que firmó: la versión en inglés, que es la que rige, seguida de la traducción al español como referencia.</p>` +
        (p.payouts_ready
          ? `<p>Stripe ya verificó su cuenta de pagos, así que ya está aprobado. Lo siguiente en su portal: complete la capacitación corta. Sus enlaces de clientes le acreditan desde hoy, y sigue ganando por cada cliente que traiga mientras sigan invirtiendo.</p>`
          : `<p>Lo siguiente en su portal: configure sus pagos con Stripe. En cuanto Stripe verifique su cuenta, queda aprobado automáticamente y sus enlaces de clientes empiezan a acreditarle. Después complete la capacitación corta.</p>`), "es"),
      undefined, [{ filename: `DSP-Connect-Acuerdo-Socio-de-Ventas-${VERSION}.pdf`, content: pdf }], process.env.NOTIFY_EMAIL || undefined);
    else await send(p.email, "Your signed DSP Connect Authorized Sales Partner Agreement",
      wrap(`<p>Hello ${esc(p.name.split(" ")[0])},</p><p>Thank you. ${who} Authorized Sales Partner Agreement is signed. A copy of what you signed is attached for your records.</p>` +
        (p.payouts_ready
          ? `<p>Stripe has already verified your payout account, so you are now approved. Next in your portal: complete the short training. Your client links credit you from today, and you keep earning on every client you bring for as long as they spend.</p>`
          : `<p>Next in your portal: set up your payouts with Stripe. As soon as Stripe verifies your account you are approved automatically, and your client links start crediting you. Then complete the short training.</p>`)),
      undefined, [{ filename: `DSP-Connect-Sales-Partner-Agreement-${VERSION}.pdf`, content: pdf }], process.env.NOTIFY_EMAIL || undefined);
  } catch (err) { console.error("signed copy failed", err); }
  if (p.payouts_ready) await welcomeApproved(p.invite_token);
  await syncPerson({ email: p.email, name: p.name, role: "sales_partner", lang, extra: { partner_stage: p.payouts_ready ? "payouts_ready_needs_training" : "signed_needs_payouts", ...(company ? { business_name: company } : {}) } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
