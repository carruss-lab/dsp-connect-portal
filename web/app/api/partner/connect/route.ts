import { NextResponse } from "next/server";
import { stripe } from "@/lib/payments";
import { paidByStripe, partnerCountry } from "@/lib/partnerCountry";
import { isUuid, secretRpc } from "@/lib/server";
import { LEGAL_ENTITY, siteOrigin } from "@/lib/site";

type Partner = { id: string; name: string; email: string; status: string; code: string; stripe_account_id: string | null; payouts_ready: boolean; entity_type: string | null; company_name: string | null };

// Starts (or resumes) a partner's Stripe payout account setup. Bank and tax details go to Stripe, never to us.
export async function POST(req: Request) {
  const { token } = (await req.json().catch(() => ({}))) as { token?: string };
  const client = stripe();
  if (!token || !isUuid(token)) return NextResponse.json({ error: "This invitation link is not valid." }, { status: 400 });
  if (!client) return NextResponse.json({ error: "Payout setup is not connected yet." }, { status: 503 });
  try {
    const [partner] = await secretRpc<Partner[]>("partner_by_token", { p_token: token });
    if (!partner || ["ended", "applied", "declined"].includes(partner.status)) return NextResponse.json({ error: "This invitation link is not valid." }, { status: 404 });
    // Stripe payouts are for partners in the United States; everyone else is paid through PartnerStack.
    if (!paidByStripe(await partnerCountry(token))) return NextResponse.json({ error: "Partners outside the United States are paid through PartnerStack, not Stripe. Your PartnerStack invitation comes by email." }, { status: 400 });
    let account = partner.stripe_account_id;
    if (!account) {
      // Partners only receive commission, so the account is set up to receive transfers and nothing else.
      // A partner who signed for a company is paid into a business account in the company's name.
      const company = partner.entity_type === "company";
      const created = await client.v2.core.accounts.create({
        contact_email: partner.email, display_name: company && partner.company_name ? partner.company_name : partner.name, dashboard: "express",
        identity: { country: "us", entity_type: company ? "company" : "individual" },
        defaults: { responsibilities: { fees_collector: "application", losses_collector: "application" } },
        configuration: { recipient: { capabilities: { stripe_balance: { stripe_transfers: { requested: true } } } } },
        metadata: { partner_id: partner.id, role: `Authorized Sales Partner for DSP Connect (${LEGAL_ENTITY})` },
      });
      account = created.id;
      await secretRpc("partner_set_payouts", { p_token: token, p_account: account, p_ready: false });
    }
    // Stripe sends the partner back to their portal, which re-checks their payout status on load.
    const portal = `${siteOrigin()}/partner`;
    const link = await client.v2.core.accountLinks.create({
      account,
      use_case: { type: "account_onboarding", account_onboarding: { refresh_url: `${portal}?payouts=retry#pay`, return_url: `${portal}?payouts=back#pay` } },
    });
    return NextResponse.json({ url: link.url });
  } catch (err) {
    console.error("partner connect failed", err);
    return NextResponse.json({ error: "We could not start payout setup. Please try again, or contact us." }, { status: 502 });
  }
}
