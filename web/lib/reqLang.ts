import type { Lang } from "./i18n";
import { secretRpc } from "./server";

/** The language a form or API call was made in: Spanish only when the page said so. */
export const bodyLang = (b: unknown): Lang => ((b as { lang?: unknown } | null)?.lang === "es" ? "es" : "en");
/** The language stored for a person, from a database row or RPC result. */
export const rowLang = (v: unknown): Lang => (v === "es" ? "es" : "en");

/** Records a person's language (see public.set_lang). Never fails the request it is part of. */
export async function setLang(kind: "partner_email" | "member_email" | "strategy" | "lead" | "session" | "signature", ref: string, lang: Lang, hash?: string) {
  try { await secretRpc<boolean>("set_lang", { p_kind: kind, p_ref: ref, p_lang: lang, ...(hash ? { p_hash: hash } : {}) }); }
  catch (err) { console.error("set_lang failed", kind, err); }
}
