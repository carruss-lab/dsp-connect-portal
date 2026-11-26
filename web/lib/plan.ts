import { MIN_BUDGET } from "./site";

// The ad plan the planner writes from a prospect's website. Shared by the server (which writes it),
// the planner page, the demo account (which turns it into a campaign) and the setup page.

export const CHANNELS = {
  ctv: { name: "Streaming TV (CTV)", icon: "live_tv", format: "Video", devices: ["Connected TV", "Set Top Box"] },
  video: { name: "Online video", icon: "smart_display", format: "Video", devices: ["Mobile", "Desktop", "Tablet"] },
  display: { name: "Display", icon: "image", format: "Banner", devices: ["Mobile", "Desktop", "Tablet"] },
  native: { name: "Native", icon: "article", format: "Native", devices: ["Mobile", "Desktop", "Tablet"] },
  retargeting: { name: "Retargeting", icon: "sync", format: "Banner", devices: ["Mobile", "Desktop", "Tablet"] },
} as const;
export type ChannelKey = keyof typeof CHANNELS;
export const GOAL_OPTIONS = ["Awareness", "Website visits", "Conversions"] as const;
export const TAXONOMIES = ["IAB1 Arts & Entertainment", "IAB3 Business", "IAB5 Education", "IAB7 Health & Fitness", "IAB8 Food & Drink", "IAB10 Home & Garden", "IAB12 News", "IAB13 Personal Finance", "IAB17 Sports", "IAB19 Technology & Computing", "IAB20 Travel", "IAB21 Real Estate"];

export type PlanChannel = { key: ChannelKey; share: number; role: string; why: string; ads: string };
export type Plan = {
  /** The starting ad budget the visitor entered (MIN_BUDGET or more). */
  budget?: number;
  /** False when the website could not be read and the plan rests on what the visitor told us. */
  siteRead?: boolean;
  headline: string;
  learned: { offer: string; customer: string; area: string; action: string; notes: string[] };
  goal: (typeof GOAL_OPTIONS)[number];
  goalWhy: string;
  channels: PlanChannel[];
  targeting: { locations: string[]; ages: string; interests: string[]; audiences: string[]; exclude: string[] };
  tracking: { action: string; steps: string[] };
  creative: { format: string; spec: string; message: string }[];
  launch: string[];
  questions: string[];
};
export type SavedPlan = { id: string; business: string; website: string; industry: string; market: string; plan: Plan; created_at?: string };

/** The plan's starting budget: what the visitor entered, never below the minimum. */
export const planBudget = (p: Plan) => (p.budget && p.budget >= MIN_BUDGET ? p.budget : MIN_BUDGET);

/** Dollars for each channel out of a starting budget, rounded to $5, adding up exactly. */
export function split(channels: PlanChannel[], budget = MIN_BUDGET) {
  const total = channels.reduce((t, c) => t + c.share, 0) || 1;
  const out = channels.map((c) => ({ ...c, pct: Math.round((c.share / total) * 100), usd: Math.round((budget * c.share) / total / 5) * 5 }));
  const drift = budget - out.reduce((t, c) => t + c.usd, 0);
  if (out.length) out[0].usd += drift;
  return out;
}

/** The first campaign of a plan, as the demo's campaign builder fills it in. */
export function builderPreset(p: Plan, market: string) {
  const first = [...p.channels].sort((a, b) => b.share - a.share)[0];
  const ch = first ? CHANNELS[first.key] : CHANNELS.display;
  return {
    name: `${ch.name} · ${p.learned.offer}`.slice(0, 60),
    goal: p.goal,
    format: ch.format,
    geo: p.targeting.locations[0] || (market === "your area" ? "" : market),
    devices: [...ch.devices],
    taxonomies: p.targeting.interests.filter((t) => TAXONOMIES.includes(t)),
    spend: String(planBudget(p)),
  };
}
export type BuilderPreset = ReturnType<typeof builderPreset>;

/** One line about a plan, for the team's email and Intercom. */
export const planSummary = (p: Plan) =>
  `$${planBudget(p).toLocaleString()} budget. ${p.goal}: ${split(p.channels, planBudget(p)).map((c) => `${CHANNELS[c.key].name} ${c.pct}%`).join(", ")}. ${p.headline}`.slice(0, 250);
