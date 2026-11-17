import type { Metadata } from "next";
import Link from "next/link";
import { IndustryNote } from "@/components/Personal";
import { notFound } from "next/navigation";
import { Footer, Header, TalkBand } from "@/components/Chrome";
import { INDUSTRY_PAGES, industryBySlug } from "@/lib/industries";
import { ID, JsonLd, SITE_URL, pageGraph, pageMeta } from "@/lib/seo";
import { MIN_BUDGET, SETUP_DAYS } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return INDUSTRY_PAGES.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps<"/industries/[slug]">): Promise<Metadata> {
  const i = industryBySlug((await params).slug);
  if (!i) return {};
  const title = `Programmatic advertising for ${i.name.toLowerCase()}`;
  return pageMeta({ title, description: i.intro, path: `/industries/${i.slug}` });
}

export default async function IndustryPage({ params }: PageProps<"/industries/[slug]">) {
  const i = industryBySlug((await params).slug);
  if (!i) notFound();
  const demo = `/?industry=${encodeURIComponent(i.name)}#market`;
  return (
    <>
      <JsonLd data={pageGraph({
        path: `/industries/${i.slug}`, name: `Programmatic advertising for ${i.name.toLowerCase()}`, description: i.intro,
        trail: [["Home", "/"], ["Industries", "/industries"], [i.name, `/industries/${i.slug}`]], faq: i.faq,
        main: {
          "@type": "Service", "@id": `${SITE_URL}/industries/${i.slug}#service`, name: `Programmatic advertising for ${i.name.toLowerCase()}`,
          serviceType: "Programmatic advertising", category: i.name, description: i.intro, url: `${SITE_URL}/industries/${i.slug}`,
          provider: { "@id": ID.org }, isRelatedTo: { "@id": ID.ads }, areaServed: { "@type": "Country", name: "United States" },
          audience: { "@type": "BusinessAudience", name: `${i.name} businesses` },
        },
      })} />
      <Header />
      <main>
        <section className="wrap narrow stack g24" style={{ padding: "64px 32px 56px" }}>
          <div className="eyebrow">{i.name}</div>
          <h1 className="h1" style={{ fontSize: "clamp(32px,4.4vw,46px)", maxWidth: 860 }}>{i.headline}</h1>
          <p className="lead" style={{ maxWidth: 720 }}>{i.intro}</p>
          <IndustryNote industry={i.name} />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link className="btn btn-blue" href={demo}>See the demo for {i.name.toLowerCase()}</Link>
            <Link className="btn btn-line" href={`/open-account?industry=${encodeURIComponent(i.name)}`}>Open your account</Link>
          </div>
          <p className="small">Done-for-you setup. Live within {SETUP_DAYS} days. From ${MIN_BUDGET}. No monthly platform fee.</p>
        </section>

        <section className="section band">
          <div className="wrap narrow stack g24">
            <h2 className="h2">Campaigns a {i.who} typically runs</h2>
            <div className="grid cols-3">
              {i.campaigns.map(([t, d]) => <div className="step stack g8" key={t}><h3 className="h3">{t}</h3><p className="p" style={{ fontSize: 14 }}>{d}</p></div>)}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap narrow grid cols-2" style={{ gap: 40 }}>
            <div className="stack g16">
              <h2 className="h2" style={{ fontSize: 26 }}>What we set tracking up to count</h2>
              <p className="p">So you can see what your ads produced, not just how many people saw them.</p>
              <ul className="list">{i.counts.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
            <div className="stack g16">
              <h2 className="h2" style={{ fontSize: 26 }}>Rules we build in from the start</h2>
              {i.rules.map(([t, d]) => <div className="stack g8" key={t}><h3 className="h3" style={{ fontSize: 15 }}>{t}</h3><p className="p" style={{ fontSize: 14 }}>{d}</p></div>)}
            </div>
          </div>
        </section>

        <section className="section band" style={{ padding: "64px 0" }}>
          <div className="wrap narrow stack g16" style={{ maxWidth: 880 }}>
            <h2 className="h2" style={{ fontSize: 26 }}>Common questions</h2>
            <div>{i.faq.map(([q, a]) => <div className="faq stack g8" key={q}><h3 className="h3" style={{ fontSize: 16 }}>{q}</h3><p className="p">{a}</p></div>)}</div>
          </div>
        </section>
        <TalkBand industry={i.name} />
      </main>
      <Footer />
    </>
  );
}
