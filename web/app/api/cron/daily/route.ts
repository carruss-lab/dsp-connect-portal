import { NextResponse } from "next/server";
import { runNotices } from "@/lib/notices";

export const maxDuration = 60;

// Runs once a day on a schedule. Sends due client emails and the team's list; on Mondays, the weekly summaries.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "forbidden" }, { status: 401 });
  try {
    const monday = new Date().toLocaleDateString("en-US", { weekday: "short", timeZone: "America/Phoenix" }) === "Mon";
    const out = await runNotices({ weekly: monday });
    console.log("daily notices", JSON.stringify(out));
    return NextResponse.json(out);
  } catch (err) {
    console.error("daily notices failed", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
