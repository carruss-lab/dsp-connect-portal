// One place for the facts every page repeats. Change here, changes everywhere.
// The company behind DSP Connect. Used in footers, emails and partner documents.
export const LEGAL_ENTITY = "Influence Crafters LLC";
export const MIN_BUDGET = 750;
export const SETUP_DAYS = 14;
export const SHARE_PCT = 10;
// Confirm with the platform provider before launch.
export const EXCHANGES = "50+";
export const INDUSTRIES = [
  "Healthcare", "Legal", "Financial Services", "Automotive", "Real Estate",
  "Home Services", "Franchise", "Hospitality", "Political", "Other",
];
export const LOGIN_URL = process.env.NEXT_PUBLIC_CLIENT_LOGIN_URL || "/open-account";

// Where a visitor books a call with a person.
export const MEETING_URL = process.env.NEXT_PUBLIC_MEETING_URL || "https://calendly.com/carmichaelruss/dsp-connect-onboarding";
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@mail.getdspconnect.com";
// The company's mailing address. Shown in the footer, legal pages and reminder emails once set.
export const BUSINESS_ADDRESS = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "";
// The date the legal pages were last changed.
export const LEGAL_UPDATED = "November 16, 2026";
