import { cookies } from "next/headers";
import { secretRpc } from "./server";

// Authorized Sales Partner sign-in. A partner asks for a link by email; the link opens a 30-day session held
// in an httpOnly cookie. Only hashes of the link and the session are stored in the database.
export const COOKIE = "dsp_partner";
export const SESSION_DAYS = 30;

export type Client = {
  id: string; business: string | null; name: string | null; email: string; industry: string | null; market: string | null;
  paid_at: string | null; amount_paid: number | null; setup_due: string | null; live_at: string | null; steps_done: number;
  brief_sent: boolean; spent_total: number; spent_7d: number; earned: number;
};
export type Portal = {
  today: string;
  partner: {
    id: string; name: string; email: string; code: string; status: string; payouts_ready: boolean; stripe_started: boolean; stripe_account_id: string | null;
    invite_token: string; legal_name: string | null; signed_at: string | null; training_done_at: string | null; vertical: string | null;
    entity_type: "individual" | "company"; company_name: string | null; signer_title: string | null; phone: string | null;
  };
  training: string[];
  clients: Client[];
  earnings: { holding: number; ready: number; paid: number; reversed: number; owed: number; next_release: string | null };
  payouts: { amount: number; created_at: string }[];
};

export async function session(): Promise<string> {
  return (await cookies()).get(COOKIE)?.value || "";
}

/** The signed-in partner's portal, or null when nobody is signed in. */
export async function loadPortal(): Promise<Portal | null> {
  const s = await session();
  if (!/^[0-9a-f]{64}$/.test(s)) return null;
  try { return await secretRpc<Portal | null>("partner_portal", { p_session: s }); }
  catch (err) { console.error("partner portal failed", err); return null; }
}

export const clientIp = (req: Request) => (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "";
