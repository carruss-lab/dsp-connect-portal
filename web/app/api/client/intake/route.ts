import { NextResponse } from "next/server";
import { cleanBrief, fieldLabel } from "@/lib/brief";
import { notifyTeam } from "@/lib/email";
import { syncPerson } from "@/lib/intercom";
import { isUuid, secretRpc } from "@/lib/server";

// A paying client sends their campaign brief. Their private link carries the id.
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const lead = typeof b.lead === "string" ? b.lead.trim() : "";
  if (!isUuid(lead)) return NextResponse.json({ error: "This link is not valid. Please use the link in your payment email." }, { status: 400 });
  const { data, missing } = cleanBrief(b);
  if (missing) return NextResponse.json({ error: `Please answer: ${missing}` }, { status: 400 });
  try {
    const who = await secretRpc<{ business: string | null; email: string; name: string | null } | null>("client_intake", { p_lead: lead, p_data: data });
    if (!who) return NextResponse.json({ error: "We could not find a paid account for this link." }, { status: 404 });
    const labeled = Object.fromEntries(Object.entries(data).map(([k, v]) => [fieldLabel(k), v]));
    await Promise.all([
      notifyTeam("intake", { Business: who.business, email: who.email, ...labeled }),
      syncPerson({ email: who.email, name: who.name, role: "client", extra: { setup_details_received: "Yes", primary_goal: data.primary_goal || "", campaign_types: (data.campaign_types || "").slice(0, 250) } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("intake failed", err);
    return NextResponse.json({ error: "We could not save that. Please try again, or reply to our email." }, { status: 500 });
  }
}
