import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header, TalkBand } from "@/components/Chrome";
import { INDUSTRY_PAGES } from "@/lib/industries";
import { JsonLd, pageGraph, pageMeta } from "@/lib/seo";

const DESCRIPTION = "How DSP Connect sets up advertising for healthcare, legal, financial services, automotive, real estate, home services, franchise, hospitality and political advertisers.";
export const metadata: Metadata = pageMeta({ title: "Industries", description: DESCRIPTION, path: "/industries" });

export default function Industries() {
  return (
    <>
      <JsonLd data={pageGraph({ path: "/industries", type: "CollectionPage", name: "Industries", description: DESCRIPTION, trail: [["Home", "/"], ["Industries", "/industries"]], items: INDUSTRY_PAGES.map((i) => ({ name: `Programmatic advertising for ${i.name.toLowerCase()}`, path: `/industries/${i.slug}` })) })} />
      <Header />
      <main>
        <section className="wrap narrow stack g32" style={{ padding: "64px 32px 80px" }}>
          <div className="stack g16">
            <div className="eyebrow">Industries</div>
            <h1 className="h1" style={{ fontSize: "clamp(32px,4.4vw,46px)" }}>Set up for the way your industry advertises.</h1>
            <p className="lead" style={{ maxWidth: 720 }}>Each industry has its own campaigns, its own results worth counting and its own rules. We build all three into your setup.</p>
          </div>
          <div className="grid cols-3" style={{ gap: 16 }}>
            {INDUSTRY_PAGES.map((i) => (
              <Link key={i.slug} href={`/industries/${i.slug}`} className="card stack g8" style={{ textDecoration: "none", color: "inherit" }}>
                <h2 className="h3">{i.name} <span aria-hidden="true" style={{ color: "var(--blue)" }}>→</span></h2>
                <p className="p" style={{ fontSize: 14 }}>{i.headline}</p>
              </Link>
            ))}
          </div>
          <p className="small">Not listed? We set up most kinds of business. <Link href="/#market">Open the demo</Link> and choose Other.</p>
        </section>
        <TalkBand />
      </main>
      <Footer />
    </>
  );
}
