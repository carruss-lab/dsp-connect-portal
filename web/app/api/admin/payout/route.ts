import { NextResponse } from "next/server";
import { payDue } from "@/lib/payoutRun";
import { authEmail, rest } from "@/lib/server";

// "Pay now" in the back office: pays every approved commission line that has reached its release date.
// The daily job does the same automatically; both use the same code, so nothing can be paid twice.
export async function POST(req: Request) {
  const jwt = (req.headers.get("authorization") || "").replace(/^Bearer /, "");
  if (!jwt) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  try {
    const staff = await rest("rpc/am_i_staff", { method: "POST", body: "{}", jwt });
    if (!staff.ok || (await staff.json()) !== true) return NextResponse.json({ error: "Staff only." }, { status: 403 });
    const by = (await authEmail(jwt)) || "staff";
    const out = await payDue(by);
    if (out.message === "Stripe is not connected.") return NextResponse.json({ error: out.message }, { status: 503 });
    return NextResponse.json(out);
  } catch (err) {
    console.error("payout run failed", err);
    return NextResponse.json({ error: "The payout run failed. Nothing further was sent." }, { status: 500 });
  }
}
