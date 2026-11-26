"use client";
import { track } from "@vercel/analytics";
import { identify } from "./identify";
import { saveProfile } from "./profile";
import { CHANNELS, planBudget, type SavedPlan } from "./plan";

// The browser side of the ad planner: asks for a plan, remembers it in this browser so the demo and the
// sign-up form can pick it up, and builds the links that carry it on.

const KEY = "dsp_ad_plan";
export const PLAN_STAGES = ["Reading your website", "Finding what you sell and who buys it", "Choosing channels for your budget", "Writing your plan"];

export function rememberPlan(p: SavedPlan) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
}
export function storedPlan(): SavedPlan | null {
  try { const p = JSON.parse(localStorage.getItem(KEY) || "null"); return p?.id && p?.plan ? p : null; } catch { return null; }
}
export async function loadPlan(id: string): Promise<SavedPlan | null> {
  const mine = storedPlan();
  if (mine?.id === id) return mine;
  try {
    const r = await fetch(`/api/strategy?id=${encodeURIComponent(id)}`);
    if (!r.ok) return null;
    const p = (await r.json()) as SavedPlan;
    rememberPlan(p);
    return p;
  } catch {
    return null;
  }
}

export type PlanRequest = { email: string; business: string; website: string; industry: string; market: string; budget?: number };

export async function requestPlan(f: PlanRequest): Promise<SavedPlan> {
  let first = "", partner_code = "";
  try { first = sessionStorage.getItem("first_touch") || ""; partner_code = sessionStorage.getItem("partner_code") || ""; } catch {}
  const res = await fetch("/api/strategy", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...f, partner_code, source: [first, location.pathname].filter(Boolean).join(" > ").slice(0, 240) }),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || "We could not make your plan. Please try again.");
  const saved: SavedPlan = { id: out.id, business: out.business, website: out.website, industry: out.industry, market: out.market, plan: out.plan };
  rememberPlan(saved);
  identify(f.email, null);
  saveProfile({ email: f.email, business: f.business, website: out.website, industry: f.industry, market: f.market, goals: out.plan.goal, budget: String(out.plan.budget || ""), stage: "demo" });
  track("ad_plan_made");
  return saved;
}

/** The demo account, opened on this plan. */
export function demoHref(p: SavedPlan) {
  try { sessionStorage.setItem("demo_ok", "1"); } catch {}
  return `/demo?${new URLSearchParams({ industry: p.industry, market: p.market, plan: p.id })}`;
}
/** The account sign-up form, filled in from this plan. */
export function accountHref(p: SavedPlan) {
  const formats = [...new Set(p.plan.channels.map((c) => CHANNELS[c.key].format))].join(", ");
  return `/open-account?${new URLSearchParams({ plan: p.id, budget: String(planBudget(p.plan)), formats, goals: `${p.plan.goal}: ${p.plan.learned.action}`, industry: p.industry, market: p.market })}`;
}
/** Opens the chat with the plan as the first message. */
export function askAboutPlan(p: SavedPlan) {
  const w = window as Window & { Intercom?: (cmd: string, arg?: string) => void };
  const msg = `I have a question about my ad plan for ${p.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}.`;
  if (w.Intercom) w.Intercom("showNewMessage", msg);
}
