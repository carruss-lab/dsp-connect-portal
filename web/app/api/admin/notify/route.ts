import { NextResponse } from "next/server";
import { runNotices } from "@/lib/notices";
import { isUuid, rest } from "@/lib/server";

export const maxDuration = 60;

// Staff only. With a client id: sends that client's due emails now (used after a setup step is ticked).
// Without one: runs the full daily check on demand.
export async function POST(req: Request) {
  const jwt = (req.headers.get("authorization") || "").replace(/^Bearer /, "");
  if (!jwt) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  try {
    const staff = await rest("rpc/am_i_staff", { method: "POST", body: "{}", jwt });
    if (!staff.ok || (await staff.json()) !== true) return NextResponse.json({ error: "Staff only." }, { status: 403 });
    const { lead, weekly } = (await req.json().catch(() => ({}))) as { lead?: string; weekly?: boolean };
    if (lead && !isUuid(lead)) return NextResponse.json({ error: "Unknown client." }, { status: 400 });
    return NextResponse.json(await runNotices(lead ? { lead } : { weekly: !!weekly }));
  } catch (err) {
    console.error("notify failed", err);
    return NextResponse.json({ error: "Could not send. Nothing was lost; it will be retried on the next daily run." }, { status: 500 });
  }
}
