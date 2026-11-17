import { HELP_URL, LEGAL_ENTITY, SETUP_DAYS, siteOrigin } from "./site";

// Sends through Resend. Does nothing until RESEND_API_KEY is set, so forms keep working without it.
const FROM = process.env.EMAIL_FROM || "DSP Connect <dspsupport@getdspconnect.com>";
// The sending address cannot receive mail, so replies go to a real inbox: REPLY_TO if set, otherwise the first team address.
const REPLY_TO = process.env.REPLY_TO || (process.env.NOTIFY_EMAIL || "").split(",")[0].trim();
export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// The newer key name wins, so replacing a key never needs the old one deleted first.
const apiKey = () => process.env.RESEND_API_KEY_1 || process.env.RESEND_API_KEY;
export const emailOn = () => !!apiKey();

/** Sends one email. Answers whether the mail service accepted it. */
export async function send(to: string, subject: string, html: string, replyTo?: string): Promise<{ ok: boolean; error?: string }> {
  const key = apiKey();
  if (!key || !to) return { ok: false, error: "email is not connected" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: to.split(",").map((t) => t.trim()).filter(Boolean), subject, html, ...(replyTo || REPLY_TO ? { reply_to: replyTo || REPLY_TO } : {}) }),
    });
    if (res.ok) { console.log("email accepted", subject, (await res.json().catch(() => ({}))).id); return { ok: true }; }
    const error = `${res.status} ${await res.text()}`;
    console.error("email failed", error);
    return { ok: false, error };
  } catch (err) {
    console.error("email failed", err);
    return { ok: false, error: String(err) };
  }
}

export const wrap = (body: string) =>
  `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#0B1220;max-width:560px">${body}<p style="color:#5B6577;font-size:13px;margin-top:28px">DSP Connect, a service of ${LEGAL_ENTITY}</p></div>`;

type Lead = Record<string, string | number | null | undefined>;

/** Tells the DSP Connect team about a new sign-up, demo request or agency enquiry. */
export async function notifyTeam(kind: string, lead: Lead) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) return;
  const label = { market_check: "Demo opened", account: "Account sign-up started", agency: "Agency enquiry", paid: "Payment received", intake: "Client sent their setup details" }[kind] || kind;
  const rows = Object.entries(lead)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#5B6577">${esc(k)}</td><td style="padding:4px 0">${esc(String(v))}</td></tr>`)
    .join("");
  await send(to, `${label}: ${lead.business || lead.email || ""}`, wrap(`<p><b>${esc(label)}</b></p><table>${rows}</table>`), typeof lead.email === "string" ? lead.email : undefined);
}

/** Confirms a payment to the client and tells them what happens next. */
export async function confirmPayment(email: string, amount: number, lead?: string) {
  const usd = "$" + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const page = lead ? `${siteOrigin()}/welcome?id=${lead}` : "";
  await send(
    email,
    "Payment received. Your DSP Connect setup has started",
    wrap(
      `<p>Thank you. We have received your ad budget of <b>${usd}</b>.</p>` +
        `<p>Your ads will be live within ${SETUP_DAYS} days. Here is what we do now:</p>` +
        `<ol><li>Create your account and load your budget.</li><li>Place tracking on your website.</li><li>Review your ads.</li><li>Build your audience.</li></ol>` +
        `<p><b>One thing we need from you, within 5 days:</b> your ads (images or video, your logo, and the page people should land on) and the person who can add a small piece of tracking code to your website.</p>` +
        (page ? `<p><a href="${page}" style="display:inline-block;background:#0A4FD6;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:600">Send your details and track your setup</a></p><p>Keep this link. It is your private setup page.</p>` : `<p>Reply to this email with both.</p>`) +
        `<p><b>What you will hear from us:</b> an email each time a setup step is finished, and one when your ads go live. Your login details arrive in separate emails once your account is approved.</p>` +
        `<p>Questions? Reply to this email, or see <a href="${HELP_URL}">our help center</a>.</p>`,
    ),
  );
}
