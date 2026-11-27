import { NextResponse } from "next/server";
import { cleanBrief, fieldLabel } from "@/lib/brief";
import { notifyTeam } from "@/lib/email";
import { syncPerson } from "@/lib/intercom";
import { isUuid, secretRpc } from "@/lib/server";
import { bodyLang, setLang } from "@/lib/reqLang";
import { FIELD_ES } from "@/lib/brief.es";

// A paying client sends their campaign brief. Their private link carries the id.
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const lang = bodyLang(b); const es = lang === "es";
  const lead = typeof b.lead === "string" ? b.lead.trim() : "";
  if (!isUuid(lead)) return NextResponse.json({ error: es ? "Este enlace no es válido. Use el enlace de su correo de pago." : "This link is not valid. Please use the link in your payment email." }, { status: 400 });
  const { data, missing } = cleanBrief(b);
  if (missing) return NextResponse.json({ error: es ? `Responda: ${FIELD_ES[Object.keys(FIELD_ES).find((k) => fieldLabel(k) === missing) || ""]?.label || missing}` : `Please answer: ${missing}` }, { status: 400 });
  try {
    const who = await secretRpc<{ business: string | null; email: string; name: string | null } | null>("client_intake", { p_lead: lead, p_data: data });
    if (!who) return NextResponse.json({ error: es ? "No encontramos una cuenta pagada para este enlace." : "We could not find a paid account for this link." }, { status: 404 });
    if (es) await setLang("lead", lead, "es");
    const labeled = Object.fromEntries(Object.entries(data).map(([k, v]) => [fieldLabel(k), v]));
    await Promise.all([
      notifyTeam("intake", { Business: who.business, email: who.email, ...(es ? { Language: "Spanish (answers as written)" } : {}), ...labeled }),
      syncPerson({ email: who.email, name: who.name, role: "client", ...(es ? { lang } : {}), extra: { setup_details_received: "Yes", primary_goal: data.primary_goal || "", campaign_types: (data.campaign_types || "").slice(0, 250) } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("intake failed", err);
    return NextResponse.json({ error: es ? "No pudimos guardar eso. Inténtelo de nuevo o responda a nuestro correo." : "We could not save that. Please try again, or reply to our email." }, { status: 500 });
  }
}
