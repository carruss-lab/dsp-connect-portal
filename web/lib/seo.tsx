import type { Metadata } from "next";
import { EXCHANGES, HELP_URL, LEGAL_ENTITY, MIN_BUDGET, SETUP_DAYS, SHARE_PCT, SITE_UPDATED, SUPPORT_EMAIL } from "./site";

// The public address of the site. Search engines are told this is the one true address of every page.
export const SITE_URL = "https://getdspconnect.com";

// ─── Structured data ─────────────────────────────────────────────────────────────────────────────
// Every public page carries ONE connected graph (schema.org JSON-LD): the organization, the website,
// the page itself, its breadcrumb, and whatever the page is about. Nodes point at each other by @id,
// so search engines and AI assistants read the site as one entity, not a pile of separate snippets.
// Only state what is true on the page. Never add ratings, reviews, prices or claims the page does not show.

type Node = Record<string, unknown>;
const ref = (id: string) => ({ "@id": id });
export const ID = {
  org: `${SITE_URL}/#org`,
  site: `${SITE_URL}/#site`,
  logo: `${SITE_URL}/#logo`,
  ads: `${SITE_URL}/#service`,
  agency: `${SITE_URL}/agencies#program`,
  partner: `${SITE_URL}/partners#program`,
  about: `${SITE_URL}/about#webpage`,
};

// The company's official profiles. AI assistants and search engines use these to confirm that the site,
// the YouTube channel and the LinkedIn page are one company. Add a profile here only once it is live.
export const PROFILES = [
  "https://www.youtube.com/@getdspconnect",
  "https://www.youtube.com/channel/UCYuwOdcS5rS17WtQZRqBFug",
  "https://www.linkedin.com/company/getdspconnect",
];
export const SLOGAN = "Enterprise programmatic advertising. Without the enterprise contract.";

/** One <script type="application/ld+json"> for the page. */
export function JsonLd({ data }: { data: Node | Node[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export const ORG: Node = {
  "@type": "Organization", "@id": ID.org, name: "DSP Connect", alternateName: ["getdspconnect", "Get DSP Connect"], legalName: LEGAL_ENTITY, url: SITE_URL,
  slogan: SLOGAN, sameAs: PROFILES,
  logo: { "@type": "ImageObject", "@id": ID.logo, url: `${SITE_URL}/logo.png`, contentUrl: `${SITE_URL}/logo.png`, caption: "DSP Connect" },
  image: ref(ID.logo),
  description: `Enterprise programmatic advertising without the enterprise contract: streaming TV, apps and websites for business owners and agencies, with done-for-you setup. Live within ${SETUP_DAYS} days.`,
  email: SUPPORT_EMAIL,
  areaServed: { "@type": "Country", name: "United States" },
  knowsAbout: [
    "Programmatic advertising", "Demand-side platforms (DSP)", "Connected TV (CTV) advertising", "Streaming TV advertising",
    "Over-the-top (OTT) advertising", "Real-time bidding", "Retargeting", "Geofencing and location targeting",
    "Display advertising", "Video advertising", "Native advertising", "Local business advertising", "Conversion tracking",
  ],
  contactPoint: [
    { "@type": "ContactPoint", contactType: "customer support", email: SUPPORT_EMAIL, url: HELP_URL, areaServed: "US", availableLanguage: "English" },
    { "@type": "ContactPoint", contactType: "sales", email: SUPPORT_EMAIL, url: `${SITE_URL}/open-account`, areaServed: "US", availableLanguage: "English" },
    { "@type": "ContactPoint", contactType: "partner program", email: SUPPORT_EMAIL, url: `${SITE_URL}/partners`, areaServed: "US", availableLanguage: "English" },
  ],
};

const WEBSITE: Node = {
  "@type": "WebSite", "@id": ID.site, url: SITE_URL, name: "DSP Connect", alternateName: "getdspconnect.com", inLanguage: "en-US",
  description: `Programmatic advertising on streaming TV, apps and websites across ${EXCHANGES} ad exchanges, open to any business from a $${MIN_BUDGET} ad budget.`,
  publisher: ref(ID.org),
};

/** What advertisers buy. */
export const ADS_SERVICE: Node = {
  "@type": "Service", "@id": ID.ads, name: "Programmatic advertising with done-for-you setup", serviceType: "Programmatic advertising",
  provider: ref(ID.org), brand: ref(ID.org), areaServed: { "@type": "Country", name: "United States" }, url: `${SITE_URL}/`,
  audience: [{ "@type": "BusinessAudience", name: "Business owners" }, { "@type": "BusinessAudience", name: "Advertising agencies" }],
  description: `Programmatic advertising on streaming TV, apps and websites, open to any business without an enterprise contract. We set up the account, tracking, ads and audience, and ads are live within ${SETUP_DAYS} days of payment.`,
  offers: {
    "@type": "Offer", url: `${SITE_URL}/open-account`, priceCurrency: "USD", availability: "https://schema.org/InStock", seller: ref(ID.org),
    priceSpecification: { "@type": "PriceSpecification", minPrice: MIN_BUDGET, priceCurrency: "USD", description: `Minimum starting ad budget of $${MIN_BUDGET}. No monthly platform fee.` },
  },
};

/** The agency revenue-share program. */
export const AGENCY_PROGRAM: Node = {
  "@type": "Service", "@id": ID.agency, name: "DSP Connect agency program", serviceType: "Advertising platform for agencies",
  provider: ref(ID.org), url: `${SITE_URL}/agencies`, areaServed: { "@type": "Country", name: "United States" },
  audience: { "@type": "BusinessAudience", name: "Advertising and marketing agencies" },
  description: `Agencies run their clients' advertising on DSP Connect and earn ${SHARE_PCT}% of the ad spend they manage. Each client is set up within ${SETUP_DAYS} days.`,
  isRelatedTo: ref(ID.ads),
};

/** The Authorized Sales Partner program. Free to join, commission only. */
export const PARTNER_PROGRAM: Node = {
  "@type": "Service", "@id": ID.partner, name: "DSP Connect Authorized Sales Partner program", alternateName: "DSP Connect Sales Partner program",
  serviceType: "Independent sales partner program", provider: ref(ID.org), url: `${SITE_URL}/partners`,
  areaServed: { "@type": "Country", name: "United States" },
  audience: { "@type": "BusinessAudience", name: "ISOs, merchant-services agents and independent sales representatives who call on local businesses" },
  description: `Independent individuals and companies refer local businesses to DSP Connect and earn ${SHARE_PCT}% of their clients' qualified ad spend, with residuals for as long as the client's account is open. Commission only; no fee to join.`,
  isRelatedTo: ref(ID.ads),
  offers: {
    "@type": "Offer", url: `${SITE_URL}/partners#apply`, price: 0, priceCurrency: "USD", availability: "https://schema.org/InStock", seller: ref(ID.org),
    description: `Free to apply and join. Commission of ${SHARE_PCT}% of qualified client ad spend.`,
  },
};

type PageType = "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage" | "ItemPage";

/**
 * The full graph for one public page.
 * path: the page's address ("/partners"); trail: breadcrumb from Home; main: what the page is mainly about;
 * faq: questions shown on the page; items: links listed on a hub page; nodes: any further nodes.
 */
export function pageGraph(o: {
  path: string; name: string; description: string; trail?: [string, string][]; type?: PageType;
  main?: Node | string; about?: (Node | string)[]; faq?: readonly (readonly string[])[];
  items?: { name: string; path: string }[]; nodes?: Node[]; image?: string; modified?: Date;
}) {
  const url = SITE_URL + (o.path === "/" ? "/" : o.path);
  const pageId = `${url}#webpage`;
  const asRef = (x: Node | string) => (typeof x === "string" ? ref(x) : x["@id"] ? ref(String(x["@id"])) : x);
  const graph: Node[] = [ORG, WEBSITE];

  const page: Node = {
    "@type": o.type || "WebPage", "@id": pageId, url, name: o.name, description: o.description, inLanguage: "en-US",
    isPartOf: ref(ID.site), publisher: ref(ID.org),
    primaryImageOfPage: { "@type": "ImageObject", url: o.image || `${SITE_URL}/og` },
  };
  // Every page says when it last changed: the date passed in, or the date the site's pages were last revised.
  const modified = o.modified && !isNaN(+o.modified) ? o.modified : new Date(SITE_UPDATED);
  page.dateModified = modified.toISOString().slice(0, 10);
  if (o.main) page.mainEntity = asRef(o.main);
  if (o.about?.length) page.about = o.about.map(asRef);
  graph.push(page);

  if (o.trail?.length) {
    page.breadcrumb = ref(`${url}#breadcrumb`);
    graph.push({
      "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`,
      itemListElement: o.trail.map(([name, p], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE_URL + p })),
    });
  }
  if (o.faq?.length) {
    page.hasPart = [...((page.hasPart as Node[]) || []), ref(`${url}#faq`)];
    graph.push({
      "@type": "FAQPage", "@id": `${url}#faq`, url, isPartOf: ref(pageId), inLanguage: "en-US",
      mainEntity: o.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    });
  }
  if (o.items?.length) {
    const list = `${url}#list`;
    page.mainEntity = page.mainEntity || ref(list);
    graph.push({
      "@type": "ItemList", "@id": list, numberOfItems: o.items.length,
      itemListElement: o.items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: SITE_URL + it.path })),
    });
  }
  // Nodes defined elsewhere (the services) are included in full on the page that is about them.
  if (o.main && typeof o.main !== "string") graph.push(o.main);
  for (const n of o.nodes || []) graph.push(n);
  // A page that points at the advertising service carries its full description too, so no reference dangles.
  if (!graph.some((n) => n["@id"] === ID.ads) && JSON.stringify(graph).includes(`"${ID.ads}"`)) graph.push(ADS_SERVICE);
  return { "@context": "https://schema.org", "@graph": graph };
}

// ─── Page metadata ───────────────────────────────────────────────────────────────────────────────

/** Title, description, canonical address and sharing cards for a public page, kept in step. */
export function pageMeta(o: { title: string; description: string; path: string; ogTitle?: string; type?: "website" | "article"; image?: string }): Metadata {
  const ogTitle = o.ogTitle || `${o.title} | DSP Connect`;
  const image = o.image || `${SITE_URL}/og`;
  return {
    title: o.title, description: o.description,
    alternates: { canonical: o.path },
    // The sharing picture: the page's own if it has one, otherwise the default at /og.
    openGraph: { type: o.type || "website", siteName: "DSP Connect", locale: "en_US", url: o.path, title: ogTitle, description: o.description, images: [{ url: image, width: 1200, height: 630, alt: ogTitle }] },
    twitter: { card: "summary_large_image", title: ogTitle, description: o.description, images: [image] },
  };
}
