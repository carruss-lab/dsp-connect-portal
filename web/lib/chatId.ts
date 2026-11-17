import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// Proves to Intercom who a visitor is. When someone gives us their email on a form, the server hands
// that browser a signed, httpOnly cookie. The chat later swaps it for a short-lived Intercom JWT, so the
// Messenger only ever logs a browser in as the person who actually submitted the form there. Nobody can
// read another person's chats by typing their email. Does nothing until INTERCOM_MESSENGER_SECRET is set.
export const CHAT_COOKIE = "dsp_chat";
const YEAR = 60 * 60 * 24 * 365;

const b64u = (b: Buffer | string) => Buffer.from(b).toString("base64url");
const mac = (s: string) => createHmac("sha256", process.env.SERVER_SECRET || "").update("chat:" + s).digest("base64url");

/** The cookie that remembers this browser belongs to `email`. Set it on the form's response. */
export function chatCookie(email: string) {
  const e = email.trim().toLowerCase();
  const v = `${b64u(e)}.${mac(e)}`;
  return { name: CHAT_COOKIE, value: v, httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", maxAge: YEAR };
}

/** The email this browser has proved, or null. */
export async function chatEmail(): Promise<string | null> {
  if (!process.env.SERVER_SECRET) return null;
  const v = (await cookies()).get(CHAT_COOKIE)?.value || "";
  const [p, sig] = v.split(".");
  if (!p || !sig) return null;
  const e = Buffer.from(p, "base64url").toString();
  const want = Buffer.from(mac(e)), got = Buffer.from(sig);
  return want.length === got.length && timingSafeEqual(want, got) ? e : null;
}

/** A one-hour Intercom Messenger JWT for this person, or null when Messenger security is not set up. */
export function messengerJwt(email: string, name?: string | null): string | null {
  const secret = process.env.INTERCOM_MESSENGER_SECRET;
  const e = (email || "").trim().toLowerCase();
  if (!secret || !e) return null;
  const now = Math.floor(Date.now() / 1000);
  const head = b64u(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64u(JSON.stringify({ user_id: e, email: e, ...(name ? { name: String(name).slice(0, 120) } : {}), iat: now, exp: now + 3600 }));
  const sig = createHmac("sha256", secret).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${sig}`;
}
