import { NextResponse } from "next/server";
import { esc, notifyTeam, send, wrap } from "@/lib/email";
import { syncPerson } from "@/lib/intercom";
import { chatCookie } from "@/lib/chatId";
import { stripe } from "@/lib/payments";
import { LEGAL_ENTITY, MIN_BUDGET, PARTNERSTACK_AGENCY_URL, SHARE_PCT, siteOrigin } from "@/lib/site";
import { isUuid, secretRpc } from "@/lib/server";

const KINDS = ["market_check", "account", "agency"] as const;
const clean = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "We could not read that. Please try again." }, { status: 400 });
  }

  const kind = clean(body.kind, 20);
  if (!KINDS.includes(kind as (typeof KINDS)[number])) {
    return NextResponse.json({ error: "Unknown form." }, { status: 400 });
  }
  const email = clean(body.email, 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  let budget: number | null = null;
  if (kind === "account") {
    budget = Number(body.budget);
    if (!Number.isFinite(budget) || budget < MIN_BUDGET) {
      return NextResponse.json(
        { error: `The smallest budget to start with is $${MIN_BUDGET}.` },
        { status: 400 },
      );
    }
    if (!clean(body.business) || !clean(body.name)) {
      return NextResponse.json({ error: "Please add your name and business name." }, { status: 400 });
    }
    if (body.terms !== true) {
      return NextResponse.json({ error: "Please agree to the terms to continue." }, { status: 400 });
    }
  }

  const id = crypto.randomUUID();
  const row = {
    id,
    kind,
    email,
    name: clean(body.name, 120),
    business: clean(body.business, 160),
    phone: clean(body.phone, 40),
    website: clean(body.website, 200),
    industry: clean(body.industry, 60),
    market: clean(body.market, 160),
    budget,
    formats: clean(body.formats, 120),
    goals: clean(body.goals, 2000),
    monthly_spend: clean(body.monthly_spend, 60),
    source: clean(body.source, 240),
    partner_code: clean(body.partner_code, 20).toUpperCase() || null,
  };

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "This form is not connected yet. Please try again shortly." }, { status: 503 });
  }

  const fail = NextResponse.json({ error: "Something went wrong saving your details. Please try again." }, { status: 502 });
  try {
    const res = await fetch(`${url}/rest/v1/leads`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      console.error("lead insert failed", res.status, await res.text());
      return fail;
    }
  } catch (err) {
    console.error("lead insert failed", err);
    return fail;
  }

  // An ad plan they made with the planner travels with the sign-up (only if it belongs to the same email).
  const planId = clean(body.plan, 40);
  let planLinked = false;
  if (isUuid(planId)) {
    planLinked = await secretRpc<boolean>("strategy_link", { p_lead: id, p_strategy: planId }).catch((e) => { console.error("strategy link failed", e); return false; });
  }

  await Promise.all([
    kind === "agency" ? send(email, "Next step: join the DSP Connect agency program", agencyEmail(row.name || "")).catch((e) => console.error("agency email failed", e)) : null,
    notifyTeam(kind, { ...row, id: undefined, ...(planLinked ? { ad_plan: `${siteOrigin()}/planner?plan=${planId}` } : {}) }),
    syncPerson({
      email, name: row.name, role: kind === "agency" ? "agency" : "prospect", status: "lead", industry: row.industry, market: row.market,
      extra: {
        lead_stage: kind === "agency" ? "agency_enquiry" : kind === "account" ? "started_signup" : "opened_demo",
        ...(row.business ? { business_name: row.business } : {}),
        ...(row.website ? { business_website: row.website } : {}),
        ...(budget ? { monthly_ad_budget: budget, sales_qualified: "Yes" } : {}),
        ...(row.goals ? { lead_goal: row.goals.slice(0, 250) } : {}),
        ...(kind === "agency" && row.monthly_spend ? { agency_managed_spend: row.monthly_spend } : {}),
      },
    }),
  ]);

  // Account sign-ups go on to pay their ad budget. If Stripe is not connected yet,
  // the form falls back to its thank-you message.
  const client = kind === "account" && budget ? stripe() : null;
  if (client) {
    try {
      // Always send buyers back to our own address (getdspconnect.com live, the preview while testing).
      const origin = siteOrigin();
      // An ad budget is a prepayment, not a product Stripe sells on our behalf,
      // so Stripe's Managed Payments is switched off for this payment.
      const params = {
        managed_payments: { enabled: false },
        mode: "payment",
        client_reference_id: id,
        customer_email: email,
        // A real Stripe customer (not a guest) with this email: PartnerStack's Stripe app matches
        // customers by email, so the payment is credited to the partner who referred them.
        customer_creation: "always",
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(budget! * 100),
            product_data: { name: "DSP Connect ad budget", description: `Starting ad budget for ${row.business}. Sold by ${LEGAL_ENTITY}.` },
          },
        }],
        metadata: { lead_id: id, ...(planLinked ? { strategy_id: planId } : {}) },
        success_url: `${origin}/open-account/thanks?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/open-account`,
      } as unknown as Parameters<typeof client.checkout.sessions.create>[0];
      const session = await client.checkout.sessions.create(params);
      if (session.url) { const r = NextResponse.json({ ok: true, pay: session.url }); r.cookies.set(chatCookie(email)); return r; }
    } catch (err) {
      console.error("checkout session failed", err);
      return NextResponse.json({ error: "We saved your details but could not open the payment page. Please try again." }, { status: 502 });
    }
  }
  // This browser has now proved who it is, so the chat can recognize them (see lib/chatId.ts).
  const ok = NextResponse.json({ ok: true });
  ok.cookies.set(chatCookie(email));
  return ok;
}

/** Sent once when an agency asks about the program: the one step left is applying on PartnerStack. */
function agencyEmail(name: string) {
  const first = name.trim().split(/\s+/)[0];
  const site = siteOrigin();
  return wrap(
    `<p>${first ? `Hi ${esc(first)},` : "Hi,"}</p>` +
    `<p>Thanks for asking about the DSP Connect agency program. There is one step left: join the program on PartnerStack. That is where you sign up, accept the program terms and set up your payouts.</p>` +
    `<p><a href="${PARTNERSTACK_AGENCY_URL}" style="display:inline-block;background:#0A4FD6;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Join the agency program</a></p>` +
    `<p><b>What happens next</b></p><ol>` +
    `<li>Apply on PartnerStack (about two minutes).</li>` +
    `<li>We reply within one business day to set up your agency account.</li>` +
    `<li>Each client gets their own login. You earn ${SHARE_PCT}% of the ad spend you manage, paid through PartnerStack.</li>` +
    `<li>Have a sales team? Invite your reps from your PartnerStack dashboard. Each gets their own link, every client is tracked to the rep who brought it, and all commission comes to your agency. <a href="https://youtu.be/au5qCF-bXws">Watch how, step by step</a> (1.5 minutes).</li></ol>` +
    `<p>Before then, you can click through the <a href="${site}/demo?view=agency">agency demo</a> or make a free ad plan for a prospect with the <a href="${site}/planner">ad planner</a>.</p>` +
    `<p>Questions? Reply to this email or ask in the chat on the site.</p>`,
  );
}
