// Two languages. English keeps the plain addresses (/partners); Spanish lives under /es (/es/partners).
// proxy.ts rewrites plain addresses to /en internally, so every page sits under app/[lang].
export type Lang = "en" | "es";
export const LANGS: Lang[] = ["en", "es"];
export const isLang = (v: unknown): v is Lang => v === "en" || v === "es";
export const asLang = (v: unknown): Lang => (v === "es" ? "es" : "en");

/** Pick the text for a language: t(lang)("Open your account", "Abra su cuenta"). */
export const tr = (lang: Lang) => (en: string, es: string) => (lang === "es" ? es : en);
/** Pick any value for a language. */
export const pick = <T,>(lang: Lang, v: { en: T; es: T }): T => v[lang];

/** The public address of a page in a language: "/partners" -> "/es/partners". */
export function localePath(path: string, lang: Lang): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const bare = stripLang(path);
  if (lang === "en") return bare;
  return bare === "/" ? "/es" : `/es${bare}`;
}
/** "/es/partners" -> "/partners". */
export function stripLang(path: string): string {
  if (path === "/es" || path === "/en") return "/";
  if (path.startsWith("/es/") || path.startsWith("/es?") || path.startsWith("/es#")) return path.slice(3);
  if (path.startsWith("/en/") || path.startsWith("/en?") || path.startsWith("/en#")) return path.slice(3);
  return path;
}
/** Paths that are never translated (APIs, back office, files). */
export const UNTRANSLATED = /^\/(api|admin|og|_next|_vercel|robots\.txt|sitemap\.xml|llms|favicon|icon|apple-icon|video\/|brand\/|.*\.[a-z0-9]{2,5}$)/i;

// Industry and country names stay in English as stored values (forms, the demo, the database);
// these give the Spanish label to show.
export const INDUSTRY_ES: Record<string, string> = {
  Healthcare: "Salud", Legal: "Legal", "Financial Services": "Servicios financieros", Automotive: "Automotriz",
  "Real Estate": "Bienes raíces", "Home Services": "Servicios para el hogar", Franchise: "Franquicias",
  Hospitality: "Hotelería y restaurantes", Political: "Política", Other: "Otra",
};
export const COUNTRY_ES: Record<string, string> = {
  "United Kingdom": "Reino Unido", Canada: "Canadá", Australia: "Australia", Ireland: "Irlanda", "New Zealand": "Nueva Zelanda",
  "South Africa": "Sudáfrica", Nigeria: "Nigeria", Kenya: "Kenia", Ghana: "Ghana", Jamaica: "Jamaica",
  "Trinidad and Tobago": "Trinidad y Tobago", Singapore: "Singapur", "United States": "Estados Unidos",
};
export const industryName = (name: string, lang: Lang) => (lang === "es" ? INDUSTRY_ES[name] || name : name);
export const countryName = (name: string, lang: Lang) => (lang === "es" ? COUNTRY_ES[name] || name : name);
