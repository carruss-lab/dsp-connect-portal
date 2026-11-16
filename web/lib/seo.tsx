import { LEGAL_ENTITY, MIN_BUDGET, SETUP_DAYS } from "./site";

// The public address of the site. Search engines are told this is the one true address of every page.
export const SITE_URL = "https://getdspconnect.com";

/** Structured data for search engines and AI assistants, in the page's HTML. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export const ORG = {
  "@type": "Organization", "@id": `${SITE_URL}/#org`, name: "DSP Connect", legalName: LEGAL_ENTITY,
  url: SITE_URL, logo: `${SITE_URL}/logo.png`,
};

export const siteGraph = {
  "@context": "https://schema.org",
  "@graph": [
    ORG,
    { "@type": "WebSite", "@id": `${SITE_URL}/#site`, url: SITE_URL, name: "DSP Connect", publisher: { "@id": `${SITE_URL}/#org` } },
    {
      "@type": "Service", "@id": `${SITE_URL}/#service`, name: "Programmatic advertising with done-for-you setup",
      serviceType: "Programmatic advertising", provider: { "@id": `${SITE_URL}/#org` }, areaServed: "US",
      audience: [{ "@type": "BusinessAudience", name: "Business owners" }, { "@type": "BusinessAudience", name: "Advertising agencies" }],
      description: `Banner, video and native ads on apps and websites. We set up the account, tracking, ads and audience, and ads are live within ${SETUP_DAYS} days of payment.`,
      offers: {
        "@type": "Offer", url: `${SITE_URL}/open-account`, priceCurrency: "USD",
        priceSpecification: { "@type": "PriceSpecification", minPrice: MIN_BUDGET, priceCurrency: "USD", description: `Minimum starting ad budget of $${MIN_BUDGET}. No monthly platform fee.` },
      },
    },
  ],
};

export const faqGraph = (faq: readonly (readonly [string, string])[]) => ({
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});

export const crumbs = (trail: [string, string][]) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: trail.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE_URL + path })),
});
