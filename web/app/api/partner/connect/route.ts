import { NextResponse } from "next/server";
import { stripe } from "@/lib/payments";
import { isUuid, secretRpc } from "@/lib/server";
import { LEGAL_ENTITY } from "@/lib/site";

type Partner = { id: string; name: string; email: string; status: string; code: string; stripe_account_id: string | null; payouts_ready: boolean };

// Starts (or resumes) a partner's Stripe payout account setup. Bank and tax details go to Stripe, never to us.
export async function POST(req: Request) {
  const { token } = (await req.json().catch(() => ({}))) as { token?: string };
  const client = stripe();
  if (!token || !isUuid(token)) return NextResponse.json({ error: "This invitation link is not valid." }, { status: 400 });
  if (!client) return NextResponse.json({ error: "Payout setup is not connected yet." }, { status: 503 });
  try {
    const [partner] = await secretRpc<Partner[]>("partner_by_token", { p_token: token });
    if (!partner || partner.status === "ended") return NextResponse.json({ error: "This invitation link is not valid." }, { status: 404 });
    let account = partner.stripe_account_id;
    if (!account) {
      const created = await client.accounts.create({
        type: "express", country: "US", email: partner.email, business_type: "individual",
        capabilities: { transfers: { requested: true } },
        business_profile: { product_description: `Independent Managing Partner for DSP Connect (${LEGAL_ENTITY})` },
        metadata: { partner_id: partner.id },
      });
      account = created.id;
      await secretRpc("partner_set_payouts", { p_token: token, p_account: account, p_ready: false });
    }
    const origin = new URL(req.url).origin;
    const link = await client.accountLinks.create({
      account, type: "account_onboarding",
      refresh_url: `${origin}/partners/join/${token}`, return_url: `${origin}/partners/join/${token}?back=1`,
    });
    return NextResponse.json({ url: link.url });
  } catch (err) {
    console.error("partner connect failed", err);
    return NextResponse.json({ error: "We could not start payout setup. Please try again, or contact us." }, { status: 502 });
  }
}
