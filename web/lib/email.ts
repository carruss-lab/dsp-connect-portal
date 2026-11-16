import { LEGAL_ENTITY, SETUP_DAYS } from "./site";

// Sends through Resend. Does nothing until RESEND_API_KEY is set, so forms keep working without it.
const FROM = process.env.EMAIL_FROM || "DSP Connect <dspsupport@getdspconnect.com>";
export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const emailOn = () => !!process.env.RESEND_API_KEY;

/** Sends one email. Answers whether the mail service accepted it. */
export async function send(to: string, subject: string, html: string, replyTo?: string): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return { ok: false, error: "email is not connected" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: to.split(",").map((t) => t.trim()).filter(Boolean), subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (res.ok) return { ok: true };
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
  const label = { market_check: "Demo opened", account: "Account sign-up started", agency: "Agency enquiry", paid: "Payment received" }[kind] || kind;
  const rows = Object.entries(lead)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#5B6577">${esc(k)}</td><td style="padding:4px 0">${esc(String(v))}</td></tr>`)
    .join("");
  await send(to, `${label}: ${lead.business || lead.email || ""}`, wrap(`<p><b>${esc(label)}</b></p><table>${rows}</table>`), typeof lead.email === "string" ? lead.email : undefined);
}

/** Confirms a payment to the client and tells them what happens next. */
export async function confirmPayment(email: string, amount: number) {
  const usd = "$" + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  await send(
    email,
    "Payment received. Your DSP Connect setup has started",
    wrap(
      `<p>Thank you. We have received your ad budget of <b>${usd}</b>.</p>` +
        `<p>Your ads will be live within ${SETUP_DAYS} days. Here is what we do now:</p>` +
        `<ol><li>Create your account and load your budget.</li><li>Place tracking on your website.</li><li>Review your ads.</li><li>Build your audience.</li></ol>` +
        `<p>We will email you at each step. To speed things up, reply to this email with your ads (images or video) and who can add a small piece of tracking code to your website.</p>`,
    ),
  );
}
