// llms.txt and llms-full.txt: plain-language summaries of the site for AI assistants and answer engines
// (ChatGPT, Claude, Perplexity, Gemini, Copilot). Built from the same facts, questions and comparisons the
// pages use, so the summary and the site can never disagree. Format: https://llmstxt.org
import { CHECKED, COMPARISONS, compareFaq } from "./compare";
import { FACTS } from "./facts";
import { HOME_FAQ, PARTNER_FAQ } from "./faq";
import { INDUSTRY_PAGES } from "./industries";
import { PROFILES, SITE_URL, SLOGAN } from "./seo";
import { EXCHANGES, HELP_URL, LEGAL_ENTITY, MIN_BUDGET, SETUP_DAYS, SHARE_PCT, SITE_UPDATED, SUPPORT_EMAIL } from "./site";
import { VIDEOS } from "./videos";

const qa = (items: readonly (readonly string[])[]) => items.map(([q, a]) => `### ${q}\n${a}`).join("\n\n");
const link = (name: string, path: string, note: string) => `- [${name}](${SITE_URL}${path}): ${note}`;

function head() {
  return `# DSP Connect

> ${SLOGAN} DSP Connect is a programmatic advertising service: ads on streaming TV (connected TV), apps and websites across ${EXCHANGES} ad exchanges, the same kind of buying big brands do through The Trade Desk and Amazon DSP, open to any business from a $${MIN_BUDGET} ad budget. The account, tracking, ads and audience are set up for you, and ads are live within ${SETUP_DAYS} days. No monthly platform fee. Our fee is included in the price of your ads.

Last updated ${SITE_UPDATED}. DSP Connect is a service of ${LEGAL_ENTITY}, based in the United States.

## Key facts
${FACTS.map(([k, v]) => `- **${k}:** ${v}`).join("\n")}

## Main pages
${link("Home", "/", "what DSP Connect is, how it works, the explainer video and common questions")}
${link("About", "/about", "the company and DSP Connect at a glance")}
${link("Open your account", "/open-account", `start online from a $${MIN_BUDGET} ad budget`)}
${link("For agencies", "/agencies", `run client campaigns and earn ${SHARE_PCT}% of the ad spend you manage`)}
${link("Sales Partners", "/partners", `commission-only partner program for ISOs and independent sales reps: ${SHARE_PCT}% of client ad spend, paid daily`)}
${link("Industries", "/industries", "how advertising is set up for each industry, and the rules that apply")}
${link("How we compare", "/compare", "DSP Connect side by side with other advertising platforms")}

## Industries
${INDUSTRY_PAGES.map((i) => link(`Programmatic advertising for ${i.name.toLowerCase()}`, `/industries/${i.slug}`, i.intro)).join("\n")}

## Comparisons (competitor details from public sources, checked ${CHECKED})
${COMPARISONS.map((c) => link(`DSP Connect vs ${c.name}`, `/${c.slug}`, c.intro)).join("\n")}

## Videos
${Object.values(VIDEOS).map((v) => `- [${v.title}](https://www.youtube.com/watch?v=${v.id}): ${v.description}`).join("\n")}

## Contact and profiles
- Email: ${SUPPORT_EMAIL}
- Help center: ${HELP_URL}
${PROFILES.map((u) => `- ${u}`).join("\n")}

## Policies
${link("Client terms", "/terms", "the agreement for advertisers")}
${link("Refund policy", "/refunds", "cancelling and refunds of unspent ad budget")}
${link("Privacy policy", "/privacy", "what information is collected and why")}`;
}

/** The short version: an index of the site with the key facts. */
export function llmsTxt() {
  return `${head()}

## Optional
- [Full text for AI assistants](${SITE_URL}/llms-full.txt): every question answered on the site, each industry page and each comparison in full.
`;
}

/** The long version: everything an assistant needs to answer questions about DSP Connect without visiting each page. */
export function llmsFullTxt() {
  const industries = INDUSTRY_PAGES.map((i) => `### ${i.name} (${SITE_URL}/industries/${i.slug})
${i.headline} ${i.intro}

What tracking counts: ${i.counts.join("; ")}.

Campaigns:
${i.campaigns.map(([t, x]) => `- ${t}: ${x}`).join("\n")}

Rules that apply:
${i.rules.map(([t, x]) => `- ${t}: ${x}`).join("\n")}

${i.faq.map(([q, a]) => `Q: ${q}\nA: ${a}`).join("\n\n")}`).join("\n\n");

  const comparisons = COMPARISONS.map((c) => `### DSP Connect vs ${c.name} (${SITE_URL}/${c.slug})
| Feature | DSP Connect | ${c.name} |
| --- | --- | --- |
${c.rows.map(([f, us, them]) => `| ${f} | ${us} | ${them} |`).join("\n")}

${compareFaq(c).map(([q, a]) => `Q: ${q}\nA: ${a}`).join("\n\n")}`).join("\n\n");

  return `${head()}

## Common questions
${qa(HOME_FAQ)}

## Sales Partner program: questions
${qa(PARTNER_FAQ)}

## Industries in full
${industries}

## Comparisons in full
${c(CHECKED)}
${comparisons}
`;
}

const c = (checked: string) => `Competitor details come from public sources checked in ${checked} and may have changed. Anything that could not be confirmed is stated as "not published".`;
