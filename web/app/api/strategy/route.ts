import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { chatCookie } from "@/lib/chatId";
import { notifyTeam } from "@/lib/email";
import { syncPerson } from "@/lib/intercom";
import { planSummary, type Plan } from "@/lib/plan";
import { writePlan } from "@/lib/planner";
import { normaliseUrl, scanSite } from "@/lib/scan";
import { isUuid, rest, secretRpc } from "@/lib/server";
import { INDUSTRIES, MIN_BUDGET, siteOrigin } from "@/lib/site";

// The ad planner: reads a business's website and writes a first ad plan, saved against their email so it
// follows them into the demo, the account sign-up, payment, the setup page and the chat.

export const maxDuration = 60;

const PER_EMAIL = 3;
const PER_IP = 10;
const clean = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "We could not read that. Please try again." }, { status: 400 }); }

  const email = clean(body.email).toLowerCase();
  const business = clean(body.business, 120);
  const website = clean(body.website, 300);
  const industry = INDUSTRIES.includes(clean(body.industry, 60)) ? clean(body.industry, 60) : "Other";
  const market = clean(body.market, 120).replace(/[^\p{L}\p{N} ,.'-]/gu, "");
  const source = clean(body.source, 240);
  const partnerCode = /^[A-Za-z0-9]{4,20}$/.test(clean(body.partner_code, 20)) ? clean(body.partner_code, 20).toUpperCase() : null;
  const budget = Math.round(Number(body.budget ?? MIN_BUDGET));
  if (!Number.isFinite(budget) || budget < MIN_BUDGET || budget > 5_000_000) return NextResponse.json({ error: `Please enter a starting budget of $${MIN_BUDGET} or more.` }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (!business) return NextResponse.json({ error: "Please add your business name." }, { status: 400 });
  if (!market) return NextResponse.json({ error: "Please tell us where your customers are." }, { status: 400 });
  const url = normaliseUrl(website);
  if (!url) return NextResponse.json({ error: "Please enter your website address, for example yourbusiness.com." }, { status: 400 });

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  const ipHash = createHash("sha256").update(`${ip}:${process.env.SERVER_SECRET || ""}`).digest("hex").slice(0, 32);
  try {
    const used = await secretRpc<{ email: number; ip: number }>("strategy_count", { p_email: email, p_ip: ipHash });
    if (used.email >= PER_EMAIL || used.ip >= PER_IP) {
      return NextResponse.json({ error: `You have made ${PER_EMAIL} plans today, which is the daily limit. Your plans are saved; ask in the chat if you need another.` }, { status: 429 });
    }
  } catch (err) {
    console.error("strategy count failed", err);
    return NextResponse.json({ error: "The planner is not available right now. Please try again shortly." }, { status: 503 });
  }

  const signals = await scanSite(url.toString());
  const input = { business, website: signals?.url || url.toString(), industry, market, budget };
  const { plan, model } = await writePlan(input, signals);

  let id: string;
  try {
    id = await secretRpc<string>("strategy_save", {
      p_email: email, p_business: business, p_website: input.website, p_industry: industry, p_market: market, p_ip: ipHash,
      p_source: source || null, p_plan: plan, p_signals: signals ? { ...signals, text: signals.text.slice(0, 3000) } : null, p_model: model, p_partner: partnerCode,
    });
  } catch (err) {
    console.error("strategy save failed", err);
    return NextResponse.json({ error: "We wrote your plan but could not save it. Please try again." }, { status: 502 });
  }

  // The plan also counts as a lead, so the team and the chat know about this person.
  const link = `${siteOrigin()}/planner?plan=${id}`;
  await Promise.all([
    rest("leads", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ kind: "market_check", email, business, website: input.website, industry, market, partner_code: partnerCode, source: `planner | ${source}`.slice(0, 240) }) })
      .then(async (r) => { if (!r.ok) console.error("planner lead insert failed", r.status, await r.text()); }).catch((e) => console.error("planner lead insert failed", e)),
    notifyTeam("plan", { email, business, website: input.website, industry, market, budget, plan: planSummary(plan), link, read_website: signals?.reachable ? "yes" : "no", written_by: model }),
    syncPerson({
      email, role: "prospect", status: "lead", industry, market,
      extra: { lead_stage: "ad_plan", monthly_ad_budget: budget, business_name: business, business_website: input.website, ad_plan_url: link, ad_plan_summary: planSummary(plan) },
    }),
  ]);

  const res = NextResponse.json({ ok: true, id, plan, business, website: input.website, industry, market, read: !!signals?.reachable });
  res.cookies.set(chatCookie(email));
  return res;
}

/** A saved plan by its id, for the planner page, the demo and the sign-up form. */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!isUuid(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  try {
    const s = await secretRpc<{ id: string; business: string; website: string; industry: string; market: string; plan: Plan; created_at: string } | null>("strategy_get", { p_id: id });
    if (!s) return NextResponse.json({ error: "not found" }, { status: 404 });
    // Never the email or the raw scan: anyone holding the link sees only the plan.
    return NextResponse.json({ id, business: s.business, website: s.website, industry: s.industry, market: s.market, plan: s.plan, created_at: s.created_at }, { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
  } catch (err) {
    console.error("strategy get failed", err);
    return NextResponse.json({ error: "not available" }, { status: 503 });
  }
}
