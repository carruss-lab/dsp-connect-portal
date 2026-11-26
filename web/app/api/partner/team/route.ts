import { NextResponse } from "next/server";
import { esc, notifyTeam, send, wrap } from "@/lib/email";
import { syncPerson } from "@/lib/intercom";
import { isUuid, secretRpc } from "@/lib/server";
import { session } from "@/lib/partner";
import { siteOrigin } from "@/lib/site";

// A Sales Partner's team: the partner adds reps, who get their own sign-in and their own client links.
// Clients a rep brings are credited to the partner (who is paid) and tagged with the rep. Only the partner
// can add or remove reps; a rep's session is refused by the database.
type Invite = { status: string; token?: string; member?: { id: string; name: string; email: string; code: string }; company?: string; owner?: string };

const MESSAGES: Record<string, string> = {
  signed_out: "Only the partner who owns this account can manage the team. Please sign in again.",
  invalid: "Please give the rep's full name and a valid email address.",
  is_partner: "That email already belongs to a Sales Partner account, so it can't be added as a rep.",
  exists: "That email is already on a Sales Partner team.",
  limit: "You can have up to 50 reps on your team. Remove someone first, or ask us in the chat.",
};

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { action?: string; name?: string; email?: string; id?: string };
  const s = await session();
  if (!/^[0-9a-f]{64}$/.test(s)) return NextResponse.json({ error: MESSAGES.signed_out }, { status: 401 });

  if (b.action === "remove") {
    if (!isUuid(b.id || "")) return NextResponse.json({ error: "Unknown rep." }, { status: 400 });
    const ok = await secretRpc<boolean>("partner_member_remove", { p_session: s, p_member: b.id }).catch((e) => { console.error("team remove failed", e); return false; });
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "We could not remove that rep. Please sign in again and retry." }, { status: 400 });
  }

  const name = String(b.name || "").trim().replace(/\s+/g, " ").slice(0, 120);
  const email = String(b.email || "").trim().toLowerCase().slice(0, 200);
  let out: Invite;
  try { out = await secretRpc<Invite>("partner_member_invite", { p_session: s, p_name: name, p_email: email }); }
  catch (err) { console.error("team invite failed", err); return NextResponse.json({ error: "We could not add that rep just now. Please try again." }, { status: 502 }); }
  if (out.status !== "invited" || !out.token || !out.member) {
    return NextResponse.json({ error: MESSAGES[out.status] || "We could not add that rep." }, { status: out.status === "signed_out" ? 401 : 400 });
  }

  const link = `${siteOrigin()}/partner/auth?t=${out.token}`;
  const company = out.company || "your team";
  await Promise.all([
    send(out.member.email, `${out.owner || company} added you to their DSP Connect sales team`,
      wrap(`<p>Hello ${esc(out.member.name.split(" ")[0])},</p>` +
        `<p>${esc(out.owner || "Your manager")} added you to the <b>${esc(company)}</b> team, an Authorized Sales Partner of DSP Connect.</p>` +
        `<p>Your portal has your own links to the free ad planner, the demo and account sign-up, a sales kit and short training videos. Business owners you bring through your links are credited to ${esc(company)} and show up under your name.</p>` +
        `<p><a href="${link}" style="display:inline-block;background:#1A14D4;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:600">Open your portal</a></p>` +
        `<p>This link works once, for the next 7 days. After that, sign in any time at ${siteOrigin()}/partner with this email address.</p>` +
        `<p style="color:#5B6577;font-size:13px">Commission is paid to ${esc(company)}, not to individual reps. Questions about your pay go to ${esc(out.owner || "your manager")}.</p>`)),
    notifyTeam("Sales Partner added a team member", { name: out.member.name, email: out.member.email, business: company, partner: out.owner, code: out.member.code }),
    syncPerson({ email: out.member.email, name: out.member.name, role: "sales_partner", extra: { partner_stage: "team_member", business_name: company } }),
  ]).catch((err) => console.error("team invite follow-up failed", err));

  return NextResponse.json({ ok: true, member: out.member });
}
