import type { Metadata } from "next";
import Link from "@/components/Link";
import { Footer, Header } from "@/components/Chrome";
import { COMPARISONS } from "@/lib/compare";
import { JsonLd, pageGraph, pageMeta } from "@/lib/seo";
import { getLang } from "@/lib/lang";
import { tr } from "@/lib/i18n";

const DESC = {
  en: "DSP Connect side by side with other advertising platforms: setup, minimums and fees.",
  es: "DSP Connect lado a lado con otras plataformas de publicidad: configuración, mínimos y cuotas.",
};
export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return pageMeta({ title: tr(lang)("How we compare", "Cómo nos comparamos"), description: DESC[lang], path: "/compare", lang });
}

export default async function CompareHub() {
  const lang = await getLang(); const t = tr(lang); const DESCRIPTION = DESC[lang];
  return (
    <>
      <JsonLd data={pageGraph({ lang, path: "/compare", type: "CollectionPage", name: t("How we compare", "Cómo nos comparamos"), description: DESCRIPTION, trail: [[t("Home", "Inicio"), "/"], [t("How we compare", "Cómo nos comparamos"), "/compare"]], items: COMPARISONS.map((c) => ({ name: `DSP Connect vs ${c.name}`, path: `/${c.slug}` })) })} />
      <Header />
      <main className="wrap narrow stack g32" style={{ padding: "64px 32px 80px" }}>
        <div className="stack g12" style={{ maxWidth: 680 }}>
          <div className="eyebrow">{t("Comparison", "Comparación")}</div>
          <h1 className="h1" style={{ fontSize: "clamp(32px,4.4vw,46px)" }}>{t("How we compare.", "Cómo nos comparamos.")}</h1>
          <p className="lead">{t("Already looked at another platform? See setup, minimums and fees side by side.", "¿Ya vio otra plataforma? Compare configuración, mínimos y cuotas lado a lado.")}</p>
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
