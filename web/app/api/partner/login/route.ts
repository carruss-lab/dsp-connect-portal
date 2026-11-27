import { NextResponse } from "next/server";
import { button, esc, send, wrap } from "@/lib/email";
import { bodyLang, rowLang, setLang } from "@/lib/reqLang";
import { secretRpc } from "@/lib/server";
import { siteOrigin } from "@/lib/site";

// Emails a one-time sign-in link to an Authorized Sales Partner. The answer is the same whether or not the
// email belongs to a partner, so the form cannot be used to find out who is on the program.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; lang?: string };
  const asked = bodyLang(body);
  const e = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || e.length > 200) return NextResponse.json({ error: asked === "es" ? "Escriba un correo electrónico válido." : "Please enter a valid email address." }, { status: 400 });
  try {
    const out = await secretRpc<{ token: string; name: string; email: string; lang?: string } | null>("partner_login_start", { p_email: e });
    if (out?.token) {
      // Asking from the Spanish portal switches them to Spanish; otherwise they keep the language they have.
      const lang = asked === "es" ? "es" : rowLang(out.lang);
      if (asked === "es" && out.lang !== "es") { await setLang("partner_email", e, "es"); await setLang("member_email", e, "es"); }
      const link = `${siteOrigin()}/partner/auth?t=${out.token}${lang === "es" ? "&lang=es" : ""}`;
      if (lang === "es") await send(out.email, "Su enlace para iniciar sesión como socio de DSP Connect",
        wrap(`<p>Hola, ${esc(out.name.split(" ")[0])}:</p><p>Aquí está su enlace para iniciar sesión en el portal de socios de DSP Connect. Funciona una sola vez, durante los próximos 30 minutos.</p>` +
          button(link, "Iniciar sesión en su portal") +
          `<p style="color:#5B6577;font-size:13px">Si usted no lo pidió, ignore este correo. Nadie puede iniciar sesión sin el enlace.</p>`, "es"));
      else await send(out.email, "Your DSP Connect partner sign-in link",
        wrap(`<p>Hello ${esc(out.name.split(" ")[0])},</p><p>Here is your link to sign in to the DSP Connect partner portal. It works once, for the next 30 minutes.</p>` +
          `<p><a href="${link}" style="display:inline-block;background:#1A14D4;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:600">Sign in to your portal</a></p>` +
          `<p style="color:#5B6577;font-size:13px">If you did not ask for this, ignore this email. Nobody can sign in without the link.</p>`));
    }
  } catch (err) {
    console.error("partner login failed", err);
    return NextResponse.json({ error: asked === "es" ? "No pudimos enviar el enlace en este momento. Inténtelo de nuevo en un minuto." : "We could not send the link just now. Please try again in a minute." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
