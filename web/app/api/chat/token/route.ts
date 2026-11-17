import { NextResponse } from "next/server";
import { chatEmail, messengerJwt } from "@/lib/chatId";

export const dynamic = "force-dynamic";

/** The signed Intercom identity for this browser, or {} for an anonymous visitor. */
export async function GET() {
  const email = await chatEmail();
  const jwt = email ? messengerJwt(email) : null;
  return NextResponse.json(jwt ? { jwt, email } : {}, { headers: { "Cache-Control": "no-store" } });
}
