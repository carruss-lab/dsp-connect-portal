import { NextResponse } from "next/server";
import { esc, send, wrap } from "@/lib/email";
import { secretRpc } from "@/lib/server";
import { siteOrigin } from "@/lib/site";

// Emails a one-time sign-in link to a Managing Partner. The answer is the same whether or not the
// email belongs to a partner, so the form cannot be used to find out who is on the program.
export async function POST(req: Request) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  const e = String(email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || e.length > 200) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  try {
    const out = await secretRpc<{ token: string; name: string; email: string } | null>("partner_login_start", { p_email: e });
    if (out?.token) {
      const link = `${siteOrigin()}/partner/auth?t=${out.token}`;
      await send(out.email, "Your DSP Connect partner sign-in link",
        wrap(`<p>Hello ${esc(out.name.split(" ")[0])},</p><p>Here is your link to sign in to the DSP Connect partner portal. It works once, for the next 30 minutes.</p>` +
          `<p><a href="${link}" style="display:inline-block;background:#1A14D4;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:600">Sign in to your portal</a></p>` +
          `<p style="color:#5B6577;font-size:13px">If you did not ask for this, ignore this email. Nobody can sign in without the link.</p>`));
    }
  } catch (err) {
    console.error("partner login failed", err);
    return NextResponse.json({ error: "We could not send the link just now. Please try again in a minute." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
