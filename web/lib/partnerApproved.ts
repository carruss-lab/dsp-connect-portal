import { button, esc, notifyTeam, send, wrap } from "./email";
import { syncPerson } from "./intercom";
import { secretRpc } from "./server";
import { PARTNER_PCT, siteOrigin } from "./site";

type P = { id: string; name: string; email: string; status: string; code: string; company_name: string | null; lang?: string };

/**
 * Welcomes a Sales Partner the moment they are approved: their agreement is signed and Stripe has verified their payout
 * account. Sent once (the notices table stops a second copy), from whichever path saw the approval first.
 */
export async function welcomeApproved(token: string) {
  try {
    const [p] = await secretRpc<P[]>("partner_by_token", { p_token: token });
    if (!p || !["admitted", "active"].includes(p.status)) return;
    const es = p.lang === "es";
    const title = es ? "Ya está aprobado: bienvenido, Socio de Ventas Autorizado de DSP Connect" : "You're approved: welcome, DSP Connect Authorized Sales Partner";
    const id = await secretRpc<string | null>("notice_claim", { p_subject: p.id, p_type: "partner", p_kind: "partner_approved", p_to: p.email, p_title: title });
    if (!id) return; // already welcomed
    const portal = `${siteOrigin()}${es ? "/es" : ""}/partner`;
    const out = es ? await send(p.email, title, wrap(
      `<p>Hola, ${esc(p.name.split(" ")[0])}:</p>` +
      `<p>Stripe verificó su cuenta de pagos y su acuerdo está firmado, así que ${p.company_name ? esc(p.company_name) + " ya es" : "ya es"} Socio de Ventas Autorizado de DSP Connect. Desde hoy, los clientes que abran su cuenta con sus enlaces se le acreditan, y gana el ${PARTNER_PCT}% de su gasto publicitario calificado, pagado a diario, mientras sigan invirtiendo.</p>` +
      `<p><b>Un paso antes de su primer cliente:</b> termine la capacitación corta en su portal. Después use sus enlaces, su kit de ventas y el planificador de anuncios gratis.</p>` +
      button(portal, "Abrir su portal") +
      `<p>Su código de socio es <b>${esc(p.code)}</b>. ¿Preguntas? Use el chat de su portal o responda a este correo, en español.</p>`, "es")) : await send(p.email, title, wrap(
      `<p>Hello ${esc(p.name.split(" ")[0])},</p>` +
      `<p>Stripe has verified your payout account and your agreement is signed, so ${p.company_name ? esc(p.company_name) + " is" : "you are"} now an approved DSP Connect Authorized Sales Partner. From today, clients who open their account through your links are credited to you, and you earn ${PARTNER_PCT}% of their qualified ad spend, paid daily, for as long as they spend.</p>` +
      `<p><b>One step before your first client:</b> finish the short training in your portal. Then use your links, your sales kit and the free ad planner.</p>` +
      `<p><a href="${portal}" style="display:inline-block;background:#1A14D4;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:600">Open your portal</a></p>` +
      `<p>Your partner code is <b>${esc(p.code)}</b>. Questions? Use the chat in your portal or reply to this email.</p>`));
    await secretRpc("notice_result", { p_id: id, p_ok: out.ok, p_error: out.error || null });
    await Promise.all([
      notifyTeam("Sales Partner approved automatically", { name: p.name, email: p.email, company: p.company_name || undefined, code: p.code, how: "Agreement signed and Stripe verified" }),
      syncPerson({ email: p.email, name: p.name, role: "sales_partner", lang: es ? "es" : "en", extra: { partner_stage: "payouts_ready_needs_training" } }),
    ]).catch(() => {});
  } catch (err) { console.error("partner approval welcome failed", err); }
}
