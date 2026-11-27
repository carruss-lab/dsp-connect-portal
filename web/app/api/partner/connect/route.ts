import { NextResponse } from "next/server";
import { notifyTeam } from "@/lib/email";
import { stripe } from "@/lib/payments";
import { isUuid, secretRpc } from "@/lib/server";
import { LEGAL_ENTITY, siteOrigin } from "@/lib/site";

type Partner = { id: string; name: string; email: string; status: string; code: string; stripe_account_id: string | null; payouts_ready: boolean; entity_type: string | null; company_name: string | null; lang?: string };

// Starts (or resumes) a partner's Stripe payout account setup. Bank and tax details go to Stripe, never to us.
export async function POST(req: Request) {
  const { token, lang } = (await req.json().catch(() => ({}))) as { token?: string; lang?: string };
  const es = lang === "es";
  const client = stripe();
  const invalid = es ? "Este enlace de invitación no es válido." : "This invitation link is not valid.";
  if (!token || !isUuid(token)) return NextResponse.json({ error: invalid }, { status: 400 });
  if (!client) return NextResponse.json({ error: es ? "La configuración de pagos aún no está conectada." : "Payout setup is not connected yet." }, { status: 503 });
  let who: Partner | undefined;
  try {
    const [partner] = await secretRpc<Partner[]>("partner_by_token", { p_token: token });
    if (!partner || ["ended", "applied", "declined"].includes(partner.status)) return NextResponse.json({ error: invalid }, { status: 404 });
    who = partner;
    let account = partner.stripe_account_id;
    if (!account) {
      // Partners only receive commission, so the account is set up to receive transfers and nothing else.
      // A partner who signed for a company is paid into a business account in the company's name.
      const company = partner.entity_type === "company";
      // Accounts API v1 (Express): the site's Stripe key has Accounts and Account Links permissions.
      const created = await client.accounts.create({
        type: "express", country: "US", email: partner.email, business_type: company ? "company" : "individual",
        ...(company && partner.company_name ? { company: { name: partner.company_name } } : {}),
        capabilities: { transfers: { requested: true } },
        business_profile: { name: company && partner.company_name ? partner.company_name : partner.name, product_description: `Authorized Sales Partner for DSP Connect (${LEGAL_ENTITY})` },
        metadata: { partner_id: partner.id, role: `Authorized Sales Partner for DSP Connect (${LEGAL_ENTITY})` },
      });
      account = created.id;
      await secretRpc("partner_set_payouts", { p_token: token, p_account: account, p_ready: false });
    }
    // Stripe sends the partner back to their portal, which re-checks their payout status on load.
    // Stripe shows its own pages in the language of their browser; they come back to the portal in theirs.
    const portal = `${siteOrigin()}${es || partner.lang === "es" ? "/es" : ""}/partner`;
    const link = await client.accountLinks.create({
      account, type: "account_onboarding", refresh_url: `${portal}?payouts=retry#pay`, return_url: `${portal}?payouts=back#pay`,
    });
    return NextResponse.json({ url: link.url });
  } catch (err) {
    console.error("partner connect failed", err);
    // The team hears about it at once, so a partner is never left stuck at payout setup.
    await notifyTeam("Sales Partner could not start payout setup", {
      name: who?.name, email: who?.email, code: who?.code, error: err instanceof Error ? err.message.slice(0, 300) : String(err).slice(0, 300),
    }).catch(() => {});
    return NextResponse.json({ error: es ? "No pudimos iniciar la configuración de pagos. Inténtelo de nuevo o comuníquese con nosotros." : "We could not start payout setup. Please try again, or contact us." }, { status: 502 });
  }
}
