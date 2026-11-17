import { NextResponse } from "next/server";
import { esc, send, wrap } from "@/lib/email";
import { isUuid, rest } from "@/lib/server";
import { SHARE_PCT, siteOrigin } from "@/lib/site";

// Staff only. Emails a Managing Partner their invitation link.
export async function POST(req: Request) {
  const jwt = (req.headers.get("authorization") || "").replace(/^Bearer /, "");
  if (!jwt) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const staff = await rest("rpc/am_i_staff", { method: "POST", body: "{}", jwt });
  if (!staff.ok || (await staff.json()) !== true) return NextResponse.json({ error: "Staff only." }, { status: 403 });
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id || !isUuid(id)) return NextResponse.json({ error: "Unknown partner." }, { status: 400 });
  const rows = (await (await rest(`partners?select=name,email,status,invite_token&id=eq.${id}`, { jwt })).json()) as { name: string; email: string; status: string; invite_token: string }[];
  const p = rows?.[0];
  if (!p || p.status === "ended") return NextResponse.json({ error: "That partner is not active." }, { status: 404 });
  const link = `${siteOrigin()}/partners/join/${p.invite_token}`;
  const out = await send(p.email, "Your invitation to become a DSP Connect Managing Partner",
    wrap(`<p>Hello ${esc(p.name.split(" ")[0])},</p>` +
      `<p>You are invited to join DSP Connect as a Managing Partner. Managing Partners introduce businesses in their industry to DSP Connect and earn ${SHARE_PCT}% of their clients' qualified ad spend, paid daily.</p>` +
      `<p><a href="${link}" style="display:inline-block;background:#1A14D4;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:600">Open your invitation</a></p>` +
      `<p>From there you sign your admission documents, set up your payouts and complete a short training. This invitation is personal to you; please do not forward it.</p>`));
  return out.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "The email could not be sent: " + (out.error || "unknown error") }, { status: 502 });
}
