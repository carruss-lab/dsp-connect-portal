import { stripe } from "./payments";
import { secretRpc } from "./server";

/** Asks Stripe whether a partner's payout account can receive money yet, and records it when it can. */
export async function refreshPayouts(p: { invite_token: string; stripe_account_id?: string | null; payouts_ready: boolean }, account?: string | null): Promise<boolean> {
  const id = account ?? p.stripe_account_id;
  const client = stripe();
  if (p.payouts_ready || !id || !client) return p.payouts_ready;
  try {
    const acct = await client.v2.core.accounts.retrieve(id, { include: ["configuration.recipient"] });
    const ready = acct.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status === "active";
    if (ready) await secretRpc("partner_set_payouts", { p_token: p.invite_token, p_account: null, p_ready: true });
    return ready;
  } catch (err) { console.error("stripe payout check failed", err); return false; }
}
