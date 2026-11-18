// One place for the facts every page repeats. Change here, changes everywhere.
// The company behind DSP Connect. Used in footers, emails and partner documents.
export const LEGAL_ENTITY = "Influence Crafters LLC";
export const MIN_BUDGET = 750;
export const SETUP_DAYS = 14;
export const SHARE_PCT = 10;
// Number of ad exchanges reached (owner confirmed 50+, 2026-11-17).
export const EXCHANGES = "50+";
export const INDUSTRIES = [
  "Healthcare", "Legal", "Financial Services", "Automotive", "Real Estate",
  "Home Services", "Franchise", "Hospitality", "Political", "Other",
];
// Where clients log in to the platform. Empty until that is set up; the "Log in" links stay hidden until then.
export const LOGIN_URL = process.env.NEXT_PUBLIC_CLIENT_LOGIN_URL || "";

// Where a visitor books a call with a person.
export const MEETING_URL = process.env.NEXT_PUBLIC_MEETING_URL || "https://calendly.com/carmichaelruss/dsp-connect-onboarding";
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@mail.getdspconnect.com";
// The company's mailing address. Shown in the footer, legal pages and reminder emails once set.
/** Postal address for email footers only. It is not shown on the site. */
export const BUSINESS_ADDRESS = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "";
// When the public pages' content last changed. Update this when page content changes, so search engines
// and AI crawlers recrawl. Used by the sitemap, every page's structured data and llms.txt.
export const SITE_UPDATED = "2026-11-18";
// The date the legal pages were last changed.
export const LEGAL_UPDATED = "November 16, 2026";
// The public help center.
export const HELP_URL = process.env.NEXT_PUBLIC_HELP_URL || "https://help.getdspconnect.com";
// The address links in emails and pages point to: the real site once live, the preview until then.
export const siteOrigin = () =>
  process.env.VERCEL_ENV === "production" || !process.env.VERCEL_BRANCH_URL ? "https://getdspconnect.com" : `https://${process.env.VERCEL_BRANCH_URL}`;
// Today's date where the business is (Arizona), as YYYY-MM-DD. Due dates and daily checks use this, not the server's UTC day.
export const businessToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Phoenix" });
