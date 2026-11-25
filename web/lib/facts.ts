// The facts about DSP Connect, stated once. Shown on the About page and in llms.txt, so every place that
// describes the company (to visitors, search engines and AI assistants) says the same thing.
// Only what is true and on the site: no results, ratings or client names.
import { EXCHANGES, MIN_BUDGET, SETUP_DAYS, SHARE_PCT } from "./site";

export const FACTS: [string, string][] = [
  ["What it is", "Programmatic advertising (a demand-side platform service) with done-for-you setup"],
  ["Where ads run", `Streaming TV (connected TV), apps and websites, across ${EXCHANGES} ad exchanges`],
  ["Ad formats", "Video, banner and native ads"],
  ["Minimum ad budget", `$${MIN_BUDGET} to start`],
  ["Time to live", `Within ${SETUP_DAYS} days of payment: account, tracking, ad review and audience set up for you`],
  ["Pricing", "No monthly platform fee. Our fee is included in the price of your ads."],
  ["Contract", "No long-term contract. Cancel any time; unspent ad budget is refunded, less the payment processing fee."],
  ["Reporting", "Your own login with views, clicks and spend, plus tracking on your website that counts leads and sales"],
  ["Agency program", `Agencies earn ${SHARE_PCT}% of the ad spend they manage and keep their client relationships`],
  ["Sales partner program", `Free to join; partners earn ${SHARE_PCT}% of their clients' qualified ad spend. Paid daily through Stripe in the United States, and through PartnerStack in other countries`],
  ["Who it is for", "Business owners, advertising agencies and independent sales partners"],
];
