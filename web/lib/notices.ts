import { emailOn, esc, send, wrap } from "./email";
import { ensureAttributes, syncPerson } from "./intercom";
import { secretRpc } from "./server";
import { LOGIN_URL, SETUP_DAYS } from "./site";

// The proactive side: emails to clients at each setup step, a weekly account summary,
// low-budget warnings, and a daily list for the team. Every message is recorded in the
// database first, so the same message is never sent twice, however often this runs.

type FeedLead = {
  id: string; email: string; name: string | null; business: string | null; industry: string | null; market: string | null;
  amount_paid: number | null; paid_at: string; setup_due: string | null;
  step_account_at: string | null; step_tracking_at: string | null; step_ads_at: string | null; step_audience_at: string | null; live_at: string | null;
  partner_id: string | null; partner_name: string | null; partner_email: string | null;
  spent_total: number; spent_7d: number; last_spend_day: string | null;
};
type Feed = { today: string; leads: FeedLead[]; pending_commission: number; due_commission: number; partners_not_ready: string[] };
export type Report = { sent: string[]; failed: string[]; emailOn: boolean };

const TEAM = "00000000-0000-0000-0000-000000000000";
const STEPS: [keyof FeedLead, string, string][] = [
  ["step_account_at", "account", "Your account is created and your budget is loaded"],
  ["step_tracking_at", "tracking", "Tracking is in place on your website"],
  ["step_ads_at", "ads", "Your ads are reviewed and approved"],
  ["step_audience_at", "audience", "Your audience is built"],
];
const usd = (v: number) => "$" + Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const longDay = (iso: string) => new Date(iso.slice(0, 10) + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
const daysSince = (iso: string | null, today: string) => (iso ? Math.floor((Date.parse(today + "T23:59:59Z") - Date.parse(iso)) / 86400000) : Infinity);
const hi = (l: FeedLead) => `<p>Hello${l.name ? " " + esc(l.name.split(" ")[0]) : ""},</p>`;
const loginLine = () => (LOGIN_URL.startsWith("http") ? `<p>You can see your results at any time: <a href="${LOGIN_URL}">log in to your account</a>.</p>` : "");

/** Budget facts for one client, worked out from the spend we have on record. */
export function budget(l: FeedLead) {
  const paid = Number(l.amount_paid || 0), spent = Number(l.spent_total || 0), week = Number(l.spent_7d || 0);
  const left = Math.max(0, Math.round((paid - spent) * 100) / 100);
  const perDay = week / 7;
  const daysLeft = perDay > 0 ? Math.floor(left / perDay) : null;
  return { paid, spent, week, left, daysLeft, low: spent > 0 && paid > 0 && left <= paid * 0.25 };
}

async function deliver(r: Report, subject: string, type: "lead" | "partner" | "team", kind: string, to: string, title: string, html: string) {
  if (!emailOn() || !to) return;
  const id = await secretRpc<string | null>("notice_claim", { p_subject: subject, p_type: type, p_kind: kind, p_to: to, p_title: title });
  if (!id) return; // already sent, or being sent right now
  const out = await send(to, title, wrap(html));
  await secretRpc("notice_result", { p_id: id, p_ok: out.ok, p_error: out.error || null });
  (out.ok ? r.sent : r.failed).push(`${title} → ${to}`);
}

function checklist(l: FeedLead) {
  const rows = STEPS.map(([k, , label]) => `<li style="margin:4px 0">${l[k] ? "✅" : "⬜"} ${esc(label)}${l[k] ? "" : " <span style=\"color:#5B6577\">(in progress)</span>"}</li>`).join("");
  return `<ul style="list-style:none;padding:0">${rows}</ul>`;
}

async function clientNotices(r: Report, l: FeedLead, today: string) {
  const done = STEPS.filter(([k]) => l[k]).length;
  const due = l.setup_due ? `Your ads will be live by <b>${longDay(l.setup_due)}</b>.` : `Your ads will be live within ${SETUP_DAYS} days of your payment.`;

  // One email per setup step, sent when the team ticks it off. Old ticks are not mailed late.
  for (const [k, key, label] of STEPS) {
    if (!l[k] || l.live_at || daysSince(l[k] as string, today) > 3) continue;
    await deliver(r, l.id, "lead", `step_${key}`, l.email, `Setup update: ${label.toLowerCase().replace(/^your /, "your ")}`,
      hi(l) + `<p><b>${esc(label)}.</b> That is step ${done} of ${STEPS.length} done.</p>` + checklist(l) + `<p>${done < STEPS.length ? due : "All four steps are done. We are making final checks before your ads go live."}</p>` +
      `<p>Questions? Reply to this email or use the chat on our website.</p>`);
  }
  if (l.live_at && daysSince(l.live_at, today) <= 3) {
    await deliver(r, l.id, "lead", "live", l.email, "Your ads are live",
      hi(l) + `<p><b>Your ads are now live.</b></p>` +
      `<p>What to expect:</p><ul><li>The first two weeks are a learning period. The system is finding the people most likely to respond, so results usually improve after it.</li>` +
      `<li>Every Monday we will email you a short summary of your budget and what, if anything, we recommend.</li>` +
      `<li>We will warn you before your budget runs low, so your ads do not stop without notice.</li></ul>` + loginLine() +
      `<p>Questions? Reply to this email or use the chat on our website.</p>`);
  }
  // A single reminder if we are still waiting on ads three days after payment.
  const paidDays = daysSince(l.paid_at, today);
  if (!l.live_at && !l.step_ads_at && paidDays >= 3 && paidDays <= 10) {
    await deliver(r, l.id, "lead", "need_ads", l.email, "We need your ads to keep your setup on time",
      hi(l) + `<p>To keep your launch on time, we need two things from you:</p>` +
      `<ol><li><b>Your ads.</b> Images or video, plus your logo and the web page people should land on.</li>` +
      `<li><b>Website access.</b> The name and email of the person who can add a small piece of tracking code to your website.</li></ol>` +
      `<p>Reply to this email with both. If you have already sent them, you can ignore this message. ${due}</p>`);
  }
  const b = budget(l);
  if (l.live_at && b.low) {
    await deliver(r, l.id, "lead", `low_budget_${Math.round(b.paid)}`, l.email, "Your ad budget is running low",
      hi(l) + `<p>You have <b>${usd(b.left)}</b> of your ${usd(b.paid)} ad budget left.` +
      (b.daysLeft !== null ? ` At your current pace that is about <b>${b.daysLeft} more day${b.daysLeft === 1 ? "" : "s"}</b> of advertising.` : "") + `</p>` +
      `<p><b>What we recommend:</b> add budget now so your ads keep running without a break. Ads that stop and restart lose some of what the system has learned.</p>` +
      `<p>Reply to this email with the amount you would like to add and we will send you a payment link.</p>`);
  }
  if (l.partner_id && l.partner_email && paidDays <= 3) {
    await deliver(r, l.id, "lead", "partner_client_paid", l.partner_email, `New client: ${l.business || "a client you referred"} has opened an account`,
      `<p>Hello${l.partner_name ? " " + esc(l.partner_name.split(" ")[0]) : ""},</p><p><b>${esc(l.business || "A client you referred")}</b> has paid and opened a DSP Connect account. They are credited to you.</p>` +
      `<p>We are setting up their account now. ${due.replace("Your ads", "Their ads")} Your commission starts when their ads start spending.</p>`);
  }
}

async function weekly(r: Report, l: FeedLead, today: string) {
  const b = budget(l);
  if (!l.live_at || b.week <= 0) return; // no spend on record for the week: the team is told instead
  const tips: string[] = [];
  if (b.daysLeft !== null && b.daysLeft < 14) tips.push(`<b>Add budget this week.</b> At your current pace your budget lasts about ${b.daysLeft} more day${b.daysLeft === 1 ? "" : "s"}. Topping up before it runs out keeps your ads running without a break.`);
  if (daysSince(l.live_at, today) < 14) tips.push(`<b>Leave your ads as they are for now.</b> You are in the first two weeks, when the system is still learning who responds. Changes now reset that learning.`);
  if (!tips.length) tips.push(`<b>No action needed this week.</b> Your budget is on pace.`);
  await deliver(r, l.id, "lead", `weekly_${today}`, l.email, `Your weekly summary: ${usd(b.week)} spent, ${usd(b.left)} left`,
    hi(l) + `<p>Here is your account for the last 7 days.</p>` +
    `<table style="border-collapse:collapse"><tr><td style="padding:4px 16px 4px 0;color:#5B6577">Spent in the last 7 days</td><td><b>${usd(b.week)}</b></td></tr>` +
    `<tr><td style="padding:4px 16px 4px 0;color:#5B6577">Spent in total</td><td>${usd(b.spent)}</td></tr>` +
    `<tr><td style="padding:4px 16px 4px 0;color:#5B6577">Budget left</td><td><b>${usd(b.left)}</b></td></tr>` +
    (b.daysLeft !== null ? `<tr><td style="padding:4px 16px 4px 0;color:#5B6577">Days left at this pace</td><td>About ${b.daysLeft}</td></tr>` : "") + `</table>` +
    `<p><b>What we recommend</b></p><ul>${tips.map((t) => `<li>${t}</li>`).join("")}</ul>` + loginLine() +
    `<p>Questions? Reply to this email or use the chat on our website.</p>`);
}

async function teamDigest(r: Report, f: Feed) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) return;
  const lines: string[] = [];
  for (const l of f.leads) {
    const name = esc(l.business || l.email);
    if (!l.live_at && l.setup_due) {
      const left = Math.round((Date.parse(l.setup_due) - Date.parse(f.today)) / 86400000);
      if (left < 0) lines.push(`<b>LATE:</b> ${name} was due live ${-left} day${left === -1 ? "" : "s"} ago.`);
      else if (left <= 3) lines.push(`<b>Due soon:</b> ${name} must be live in ${left} day${left === 1 ? "" : "s"}.`);
    }
    if (l.live_at) {
      const b = budget(l);
      if (b.low) lines.push(`<b>Low budget:</b> ${name} has ${usd(b.left)} left${b.daysLeft !== null ? ` (about ${b.daysLeft} days)` : ""}.`);
      if (daysSince(l.live_at, f.today) >= 2 && daysSince(l.last_spend_day ? l.last_spend_day + "T00:00:00Z" : null, f.today) > 3) lines.push(`<b>No spend entered:</b> ${name} has no ad spend on record for the last 3 days.`);
    }
  }
  if (Number(f.pending_commission) > 0) lines.push(`<b>Commission to approve:</b> ${usd(f.pending_commission)} is waiting for approval.`);
  if (Number(f.due_commission) > 0) lines.push(`<b>Commission to pay:</b> ${usd(f.due_commission)} is approved and due today.`);
  for (const n of f.partners_not_ready || []) lines.push(`<b>Payout account missing:</b> ${esc(n)} has commission owed but has not finished Stripe payout setup.`);
  if (!lines.length) return;
  await deliver(r, TEAM, "team", `team_${f.today}`, to, `DSP Connect: ${lines.length} thing${lines.length === 1 ? "" : "s"} need attention today`,
    `<p>Today's list from the back office:</p><ul>${lines.map((x) => `<li style="margin:6px 0">${x}</li>`).join("")}</ul>`);
}

/** Keeps Intercom's record of a client current, so Fin answers from the same facts the emails use. */
async function sync(l: FeedLead) {
  const b = budget(l);
  const done = STEPS.filter(([k]) => l[k]).length;
  const extra: Record<string, string | number> = { setup_progress: l.live_at ? "Live" : `${done} of ${STEPS.length} setup steps done` };
  if (l.live_at) {
    extra.went_live = Math.floor(Date.parse(l.live_at) / 1000);
    extra.budget_remaining = b.left; extra.spend_last_7_days = b.week;
    if (b.daysLeft !== null) extra.budget_days_left = b.daysLeft;
  }
  await syncPerson({ email: l.email, name: l.name, role: "client", status: l.live_at ? "live" : "paid_in_setup", setupDue: l.setup_due, industry: l.industry, market: l.market, extra });
}

/**
 * Sends whatever is due. With `lead`, only that client (used right after the team changes something).
 * Without it, every client plus the team list; `weekly` adds the weekly summaries.
 */
export async function runNotices(opts: { lead?: string; weekly?: boolean } = {}): Promise<Report> {
  const r: Report = { sent: [], failed: [], emailOn: emailOn() };
  const f = await secretRpc<Feed>("ops_feed", { p_lead: opts.lead || null });
  if (!opts.lead) await ensureAttributes();
  for (const l of f.leads) {
    try {
      await clientNotices(r, l, f.today);
      if (opts.weekly) await weekly(r, l, f.today);
      await sync(l);
    } catch (err) {
      console.error("notices failed for", l.id, err);
      r.failed.push(`${l.business || l.email}: ${err instanceof Error ? err.message : "error"}`);
    }
  }
  if (!opts.lead) await teamDigest(r, f);
  return r;
}

/** Tells a partner that a commission payment is on its way. */
export async function notifyPayout(partner: { id: string; name: string; email: string }, amount: number, transfer: string) {
  const r: Report = { sent: [], failed: [], emailOn: emailOn() };
  await deliver(r, partner.id, "partner", `payout_${transfer}`, partner.email, `Commission paid: ${usd(amount)}`,
    `<p>Hello ${esc(partner.name.split(" ")[0])},</p><p>We have sent <b>${usd(amount)}</b> in commission to your Stripe payout account. Stripe will deposit it in your bank account on its usual schedule.</p>` +
    `<p>Questions about this payment? Reply to this email.</p>`);
  return r;
}
