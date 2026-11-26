import { emailOn, esc, send, wrap } from "./email";
import { ensureAttributes, syncPerson } from "./intercom";
import { secretRpc } from "./server";
import { CHANNELS, planBudget, split, type Plan } from "./plan";
import { BUSINESS_ADDRESS, LEGAL_ENTITY, LOGIN_URL, MIN_BUDGET, SETUP_DAYS, SHARE_PCT, siteOrigin } from "./site";

// The proactive side: emails to clients at each setup step, a weekly account summary,
// low-budget warnings, and a daily list for the team. Every message is recorded in the
// database first, so the same message is never sent twice, however often this runs.

type FeedLead = {
  intake_at?: string | null;
  id: string; email: string; name: string | null; business: string | null; industry: string | null; market: string | null;
  amount_paid: number | null; paid_at: string; setup_due: string | null;
  step_account_at: string | null; step_tracking_at: string | null; step_ads_at: string | null; step_audience_at: string | null; live_at: string | null;
  partner_id: string | null; partner_name: string | null; partner_email: string | null;
  spent_total: number; spent_7d: number; last_spend_day: string | null;
};
type Unpaid = { id: string; email: string; name: string | null; business: string | null; budget: number | null };
type Demo = { id: string; email: string; name: string | null; business: string | null; industry: string | null; market: string | null; days: number; plan?: { id: string; website: string; plan: Plan } | null };
type Agency = { id: string; email: string; name: string | null; business: string | null; days: number };
type Onboarding = {
  id: string; name: string; email: string; status: string; invite_token: string; payouts_ready: boolean; company_name: string | null;
  days_approved: number; days_signed: number | null; days_trained: number | null; trained: boolean; clients: number;
};
type Feed = { today: string; leads: FeedLead[]; unpaid?: Unpaid[]; demo?: Demo[]; agency?: Agency[]; partner_onboarding?: Onboarding[]; applications_waiting?: string[]; pending_commission: number; due_commission: number; partners_not_ready: string[] };
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
      `<p><a href="${origin()}/welcome?id=${l.id}">See your setup progress</a>. Questions? Reply to this email or use the chat on our website.</p>`);
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
  if (!l.live_at && !l.step_ads_at && !l.intake_at && paidDays >= 3 && paidDays <= 10) {
    await deliver(r, l.id, "lead", "need_ads", l.email, "Your campaign brief is the next step",
      hi(l) + `<p>To keep your launch on time, we need your campaign brief. It covers your goals, your customers, the campaigns you want, your ads and your website, so we build the right thing first time.</p>` +
      `<p><a href="${origin()}/welcome?id=${l.id}#brief">Fill in your campaign brief</a>. It takes about ten minutes.</p>` +
      `<p>Stuck on a question? Reply to this email or ask in the chat on your setup page. ${due}</p>`);
  }
  const b = budget(l);
  if (l.live_at && b.low) {
    await deliver(r, l.id, "lead", `low_budget_${Math.round(b.paid)}`, l.email, "Your ad budget is running low",
      hi(l) + `<p>You have <b>${usd(b.left)}</b> of your ${usd(b.paid)} ad budget left.` +
      (b.daysLeft !== null ? ` At your current pace that is about <b>${b.daysLeft} more day${b.daysLeft === 1 ? "" : "s"}</b> of advertising.` : "") + `</p>` +
      `<p>This is for your information. When the budget is used, your ads pause until you decide what to do next. Reply to this email if you have questions.</p>`);
  }
  if (l.partner_id && l.partner_email && paidDays <= 3) {
    await deliver(r, l.id, "lead", "partner_client_paid", l.partner_email, `New client: ${l.business || "a client you referred"} has opened an account`,
      `<p>Hello${l.partner_name ? " " + esc(l.partner_name.split(" ")[0]) : ""},</p><p><b>${esc(l.business || "A client you referred")}</b> has paid and opened a DSP Connect account. They are credited to you.</p>` +
      `<p>We are setting up their account now. ${due.replace("Your ads", "Their ads")} Your commission starts when their ads start spending.</p>`);
  }
}

// Recommendations never include adding money. They are about getting more from the budget already there.
function clientTips(l: FeedLead, today: string): string[] {
  const live = daysSince(l.live_at, today);
  const tips: string[] = [];
  if (live < 14) tips.push(`<b>Leave your ads as they are for now.</b> You are in the first two weeks, when the system is still learning who responds. Changes now reset that learning.`);
  if (live >= 14 && live < 21) tips.push(`<b>Check we are counting the right result.</b> Tell us what a good lead looks like for you (a call, a form, a booking), so we can aim your ads at more of them.`);
  if (live >= 42) tips.push(`<b>Send us fresh ads.</b> Your ads have run for six weeks. Response usually falls once the same people have seen the same ad many times.`);
  if (!tips.length) tips.push(`<b>No action needed this week.</b>`);
  return tips;
}

/** What a Sales Partner should raise with one of their clients, as a consultant would. Never about adding money. */
function partnerAdvice(l: FeedLead, today: string): string[] {
  const out: string[] = [];
  const who = esc(l.business || "the client");
  if (!l.live_at) {
    const left = l.setup_due ? Math.round((Date.parse(l.setup_due) - Date.parse(today)) / 86400000) : null;
    if (!l.step_ads_at) out.push(`Their ads are not approved yet. Ask ${who} for their images or video, logo and the web page people should land on. Missing ads are the most common reason a launch runs late.`);
    if (!l.step_tracking_at) out.push(`Tracking is not on their website yet. Find out who manages the site and introduce that person to us.`);
    if (left !== null && left <= 3) out.push(left < 0 ? `Their launch is ${-left} day${left === -1 ? "" : "s"} late. Call them today so they hear it from you first.` : `Their launch is due in ${left} day${left === 1 ? "" : "s"}. Check nothing is waiting on them.`);
    if (!out.length) out.push(`Setup is on track. Tell them what the first two weeks will look like, so early numbers do not worry them.`);
    return out;
  }
  const live = daysSince(l.live_at, today);
  const b = budget(l);
  if (live < 14) out.push(`They are in the two-week learning period. Set the expectation that results settle after it, and advise against changing ads or audience until then.`);
  if (b.week <= 0 && live >= 3) out.push(`No ad spend is on record for the last 7 days. Check in: their ads may be paused or waiting on approval.`);
  if (live >= 14 && live < 28) out.push(`Ask what counts as a good lead for them, and confirm that is what tracking is counting. Results can only be improved against the right target.`);
  if (live >= 28) out.push(`Book a results review. Walk through which ads and placements bring leads, and agree one change to test over the next two weeks.`);
  if (live >= 42) out.push(`Their ads have run for six weeks. Recommend fresh ads; response usually falls once the same people have seen the same ad many times.`);
  if (!out.length) out.push(`Nothing needs raising this week. A short check-in still helps the relationship.`);
  return out;
}

/** Monday brief for each Sales Partner: every client credited to them, with what to raise. */
async function partnerBriefs(r: Report, f: Feed) {
  const mine = new Map<string, FeedLead[]>();
  for (const l of f.leads) if (l.partner_id && l.partner_email) mine.set(l.partner_id, [...(mine.get(l.partner_id) || []), l]);
  for (const [pid, leads] of mine) {
    const first = leads[0];
    const blocks = leads.map((l) => {
      const b = budget(l);
      const state = l.live_at ? `Live since ${longDay(l.live_at)} · ${usd(b.week)} ad spend in the last 7 days` : `In setup · ${STEPS.filter(([k]) => l[k]).length} of ${STEPS.length} steps done${l.setup_due ? ` · due live ${longDay(l.setup_due)}` : ""}`;
      return `<p style="margin:20px 0 4px"><b>${esc(l.business || l.email)}</b><br><span style="color:#5B6577">${state}</span></p><ul>${partnerAdvice(l, f.today).map((t) => `<li style="margin:4px 0">${t}</li>`).join("")}</ul>`;
    }).join("");
    await deliver(r, pid, "partner", `brief_${f.today}`, first.partner_email!, `Your client brief: ${leads.length} account${leads.length === 1 ? "" : "s"}`,
      `<p>Hello${first.partner_name ? " " + esc(first.partner_name.split(" ")[0]) : ""},</p><p>Here is what to raise with each of your clients this week.</p>${blocks}` +
      `<p>Want help preparing for a client conversation? Use the chat on our website.</p>`);
    await syncPerson({ email: first.partner_email!, name: first.partner_name, role: "sales_partner", extra: { partner_stage: "active", partner_clients: leads.length } });
  }
}

async function weekly(r: Report, l: FeedLead, today: string) {
  const b = budget(l);
  if (!l.live_at || b.week <= 0) return; // no spend on record for the week: the team is told instead
  const tips = clientTips(l, today);
  await deliver(r, l.id, "lead", `weekly_${today}`, l.email, `Your weekly summary: ${usd(b.week)} spent, ${usd(b.left)} left`,
    hi(l) + `<p>Here is your account for the last 7 days.</p>` +
    `<table style="border-collapse:collapse"><tr><td style="padding:4px 16px 4px 0;color:#5B6577">Spent in the last 7 days</td><td><b>${usd(b.week)}</b></td></tr>` +
    `<tr><td style="padding:4px 16px 4px 0;color:#5B6577">Spent in total</td><td>${usd(b.spent)}</td></tr>` +
    `<tr><td style="padding:4px 16px 4px 0;color:#5B6577">Budget left</td><td><b>${usd(b.left)}</b></td></tr>` +
    (b.daysLeft !== null ? `<tr><td style="padding:4px 16px 4px 0;color:#5B6577">Days left at this pace</td><td>About ${b.daysLeft}</td></tr>` : "") + `</table>` +
    `<p><b>What we recommend</b></p><ul>${tips.map((t) => `<li>${t}</li>`).join("")}</ul>` + loginLine() +
    `<p>Questions? Reply to this email or use the chat on our website.</p>`);
}

async function teamDigest(r: Report, f: Feed, extra: string[] = []) {
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
  lines.push(...extra);
  if (Number(f.due_commission) > 0) lines.push(`<b>Approved commission not paid:</b> ${usd(f.due_commission)} is approved and due but was not sent. See the reasons above, or press Pay now in the back office.`);
  if ((f.applications_waiting || []).length) lines.push(`<b>Sales Partner applications to review:</b> ${(f.applications_waiting || []).map(esc).join(", ")}. Approve or decline them in the back office.`);
  for (const n of f.partners_not_ready || []) lines.push(`<b>Payout account missing:</b> ${esc(n)} has commission owed but has not finished Stripe payout setup.`);
  if (!lines.length) return;
  await deliver(r, TEAM, "team", `team_${f.today}`, to, `DSP Connect: ${lines.length} thing${lines.length === 1 ? "" : "s"} need attention today`,
    `<p>Today's list from the back office:</p><ul>${lines.map((x) => `<li style="margin:6px 0">${x}</li>`).join("")}</ul>`);
}

const origin = siteOrigin;

/** One reminder to someone who started opening an account and did not pay. Needs our mailing address, by law. */
async function finishSignup(r: Report, u: Unpaid) {
  if (!BUSINESS_ADDRESS) return;
  await deliver(r, u.id, "lead", "finish_signup", u.email, "Your DSP Connect account is one step from starting",
    `<p>Hello${u.name ? " " + esc(u.name.split(" ")[0]) : ""},</p><p>You started opening a DSP Connect account${u.business ? ` for ${esc(u.business)}` : ""} and stopped before payment. Nothing has been charged.</p>` +
    `<p>If you would like to carry on, your ${SETUP_DAYS}-day setup starts the day your ad budget is paid: <a href="${origin()}/open-account">finish opening your account</a>.</p>` +
    `<p>If you have questions first, ask Fin in the chat on our website or reply to this email. Our <a href="${origin()}/refunds">refund policy</a> explains what happens if you change your mind later.</p>` +
    `<p style="color:#5B6577;font-size:12px;margin-top:28px">This is the only reminder we will send. ${esc(LEGAL_ENTITY)}, ${esc(BUSINESS_ADDRESS)}. <a href="${origin()}/unsubscribe?id=${u.id}">Unsubscribe</a>.</p>`);
}

/**
 * Three short emails to someone who opened the demo and has not started an account: the day after,
 * day 4 and day 10. They stop the moment the person starts an account, enquires as an agency, pays or
 * unsubscribes, and nobody gets more than these three. Needs our mailing address, by law.
 */
async function demoFollowUps(r: Report, d: Demo) {
  if (!BUSINESS_ADDRESS) return;
  const step = d.days >= 10 && d.days <= 15 ? 3 : d.days >= 4 && d.days <= 9 ? 2 : d.days >= 1 && d.days <= 3 ? 1 : 0;
  if (!step) return;
  const hello = `<p>Hello${d.name ? " " + esc(d.name.split(" ")[0]) : ""},</p>`;
  const foot = (last: boolean) => `<p style="color:#5B6577;font-size:12px;margin-top:28px">${last ? "This is the last email we will send about your demo. " : ""}${esc(LEGAL_ENTITY)}, ${esc(BUSINESS_ADDRESS)}. <a href="${origin()}/unsubscribe?id=${d.id}">Unsubscribe</a>.</p>`;
  const where = d.market ? ` in ${esc(d.market)}` : " in your own area";
  // Made an ad plan: the same three emails (same days, same cap, same kinds, so never more than three)
  // are about carrying out their plan instead of the demo in general.
  if (d.plan?.plan) return planFollowUps(r, d, step, hello, foot);
  if (step === 1) {
    await deliver(r, d.id, "lead", "demo_1", d.email, "Your DSP Connect demo is saved",
      hello + `<p>Thanks for opening the DSP Connect demo. It shows what your ads could look like on streaming TV, websites and apps${where}, before you spend anything.</p>` +
      `<p>You can go back to it any time: <a href="${origin()}/demo">open the demo</a>.</p>` +
      `<p>When you are ready, accounts start from a $${MIN_BUDGET} ad budget. We do the setup for you and your ads are live within ${SETUP_DAYS} days. No monthly platform fee, and no long-term contract.</p>` +
      `<p>Have a question first? Reply to this email.</p>` + foot(false));
  } else if (step === 2) {
    await deliver(r, d.id, "lead", "demo_2", d.email, `What happens in the ${SETUP_DAYS} days after you start`,
      hello + `<p>A few people ask what happens between opening an account and seeing their ads run. Here it is, in order:</p>` +
      `<ol><li>Your account is created and your ad budget is loaded.</li><li>Tracking is placed on your website, so visits and leads are counted.</li><li>Your ads are checked and approved.</li><li>Your audience is built, so the ads reach the right people${where}.</li></ol>` +
      `<p>We do all four for you, and you get an email as each one is finished. Your part is one short campaign brief, and approving the campaign plan we send you.</p>` +
      `<p>Before you pay you can read our <a href="${origin()}/terms">terms</a> and <a href="${origin()}/refunds">refund policy</a>. You can cancel at any time.</p>` +
      `<p><a href="${origin()}/open-account">Open your account</a> when you are ready, or reply with a question.</p>` + foot(false));
  } else {
    await deliver(r, d.id, "lead", "demo_3", d.email, "Any questions about your demo?",
      hello + `<p>You looked at the DSP Connect demo a little while ago. If it left you with questions about whether this fits your business, ask them in the chat on our website, any hour, or reply to this email.</p>` +
      `<p>The demo shows the same screens you get: the campaign builder, the SSP endpoints your ads can run on, and reporting by app, site and device.</p>` +
      `<p>If you would rather look again on your own, <a href="${origin()}/demo">the demo is here</a>${d.industry ? ` and there are examples for your industry <a href="${origin()}/industries">here</a>` : ""}.</p>` + foot(true));
  }
}

/** The demo follow-ups for someone who made an ad plan: help them act on it, never pressure. */
async function planFollowUps(r: Report, d: Demo, step: number, hello: string, foot: (last: boolean) => string) {
  const p = d.plan!.plan, budget = planBudget(p);
  const where = d.market ? ` in ${esc(d.market)}` : "";
  const link = `${origin()}/planner?plan=${d.plan!.id}`;
  const host = esc(d.plan!.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""));
  const mix = split(p.channels, budget).map((c) => `<li>${esc(CHANNELS[c.key].name)}: ${c.pct}% ($${c.usd.toLocaleString()}). ${esc(c.role)}</li>`).join("");
  const formats = [...new Set(p.channels.map((c) => CHANNELS[c.key].format))].join(", ");
  const open = `${origin()}/open-account?${new URLSearchParams({ plan: d.plan!.id, budget: String(budget), formats, goals: `${p.goal}: ${p.learned.action}`, ...(d.industry ? { industry: d.industry } : {}), ...(d.market ? { market: d.market } : {}) })}`;
  if (step === 1) {
    await deliver(r, d.id, "lead", "demo_1", d.email, "Your ad plan, and how to see it run",
      hello + `<p>Your ad plan for <b>${host}</b> is saved. Here is the channel mix for your $${budget.toLocaleString()} starting budget:</p><ul>${mix}</ul>` +
      `<p>To see it in action, <a href="${link}">open your plan</a>, choose <b>See it in your demo account</b>, then <b>Build this campaign</b>. The campaign builder fills in from your plan, so you can see exactly what would run.</p>` +
      `<p>Questions about any part of it? Reply to this email or ask in the chat on our website.</p>` + foot(false));
  } else if (step === 2) {
    await deliver(r, d.id, "lead", "demo_2", d.email, "From your ad plan to live ads: what happens next",
      hello + `<p>If you decide to go ahead with your plan, here is what happens, in order:</p>` +
      `<ol><li>You open your account with the plan attached and pay your starting budget.</li><li>Your plan becomes the start of your campaign brief, so there is less to fill in.</li><li>We create your account, place tracking on your website, review your ads and build your audience${where}.</li><li>Your ads go live within ${SETUP_DAYS} days, and you get an email as each step is finished.</li></ol>` +
      `<p>No monthly platform fee. Our fee is included in the price of your ads. No long-term contract; our <a href="${origin()}/refunds">refund policy</a> explains what happens if you change your mind.</p>` +
      `<p>Want the short version? <a href="https://www.youtube.com/watch?v=TTrcrHDkkVo">This one-minute video</a> walks through a plan from start to finish.</p>` +
      `<p><a href="${open}">Open your account with this plan</a> when you are ready. There is no rush: your plan stays saved.</p>` + foot(false));
  } else {
    const qs = p.questions.length ? `<p>Before anything runs, we would confirm a few things with you:</p><ul>${p.questions.map((q) => `<li>${esc(q)}</li>`).join("")}</ul><p>If you know the answers, just reply to this email with them.</p>` : "";
    await deliver(r, d.id, "lead", "demo_3", d.email, "Any questions about your ad plan?",
      hello + `<p>You made an ad plan for <b>${host}</b> a little while ago. A plan is a starting point, and most people have a question or two before acting on it.</p>` + qs +
      `<p>You can also ask in the chat on our website, any hour. <a href="${link}">Your plan is here</a> whenever you want it.</p>` + foot(true));
  }
}

/**
 * Three emails to someone who asked about an agency agreement and has not opened an account: day 2
 * (the team replies personally on day 1), day 6 and day 13. They stop when the person opens an account,
 * pays or unsubscribes. Needs our mailing address, by law.
 */
async function agencyFollowUps(r: Report, a: Agency) {
  if (!BUSINESS_ADDRESS) return;
  const step = a.days >= 13 && a.days <= 16 ? 3 : a.days >= 6 && a.days <= 9 ? 2 : a.days >= 2 && a.days <= 4 ? 1 : 0;
  if (!step) return;
  const hello = `<p>Hello${a.name ? " " + esc(a.name.split(" ")[0]) : ""},</p>`;
  const foot = (last: boolean) => `<p style="color:#5B6577;font-size:12px;margin-top:28px">${last ? "This is the last email we will send about your enquiry. " : ""}${esc(LEGAL_ENTITY)}, ${esc(BUSINESS_ADDRESS)}. <a href="${origin()}/unsubscribe?id=${a.id}">Unsubscribe</a>.</p>`;
  if (step === 1) {
    await deliver(r, a.id, "lead", "agency_1", a.email, "Your DSP Connect agency enquiry",
      hello + `<p>Thanks for asking about an agency agreement${a.business ? ` for ${esc(a.business)}` : ""}. In short: you run your clients' advertising on streaming TV, websites and apps on DSP Connect, your clients stay yours, and you earn ${SHARE_PCT}% of the ad spend you manage.</p>` +
      `<p>The quickest way to see if it fits is the <a href="${origin()}/demo?view=agency">agency demo</a>: your clients, managed spend and your share, on the same screens your clients use.</p>` +
      `<p>Questions? Just reply to this email.</p>` + foot(false));
  } else if (step === 2) {
    await deliver(r, a.id, "lead", "agency_2", a.email, "How agencies run clients on DSP Connect",
      hello + `<p>Here is how it works day to day:</p>` +
      `<ol><li><b>Your clients stay yours.</b> We never contact, bill or sell to them.</li><li><b>One account for all of them.</b> Each client gets their own login, with the access you choose.</li><li><b>We set each client up.</b> Account, tracking, ad review and audience, live within ${SETUP_DAYS} days.</li><li><b>You earn ${SHARE_PCT}% of the ad spend you manage,</b> on top of the fees you already charge.</li></ol>` +
      `<p>Questions about the agreement? Reply to this email or ask in the chat on our website.</p>` + foot(false));
  } else {
    await deliver(r, a.id, "lead", "agency_3", a.email, "Still interested in an agency agreement?",
      hello + `<p>A last note on your agency enquiry. If the timing is not right, no problem: <a href="${origin()}/agencies">the details stay here</a> for when it is.</p>` +
      `<p>Any questions, reply to this email.</p>` + foot(true));
  }
}

/**
 * Helps approved Sales Partners get from approval to their first client, pointing them to the tools for
 * each step: the agreement, payouts, training, then their sales kit, leave-behind and links. A few
 * emails at most, each only while that step is still open. They stop if the partner unsubscribes.
 */
/** Where a Sales Partner is in onboarding, in words Fin can act on: it gives them only the next step. */
function partnerStage(p: Onboarding) {
  if (p.status === "invited") return "approved_needs_to_sign";
  if (!p.payouts_ready) return "signed_needs_payouts";
  if (!p.trained) return "payouts_ready_needs_training";
  return p.clients > 0 ? "active" : "ready_no_clients_yet";
}

async function partnerOnboarding(r: Report, p: Onboarding) {
  await syncPerson({ email: p.email, name: p.name, role: "sales_partner", extra: { partner_stage: partnerStage(p), partner_clients: p.clients } }).catch(() => {});
  if (!BUSINESS_ADDRESS) return;
  const portal = `${origin()}/partner`;
  const hello = `<p>Hello ${esc(p.name.split(" ")[0])},</p>`;
  const foot = `<p style="color:#5B6577;font-size:12px;margin-top:28px">You are getting this because you were approved as a DSP Connect Authorized Sales Partner. ${esc(LEGAL_ENTITY)}, ${esc(BUSINESS_ADDRESS)}. <a href="${origin()}/unsubscribe?partner=${p.id}">Unsubscribe from these reminders</a>.</p>`;
  const help = `<p>Questions? Use the chat in your portal or reply to this email.</p>`;
  const btn = (href: string, label: string) => `<p><a href="${href}" style="display:inline-block;background:#1A14D4;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:600">${label}</a></p>`;
  const tools = `<ul><li><b>Your sales kit:</b> emails to prospects with your links already in them, a first-call script and answers to common questions. <a href="${portal}#kit">Open your sales kit</a></li><li><b>Your leave-behind:</b> a one-page sheet with your own QR code, to print or attach as a PDF.</li><li><b>Your links:</b> the demo and account links that credit clients to you.</li><li><b>Help:</b> the chat in your portal, where Fin can help you prepare for a client conversation.</li></ul>`;

  if (p.status === "invited") {
    const k = p.days_approved >= 6 && p.days_approved <= 8 ? "partner_sign_2" : p.days_approved >= 2 && p.days_approved <= 4 ? "partner_sign_1" : "";
    if (!k) return;
    await deliver(r, p.id, "partner", k, p.email, "Your Sales Partner Agreement is ready to sign",
      hello + `<p>You are approved as a DSP Connect Authorized Sales Partner${p.company_name ? ` for ${esc(p.company_name)}` : ""}. The next step is to read and sign your agreement online. It takes about ten minutes, and you can sign as yourself or for your company.</p>` +
      btn(`${origin()}/partners/join/${p.invite_token}`, "Sign your agreement") +
      `<p>Once it is signed you get your sales kit, your leave-behind and your own client links straight away.</p>` + help + foot);
    return;
  }
  const open: string[] = [];
  if (!p.payouts_ready) open.push(`<li><b>Set up your payouts</b> with Stripe, so commission can reach your bank. <a href="${portal}#pay">Set up payouts</a></li>`);
  if (!p.trained) open.push(`<li><b>Finish the training:</b> six short lessons on the product, the demo, the conversation and the rules. <a href="${portal}#tr">Go to the training</a></li>`);
  if (open.length && p.days_signed !== null) {
    const k = p.days_signed >= 8 && p.days_signed <= 10 ? "partner_setup_2" : p.days_signed >= 3 && p.days_signed <= 5 ? "partner_setup_1" : "";
    if (!k) return;
    await deliver(r, p.id, "partner", k, p.email, open.length > 1 ? "Two steps left before your first client" : "One step left before your first client",
      hello + `<p>Your agreement is signed. Here is what is left:</p><ul>${open.join("")}</ul>` +
      `<p>Your tools are ready in your portal now:</p>` + tools + btn(portal, "Open your portal") + help + foot);
    return;
  }
  if (!open.length && p.clients === 0 && p.days_trained !== null && p.days_trained >= 14 && p.days_trained <= 20) {
    await deliver(r, p.id, "partner", "partner_first_client", p.email, "Ready for your first client?",
      hello + `<p>You are fully set up, and everything you need to bring in your first client is in your portal:</p>` + tools +
      `<p>A simple way to start: pick three business owners you already know, send them the first email from your kit, and walk the first one who replies through the demo.</p>` +
      btn(`${portal}#kit`, "Open your sales kit") + help + foot);
  }
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
export async function runNotices(opts: { lead?: string; weekly?: boolean; extra?: string[] } = {}): Promise<Report> {
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
  if (!opts.lead) for (const u of f.unpaid || []) await finishSignup(r, u).catch((err) => console.error("reminder failed", u.id, err));
  if (!opts.lead) for (const d of f.demo || []) await demoFollowUps(r, d).catch((err) => console.error("demo follow-up failed", d.id, err));
  if (!opts.lead) for (const a of f.agency || []) await agencyFollowUps(r, a).catch((err) => console.error("agency follow-up failed", a.id, err));
  if (!opts.lead) for (const p of f.partner_onboarding || []) await partnerOnboarding(r, p).catch((err) => console.error("partner onboarding failed", p.id, err));
  if (!opts.lead && opts.weekly) await partnerBriefs(r, f);
  if (!opts.lead) await teamDigest(r, f, opts.extra);
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
