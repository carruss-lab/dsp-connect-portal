import { lang as rootLang } from "next/root-params";
import { asLang, type Lang } from "./i18n";

/** The language of the page being rendered (Server Components only). */
export async function getLang(): Promise<Lang> {
  try { return asLang(await rootLang()); } catch { return "en"; }
}
