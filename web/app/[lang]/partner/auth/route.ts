import { NextResponse } from "next/server";
import { COOKIE, SESSION_DAYS, clientIp } from "@/lib/partner";
import { secretRpc } from "@/lib/server";

// Opens a partner session from an emailed sign-in link, then sends them to their portal.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const t = url.searchParams.get("t") || "";
  let s: string | null = null;
  if (/^[0-9a-f]{64}$/.test(t)) {
    try { s = await secretRpc<string | null>("partner_login_finish", { p_token: t, p_ip: clientIp(req) }); } catch (err) { console.error("partner sign-in failed", err); }
  }
  const home = url.searchParams.get("lang") === "es" || url.pathname.startsWith("/es/") ? "/es/partner" : "/partner";
  const res = NextResponse.redirect(new URL(s ? home : `${home}?link=expired`, url.origin), 303);
  if (s) res.cookies.set(COOKIE, s, { httpOnly: true, secure: url.protocol === "https:", sameSite: "lax", path: "/", maxAge: SESSION_DAYS * 86400 });
  return res;
}
