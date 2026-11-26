import { stripe } from "./payments";
import { welcomeApproved } from "./partnerApproved";
import { secretRpc } from "./server";

/**
 * Asks Stripe whether a partner's payout account can receive money yet, and records it when it can. Stripe's verification
 * is the approval step: once it passes and the agreement is signed, the partner is approved and welcomed automatically.
 */
export async function refreshPayouts(p: { invite_token: string; stripe_account_id?: string | null; payouts_ready: boolean }, account?: string | null): Promise<boolean> {
  const id = account ?? p.stripe_account_id;
  const client = stripe();
  if (p.payouts_ready || !id || !client) return p.payouts_ready;
  try {
    const acct = await client.accounts.retrieve(id);
    const ready = acct.capabilities?.transfers === "active" && !!acct.payouts_enabled;
    if (ready) {
      const approvedNow = await secretRpc<boolean>("partner_set_payouts", { p_token: p.invite_token, p_account: null, p_ready: true });
      if (approvedNow) await welcomeApproved(p.invite_token);
    }
    return ready;
  } catch (err) { console.error("stripe payout check failed", err); return false; }
}
