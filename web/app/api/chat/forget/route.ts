import { NextResponse } from "next/server";
import { CHAT_COOKIE } from "@/lib/chatId";

/** "Not you?": this browser stops being recognised in the chat. */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CHAT_COOKIE, "", { httpOnly: true, secure: true, path: "/", maxAge: 0 });
  return res;
}
