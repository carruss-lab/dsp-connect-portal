import { NextResponse } from "next/server";
import { esc, notifyTeam, send, wrap } from "@/lib/email";
import { syncPerson } from "@/lib/intercom";
import { secretRpc } from "@/lib/server";
import { INDUSTRIES, SHARE_PCT } from "@/lib/site";

const t = (v: unknown, n: number) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, n);
const long = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

// Public application to become an Authorized Sales Partner. Staff review it in the back office;
// nobody is admitted until they are approved and sign the agreement.
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (t(b.company_fax, 10)) return NextResponse.json({ ok: true }); // hidden field only bots fill in
  const email = t(b.email, 200).toLowerCase();
  const name = t(b.name, 120);
  const entity = b.entity === "company" ? "company" : "individual";
  const company = entity === "company" ? t(b.company, 160) : "";
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please give your name and a valid email address." }, { status: 400 });
  if (entity === "company" && company.length < 2) return NextResponse.json({ error: "Please give your company's name." }, { status: 400 });
  if (!b.agree) return NextResponse.json({ error: "Please agree to be contacted about your application." }, { status: 400 });
  const vertical = INDUSTRIES.includes(t(b.vertical, 60)) ? t(b.vertical, 60) : "Other";
  const row = {
    p_name: name, p_email: email, p_phone: t(b.phone, 40), p_location: t(b.location, 160), p_vertical: vertical,
    p_website: t(b.website, 200), p_linkedin: t(b.linkedin, 200), p_experience: long(b.experience, 3000), p_network: long(b.network, 3000),
    p_entity: entity, p_company: company,
  };
  let result: string;
  try { result = await secretRpc<string>("partner_apply", row); }
  catch (err) { console.error("partner apply failed", err); return NextResponse.json({ error: "We could not save your application. Please try again." }, { status: 502 }); }
  if (result === "invalid") return NextResponse.json({ error: "Please check your name and email address." }, { status: 400 });
  if (result === "exists") return NextResponse.json({ ok: true, existing: true });

  await Promise.all([
    notifyTeam("Sales Partner application", {
      name, email, company: company || undefined, entity, phone: row.p_phone, location: row.p_location, industry: vertical,
      website: row.p_website, linkedin: row.p_linkedin, experience: row.p_experience, network: row.p_network,
      business: company || name,
    }),
    send(email, "We received your DSP Connect Authorized Sales Partner application",
      wrap(`<p>Hello ${esc(name.split(" ")[0])},</p>` +
        `<p>Thank you for applying to become a DSP Connect Authorized Sales Partner${company ? ` with ${esc(company)}` : ""}. We review every application and will reply by email, usually within two business days.</p>` +
        `<p>If you are approved, you sign your Sales Partner Agreement online, set up your payouts through Stripe and complete a short training. Then you earn ${SHARE_PCT}% of the qualified ad spend of every client you bring, paid daily, for as long as they keep spending.</p>` +
        `<p>Questions in the meantime? Just reply to this email.</p>`)),
    syncPerson({ email, name, role: "partner_applicant", industry: vertical, market: row.p_location || null, extra: company ? { business_name: company } : {} }),
  ]).catch((err) => console.error("partner apply follow-up failed", err));
  return NextResponse.json({ ok: true });
}
