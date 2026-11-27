import { NextResponse } from "next/server";
import { button, esc, send, wrap } from "@/lib/email";
import { syncPerson } from "@/lib/intercom";
import { isUuid, rest } from "@/lib/server";
import { PARTNER_PCT, siteOrigin } from "@/lib/site";

// Staff only. Approves an Authorized Sales Partner (if they applied) and emails them their welcome link.
// Pressing it again re-sends the same link.
export async function POST(req: Request) {
  const jwt = (req.headers.get("authorization") || "").replace(/^Bearer /, "");
  if (!jwt) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const staff = await rest("rpc/am_i_staff", { method: "POST", body: "{}", jwt });
  if (!staff.ok || (await staff.json()) !== true) return NextResponse.json({ error: "Staff only." }, { status: 403 });
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id || !isUuid(id)) return NextResponse.json({ error: "Unknown partner." }, { status: 400 });
  const rows = (await (await rest(`partners?select=name,email,status,invite_token,company_name,lang&id=eq.${id}`, { jwt })).json()) as { name: string; email: string; status: string; invite_token: string; company_name: string | null; lang?: string }[];
  const p = rows?.[0];
  if (!p || ["ended", "declined"].includes(p.status)) return NextResponse.json({ error: "That partner is not active." }, { status: 404 });
  if (p.status === "applied") {
    const up = await rest(`partners?id=eq.${id}`, { method: "PATCH", jwt, body: JSON.stringify({ status: "invited", decided_at: new Date().toISOString() }) });
    if (!up.ok) return NextResponse.json({ error: "Could not approve: " + (await up.text()) }, { status: 502 });
  }
  const es = p.lang === "es";
  const link = `${siteOrigin()}${es ? "/es" : ""}/partners/join/${p.invite_token}`;
  const out = es ? await send(p.email, "Ya está aprobado como Socio de Ventas Autorizado de DSP Connect",
    wrap(`<p>Hola, ${esc(p.name.split(" ")[0])}:</p>` +
      `<p>Buenas noticias: ${p.company_name ? esc(p.company_name) + " está aprobada" : "usted está aprobado"} como Socio de Ventas Autorizado de DSP Connect. Usted presenta negocios locales a DSP Connect y gana el ${PARTNER_PCT}% de su gasto publicitario calificado, pagado a diario, mientras sigan invirtiendo.</p>` +
      button(link, "Empezar") +
      `<p>Desde ahí firma su Acuerdo de Socio de Ventas, configura sus pagos y completa una capacitación corta. Este enlace es personal; no lo reenvíe.</p>`, "es")) : await send(p.email, "You're approved as a DSP Connect Authorized Sales Partner",
    wrap(`<p>Hello ${esc(p.name.split(" ")[0])},</p>` +
      `<p>Good news: ${p.company_name ? esc(p.company_name) + " is" : "you are"} approved as a DSP Connect Authorized Sales Partner. You introduce local businesses to DSP Connect and earn ${PARTNER_PCT}% of their qualified ad spend, paid daily, for as long as they keep spending.</p>` +
      `<p><a href="${link}" style="display:inline-block;background:#1A14D4;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:600">Get started</a></p>` +
      `<p>From there you sign your Sales Partner Agreement, set up your payouts and complete a short training. This link is personal to you; please do not forward it.</p>`));
  if (out.ok) await syncPerson({ email: p.email, name: p.name, role: "sales_partner", lang: es ? "es" : "en", extra: { partner_stage: "approved_needs_to_sign", ...(p.company_name ? { business_name: p.company_name } : {}) } }).catch(() => {});
  return out.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "The email could not be sent: " + (out.error || "unknown error") }, { status: 502 });
}
