import { NextResponse } from "next/server";
import { MIN_BUDGET } from "@/lib/site";

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

  const row = {
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
    source: clean(body.source, 120),
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
  return NextResponse.json({ ok: true });
}
