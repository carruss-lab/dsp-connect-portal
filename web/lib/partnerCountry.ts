import { secretRpc } from "./server";

/**
 * The country a partner applied from (two-letter code), or null if it can't be read.
 * Partners who applied before the country question are treated as United States by the database.
 * US partners set up payouts with Stripe; partners anywhere else are paid through PartnerStack.
 */
export async function partnerCountry(token: string): Promise<string | null> {
  try { return (await secretRpc<string | null>("partner_country_by_token", { p_token: token })) || null; }
  catch (err) { console.error("partner country lookup failed", err); return null; }
}

export const paidByStripe = (country: string | null) => country === null || country === "US";
