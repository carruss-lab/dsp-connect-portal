import Stripe from "stripe";
import { confirmPayment, notifyTeam } from "./email";
import { syncPerson } from "./intercom";
import { runNotices } from "./notices";
import { planSummary, type Plan } from "./plan";
import { secretRpc } from "./server";
import { siteOrigin } from "./site";

export function stripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

/** Marks a sign-up as paid. Safe to call twice: the second call changes nothing. */
export async function markPaid(session: Stripe.Checkout.Session): Promise<"paid" | "pending" | "error"> {
  if (session.payment_status !== "paid") return "pending";
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const secret = process.env.SERVER_SECRET;
  const lead = session.client_reference_id;
  if (!url || !key || !secret || !lead) return "error";
  try {
    const res = await fetch(`${url}/rest/v1/rpc/mark_lead_paid`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_secret: secret, p_lead: lead, p_session: session.id, p_amount: (session.amount_total ?? 0) / 100 }),
    });
    if (!res.ok) {
      console.error("mark_lead_paid failed", res.status, await res.text());
      return "error";
    }
    // The database answers true only the first time a payment is recorded, so emails go out once.
    if ((await res.json()) === true) {
      const amount = (session.amount_total ?? 0) / 100;
      const email = session.customer_details?.email || session.customer_email || "";
      // If they made an ad plan before signing up, the team sees it with the payment.
      const st = await secretRpc<{ strategy_id: string | null; plan: Plan | null; lang?: string } | null>("client_status", { p_lead: lead }).catch(() => null);
      const lang = st?.lang === "es" || session.locale === "es" ? "es" : "en";
      const plan = st?.plan && st.strategy_id ? { ad_plan: `${siteOrigin()}/planner?plan=${st.strategy_id}`, plan_summary: planSummary(st.plan) } : {};
      await Promise.all([
        email ? confirmPayment(email, amount, lead, lang) : Promise.resolve(),
        notifyTeam("paid", { email, amount, sign_up: lead, ...(lang === "es" ? { language: "Spanish" } : {}), ...plan }),
        email ? syncPerson({ email, role: "client", lang, status: "paid_in_setup", setupDue: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10), extra: { lead_stage: "paid" } }) : Promise.resolve(),
      ]);
      await runNotices({ lead }).catch((e) => console.error("notices failed", e));
    }
    return "paid";
  } catch (err) {
    console.error("mark_lead_paid failed", err);
    return "error";
  }
}
