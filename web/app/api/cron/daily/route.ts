import { NextResponse } from "next/server";
import { runNotices } from "@/lib/notices";
import { dailyPayouts, type PayoutResult } from "@/lib/payoutRun";

export const maxDuration = 60;

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** What the payout run did, as lines for the team's daily email. */
function payoutLines(p: PayoutResult): string[] {
  const out: string[] = [];
  if (p.paid.length) out.push(`<b>Commission paid automatically:</b> ${p.paid.map((x) => `${esc(x.partner)} ${usd(x.amount)}`).join(", ")}.`);
  for (const h of p.held || []) out.push(`<b>Commission held for you to approve:</b> ${esc(h.partner)} ${usd(Number(h.amount))}. ${esc(h.reason)}`);
  for (const s of p.skipped) out.push(`<b>Commission not sent:</b> ${esc(s.partner)}. ${esc(s.reason)}`);
  return out;
}

// Runs once a day on a schedule (8:00 Arizona time). First the payout rule: approve what qualifies and pay
// what is due through Stripe. Then due client emails and the team's list; on Mondays, the weekly summaries.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "forbidden" }, { status: 401 });
  let payouts: PayoutResult | null = null;
  let extra: string[] = [];
  try {
    payouts = await dailyPayouts();
    extra = payoutLines(payouts);
    console.log("daily payouts", JSON.stringify(payouts));
  } catch (err) {
    console.error("daily payouts failed", err);
    extra = ["<b>The automatic payout run failed today.</b> Nothing further was sent. Check the back office and press Pay now if anything is due."];
  }
  try {
    const monday = new Date().toLocaleDateString("en-US", { weekday: "short", timeZone: "America/Phoenix" }) === "Mon";
    const out = await runNotices({ weekly: monday, extra });
    console.log("daily notices", JSON.stringify(out));
    return NextResponse.json({ payouts, notices: out });
  } catch (err) {
    console.error("daily notices failed", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
