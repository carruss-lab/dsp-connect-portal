import type { Metadata } from "next";
import Link from "@/components/Link";
import { Footer, Header } from "@/components/Chrome";
import { COMPARISONS } from "@/lib/compare";
import { JsonLd, pageGraph, pageMeta } from "@/lib/seo";

const DESCRIPTION = "DSP Connect side by side with other advertising platforms: setup, minimums and fees.";
export const metadata: Metadata = pageMeta({ title: "How we compare", description: DESCRIPTION, path: "/compare" });

export default function CompareHub() {
  return (
    <>
      <JsonLd data={pageGraph({ path: "/compare", type: "CollectionPage", name: "How we compare", description: DESCRIPTION, trail: [["Home", "/"], ["How we compare", "/compare"]], items: COMPARISONS.map((c) => ({ name: `DSP Connect vs ${c.name}`, path: `/${c.slug}` })) })} />
      <Header />
      <main className="wrap narrow stack g32" style={{ padding: "64px 32px 80px" }}>
        <div className="stack g12" style={{ maxWidth: 680 }}>
          <div className="eyebrow">Comparison</div>
          <h1 className="h1" style={{ fontSize: "clamp(32px,4.4vw,46px)" }}>How we compare.</h1>
          <p className="lead">Already looked at another platform? See setup, minimums and fees side by side.</p>
        </div>
        <div className="grid cols-3" style={{ gap: 12 }}>
          {COMPARISONS.map((c) => (
            <Link key={c.slug} className="linkrow" href={`/${c.slug}`}>
              <span>DSP Connect vs {c.name}</span><span aria-hidden="true" style={{ color: "var(--blue)" }}>→</span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
