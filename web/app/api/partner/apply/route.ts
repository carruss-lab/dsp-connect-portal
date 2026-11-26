import { NextResponse } from "next/server";
import { esc, notifyTeam, send, wrap } from "@/lib/email";
import { syncPerson } from "@/lib/intercom";
import { secretRpc } from "@/lib/server";
import { INDUSTRIES, SHARE_PCT, siteOrigin } from "@/lib/site";

const t = (v: unknown, n: number) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, n);
const long = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

// Public application to become an Authorized Sales Partner. Enrollment starts straight away: the applicant gets their
// get-started link, signs the agreement and sets up payouts with Stripe. Stripe's verification is the approval step:
// once it passes and the agreement is signed they are approved automatically (see lib/partnerApproved.ts).
// Staff can still decline anyone in the back office.
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
  const link = `${siteOrigin()}/partners/join/${result.replace(/^created:/, "")}`;

  await Promise.all([
    notifyTeam("Sales Partner application (enrolling; approved automatically once Stripe verifies them)", {
      name, email, company: company || undefined, entity, phone: row.p_phone, location: row.p_location, industry: vertical,
      website: row.p_website, linkedin: row.p_linkedin, experience: row.p_experience, network: row.p_network,
      business: company || name,
    }),
    send(email, "Your DSP Connect Authorized Sales Partner enrollment: next steps",
      wrap(`<p>Hello ${esc(name.split(" ")[0])},</p>` +
        `<p>Thank you for applying to become a DSP Connect Authorized Sales Partner${company ? ` with ${esc(company)}` : ""}. You can start your enrollment now:</p>` +
        `<ol><li><b>Sign your Sales Partner Agreement</b> online, as yourself or for your company.</li><li><b>Verify with Stripe</b> and set up your payouts. Stripe checks your identity and bank details; we never see them.</li></ol>` +
        `<p>As soon as Stripe verifies you and your agreement is signed, you are approved automatically and your client links start crediting you. Then a short training, and you earn ${SHARE_PCT}% of the qualified ad spend of every client you bring, paid daily, for as long as they keep spending.</p>` +
        `<p><a href="${link}" style="display:inline-block;background:#1A14D4;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:600">Start your enrollment</a></p>` +
        `<p>This link is personal to you; please do not forward it. Questions? Just reply to this email.</p>`)),
    syncPerson({ email, name, role: "sales_partner", industry: vertical, market: row.p_location || null, extra: { partner_stage: "approved_needs_to_sign", ...(company ? { business_name: company } : {}) } }),
  ]).catch((err) => console.error("partner apply follow-up failed", err));
  return NextResponse.json({ ok: true });
}
