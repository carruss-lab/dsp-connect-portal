import { NextResponse } from "next/server";
import { COOKIE, session } from "@/lib/partner";
import { secretRpc } from "@/lib/server";

export async function POST(req: Request) {
  const s = await session();
  if (s) await secretRpc("partner_logout", { p_session: s }).catch((err) => console.error("partner logout failed", err));
  const res = NextResponse.redirect(new URL("/partner", req.url), 303);
  res.cookies.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
