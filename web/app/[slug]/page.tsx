import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer, Header } from "@/components/Chrome";
import { CHECKED, COMPARISONS } from "@/lib/compare";
import { JsonLd, ORG, SITE_URL, crumbs } from "@/lib/seo";
import { SHARE_PCT } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

const find = (slug: string) => COMPARISONS.find((c) => c.slug === decodeURIComponent(slug));

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const c = find((await params).slug);
  return c ? { title: `DSP Connect vs ${c.name}`, description: c.intro, alternates: { canonical: `/${c.slug}` }, openGraph: { title: `DSP Connect vs ${c.name}: ${c.headline}`, description: c.intro, url: `/${c.slug}`, type: "article" } } : {};
}

const money = (spend: number) => `$${((spend * SHARE_PCT) / 100).toLocaleString("en-US")}`;

export default async function ComparePage({ params }: PageProps<"/[slug]">) {
  const c = find((await params).slug);
  if (!c) notFound();
  return (
    <>
      <JsonLd data={crumbs([["Home", "/"], ["How we compare", "/compare"], [`DSP Connect vs ${c.name}`, `/${c.slug}`]])} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebPage", name: `DSP Connect vs ${c.name}: ${c.headline}`, description: c.intro, url: `${SITE_URL}/${c.slug}`, about: [{ "@type": "Thing", name: "DSP Connect" }, { "@type": "Thing", name: c.name }], publisher: ORG }} />
      <Header />
      <main className="wrap narrow stack g56" style={{ padding: "64px 32px 80px" }}>
        <section className="stack g16">
          <div className="eyebrow">Platform comparison</div>
          <h1 className="h1" style={{ fontSize: "clamp(32px,4.4vw,46px)", maxWidth: 860 }}>
            DSP Connect vs. {c.name}: {c.headline}
          </h1>
          <p className="lead" style={{ maxWidth: 720 }}>{c.intro}</p>
        </section>

        <section aria-label="At a glance" className="grid cols-4" style={{ gap: 16 }}>
          {c.tiles.map(([k, v]) => (
            <div className="tile" key={k}><div className="k">{k}</div><div className="v">{v}</div></div>
          ))}
        </section>

        <section className="stack g16">
          <h2 className="h2" style={{ fontSize: 24 }}>Side by side</h2>
          <div className="tablebox">
            <table>
              <thead><tr><th scope="col">Feature</th><th scope="col" className="us">DSP Connect</th><th scope="col">{c.name}</th></tr></thead>
              <tbody>
                {c.rows.map(([f, us, them]) => (
                  <tr key={f}><th scope="row">{f}</th><td className="us">{us}</td><td className="them">{them}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small">{c.name} details are from public sources as of {CHECKED} and may have changed. Check their site for current terms.</p>
        </section>

        <section className="grid cols-2">
          <article className="card card-strong stack g16">
            <h2 className="h2" style={{ fontSize: 22 }}>If you own the business</h2>
            <p className="p">{c.owner}</p>
            <Link className="btn btn-blue" href="/open-account" style={{ alignSelf: "flex-start" }}>Open your account</Link>
          </article>
          <article className="card stack g16">
            <h2 className="h2" style={{ fontSize: 22 }}>If you run an agency</h2>
            <p className="p">{c.agency}</p>
            <div className="grid" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}>
              {[50000, 150000, 500000].map((s) => (
                <div key={s}><div className="money">{money(s)}</div><div className="small">a month at ${s / 1000}k spend</div></div>
              ))}
            </div>
            <Link className="btn btn-line" href="/agencies" style={{ alignSelf: "flex-start" }}>Ask about an agency agreement</Link>
          </article>
        </section>

        <section className="card stack g12" style={{ background: "var(--ground)", border: 0 }}>
          <h2 className="h2" style={{ fontSize: 20 }}>When {c.name} makes more sense</h2>
          <p className="p" style={{ maxWidth: 760 }}>{c.whenText}</p>
        </section>

        <section className="cta dark">
          <div className="stack g8" style={{ flex: "1 1 360px", minWidth: 0 }}>
            <h2 className="h2" style={{ fontSize: 26 }}>See inside before you decide.</h2>
            <p className="p">Open a sample account set up for a business like yours. No call required.</p>
          </div>
          <Link className="btn btn-white" href="/#market">See the demo</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
