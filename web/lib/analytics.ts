// Google Analytics events for the steps that matter to the business. Each is also sent as GA's own
// recommended event (generate_lead, purchase) so it can be marked as a key event and used in reports.
type G = (...a: unknown[]) => void;
const g = (): G | undefined => (typeof window !== "undefined" ? (window as unknown as { gtag?: G }).gtag : undefined);

export type LeadKind = "demo" | "account" | "agency" | "sales_partner";
const NAMES: Record<LeadKind, string> = { demo: "demo_opened", account: "signup_started", agency: "agency_enquiry", sales_partner: "partner_application" };

/** A visitor gave us their details: a demo, an account sign-up, an agency enquiry or a partner application. */
export function trackLead(kind: LeadKind) {
  g()?.("event", NAMES[kind]);
  g()?.("event", "generate_lead", { lead_type: kind });
}

/** A client paid their ad budget. Sent once per payment, with its amount. */
export function trackPurchase(id: string, value: number) {
  const key = "ga_purchase_" + id;
  try { if (localStorage.getItem(key)) return; localStorage.setItem(key, "1"); } catch {}
  g()?.("event", "purchase", { transaction_id: id, value, currency: "USD", items: [{ item_name: "Ad budget", price: value, quantity: 1 }] });
}
