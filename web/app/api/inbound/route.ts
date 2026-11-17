import { NextResponse } from "next/server";
import { esc } from "@/lib/email";
import { isUuid, secretRpc } from "@/lib/server";

// Mail sent to our support address arrives at Resend. Resend tells this route, and the route passes
// the message into Intercom so Fin answers it. It is sent from our own address with the customer as
// Reply-To: Intercom then opens the conversation in the customer's name and replies to them directly.
//
// The request body is not trusted. Only the email id is read from it, and the message itself is
// fetched from Resend with our own key, so a made-up request cannot inject mail.

const DOMAIN = "mail.getdspconnect.com";
const FROM = `DSP Connect <hello@${DOMAIN}>`;
const INTERCOM = process.env.INTERCOM_INBOUND_EMAIL || "ruipmz2j@dsp-connect-8d1b02b4a13d.intercom-mail.com";
const TEAM = "00000000-0000-0000-0000-000000000000";
const key = () => process.env.RESEND_API_KEY_2 || process.env.RESEND_API_KEY_1 || process.env.RESEND_API_KEY;

type Received = {
  from?: string; to?: string[]; received_for?: string[]; reply_to?: string[] | string | null; subject?: string;
  html?: string | null; text?: string | null; headers?: Record<string, string> | { name: string; value: string }[] | null;
  attachments?: { filename?: string }[];
};

const addr = (s: string) => (s.match(/<([^>]+)>/)?.[1] || s).trim().toLowerCase();
function header(h: Received["headers"], name: string) {
  if (!h) return "";
  if (Array.isArray(h)) return h.find((x) => x.name?.toLowerCase() === name)?.value || "";
  return Object.entries(h).find(([k]) => k.toLowerCase() === name)?.[1] || "";
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const id = body?.type === "email.received" && typeof body?.data?.email_id === "string" ? body.data.email_id : "";
  if (!isUuid(id)) return NextResponse.json({ ok: true, skipped: "not a received email" });
  const k = key();
  if (!k) return NextResponse.json({ error: "email is not connected" }, { status: 503 });

  const got = await fetch(`https://api.resend.com/emails/receiving/${id}`, { headers: { Authorization: `Bearer ${k}` }, cache: "no-store" });
  if (!got.ok) {
    console.error("inbound: could not read email", id, got.status, await got.text());
    return NextResponse.json({ error: "could not read email" }, { status: got.status === 404 ? 200 : 502 });
  }
  const m = (await got.json()) as Received;
  const sender = addr(m.from || "");
  const replyTo = Array.isArray(m.reply_to) ? m.reply_to[0] : m.reply_to;
  const customer = replyTo ? addr(replyTo) : sender;
  const forUs = [...(m.to || []), ...(m.received_for || [])].some((t) => addr(t).endsWith("@" + DOMAIN));

  // Never pass on our own mail, bounces or automatic replies: that is how mail loops start.
  // Intercom's own mail is let through, because Intercom checks forwarding by emailing this address.
  const auto = header(m.headers, "auto-submitted");
  const skip =
    !forUs ? "not addressed to us"
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer) ? "no sender"
    : /(@|\.)getdspconnect\.com$/.test(customer) ? "our own mail"
    : /^(mailer-daemon|postmaster|no-?reply|donotreply|bounces?)@/.test(customer) ? "automatic sender"
    : (auto && auto.toLowerCase() !== "no") || /bulk|junk|list/i.test(header(m.headers, "precedence")) ? "automatic reply"
    : "";
  if (skip) { console.log("inbound skipped", id, skip); return NextResponse.json({ ok: true, skipped: skip }); }

  const subject = (m.subject || "(no subject)").slice(0, 300);
  // Recorded first, so the same message is never passed on twice if Resend calls again.
  const claim = await secretRpc<string | null>("notice_claim", { p_subject: TEAM, p_type: "team", p_kind: `inbound_${id}`, p_to: INTERCOM, p_title: `Support email passed to Fin: ${subject}` });
  if (!claim) return NextResponse.json({ ok: true, skipped: "already passed on" });

  const files = (m.attachments || []).map((a) => a.filename).filter(Boolean);
  const note = files.length ? `\n\n[Attachments not included: ${files.join(", ")}]` : "";
  const text = (m.text || "").trim();
  const html = m.html || `<div style="white-space:pre-wrap">${esc(text)}</div>`;
  const thread: Record<string, string> = {};
  for (const h of ["in-reply-to", "references"]) { const v = header(m.headers, h); if (v) thread[h === "references" ? "References" : "In-Reply-To"] = v; }
  // Carry the sender's own custom headers across. Intercom marks its forwarding check with one, and
  // some mail systems use them for threading. Headers added in transit by mail servers are left out.
  const all: [string, string][] = !m.headers ? [] : Array.isArray(m.headers) ? m.headers.map((x) => [x.name, x.value] as [string, string]) : Object.entries(m.headers);
  for (const [name, value] of all) {
    const n = (name || "").toLowerCase();
    if (!n.startsWith("x-") || /^x-(ses|amz|resend|spam|google|gm|received|forwarded|original|ms-|microsoft|mailgun|sg-|pm-)/.test(n) || typeof value !== "string" || value.length > 900) continue;
    thread[name] = value;
  }
  if (/intercom/.test(sender)) console.log("inbound: Intercom headers", all.map(([n]) => n).join(", "));

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${k}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM, to: [INTERCOM], reply_to: m.from && !replyTo ? m.from : customer, subject,
      html: html + (note ? `<p style="color:#5B6577">${esc(note.trim())}</p>` : ""), ...(text ? { text: text + note } : {}),
      ...(Object.keys(thread).length ? { headers: thread } : {}),
    }),
  });
  const error = res.ok ? null : `${res.status} ${await res.text()}`;
  await secretRpc("notice_result", { p_id: claim, p_ok: res.ok, p_error: error }).catch(() => {});
  if (!res.ok) { console.error("inbound: pass-on failed", id, error); return NextResponse.json({ error: "pass-on failed" }, { status: 502 }); }
  console.log("inbound passed to Intercom", id);
  return NextResponse.json({ ok: true });
}
