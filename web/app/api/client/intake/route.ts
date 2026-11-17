import { NextResponse } from "next/server";
import { notifyTeam } from "@/lib/email";
import { syncPerson } from "@/lib/intercom";
import { isUuid, secretRpc } from "@/lib/server";

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// A paying client sends what we need to start their setup. Their private link carries the id.
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const lead = clean(b.lead, 40);
  const data = {
    landing_page: clean(b.landing_page, 300), ads_link: clean(b.ads_link, 500), need_ads: b.need_ads === true,
    web_contact_name: clean(b.web_contact_name, 120), web_contact_email: clean(b.web_contact_email, 200).toLowerCase(), notes: clean(b.notes, 2000),
  };
  if (!isUuid(lead)) return NextResponse.json({ error: "This link is not valid. Please use the link in your payment email." }, { status: 400 });
  if (!data.landing_page || !data.web_contact_name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.web_contact_email))
    return NextResponse.json({ error: "Please give the landing page and the name and email of your website contact." }, { status: 400 });
  if (!data.ads_link && !data.need_ads && !data.notes)
    return NextResponse.json({ error: "Add a link to your ads, tick the box if you do not have ads yet, or tell us in the notes how you will send them." }, { status: 400 });
  try {
    const who = await secretRpc<{ business: string | null; email: string; name: string | null } | null>("client_intake", { p_lead: lead, p_data: data });
    if (!who) return NextResponse.json({ error: "We could not find a paid account for this link." }, { status: 404 });
    await Promise.all([
      notifyTeam("intake", { business: who.business, email: who.email, ...data, need_ads: data.need_ads ? "Yes, wants to discuss options" : "" }),
      syncPerson({ email: who.email, name: who.name, role: "client", extra: { setup_details_received: "Yes" } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("intake failed", err);
    return NextResponse.json({ error: "We could not save that. Please try again, or reply to our email." }, { status: 500 });
  }
}
