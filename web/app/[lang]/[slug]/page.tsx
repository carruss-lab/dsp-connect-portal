import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { Footer, Header } from "@/components/Chrome";
import { CHECKED, COMPARISONS } from "@/lib/compare";
import { ID, JsonLd, SITE_URL, pageGraph, pageMeta } from "@/lib/seo";
import { SHARE_PCT } from "@/lib/site";
import { checkedFor, compareFaqFor, compareMetaFor, comparisonFor } from "@/lib/compare.es";
import { asLang, localePath, tr } from "@/lib/i18n";

export const dynamicParams = false;
export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

const find = (slug: string) => COMPARISONS.find((c) => c.slug === decodeURIComponent(slug));

export async function generateMetadata({ params }: PageProps<"/[lang]/[slug]">): Promise<Metadata> {
  const { slug, lang: l } = await params; const lang = asLang(l);
  const base = find(slug);
  if (!base) return {};
  const c = comparisonFor(base, lang);
  return pageMeta({ title: `DSP Connect vs ${c.name}`, description: compareMetaFor(c, lang), path: `/${c.slug}`, ogTitle: `DSP Connect vs ${c.name}: ${c.headline}`, type: "article", lang });
}

const money = (spend: number) => `$${((spend * SHARE_PCT) / 100).toLocaleString("en-US")}`;

export default async function ComparePage({ params }: PageProps<"/[lang]/[slug]">) {
  const { slug, lang: l } = await params; const lang = asLang(l); const t = tr(lang);
  const base = find(slug);
  if (!base) notFound();
  const c = comparisonFor(base, lang);
  const faq = compareFaqFor(c, lang);
  const url = SITE_URL + localePath(`/${c.slug}`, lang);
  return (
    <>
      <JsonLd data={pageGraph({
        lang, path: `/${c.slug}`, name: `DSP Connect vs ${c.name}: ${c.headline}`, description: c.intro,
        trail: [[t("Home", "Inicio"), "/"], [t("How we compare", "Cómo nos comparamos"), "/compare"], [`DSP Connect vs ${c.name}`, `/${c.slug}`]],
        about: [ID.ads, { "@type": "Organization", name: c.name, url: c.site }], faq,
        nodes: [{
          "@type": "Table", "@id": `${url}#table`, about: t(`DSP Connect vs ${c.name}, side by side`, `DSP Connect vs ${c.name}, lado a lado`),
          isPartOf: { "@id": `${url}#webpage` },
        }],
      })} />
      <Header />
      <main className="wrap narrow stack g56" style={{ padding: "64px 32px 80px" }}>
        <section className="stack g16">
          <div className="eyebrow">{t("Platform comparison", "Comparación de plataformas")}</div>
          <h1 className="h1" style={{ fontSize: "clamp(32px,4.4vw,46px)", maxWidth: 860 }}>
            DSP Connect vs. {c.name}: {c.headline}
          </h1>
          <p className="lead" style={{ maxWidth: 720 }}>{c.intro}</p>
        </section>

        <section aria-label={t("At a glance", "De un vistazo")} className="grid cols-4" style={{ gap: 16 }}>
          {c.tiles.map(([k, v]) => (
            <div className="tile" key={k}><div className="k">{k}</div><div className="v">{v}</div></div>
          ))}
        </section>

        <section className="stack g16">
          <h2 className="h2" style={{ fontSize: 24 }}>{t("Side by side", "Lado a lado")}</h2>
          <div className="tablebox">
            <table>
              <thead><tr><th scope="col">{t("Feature", "Característica")}</th><th scope="col" className="us">DSP Connect</th><th scope="col">{c.name}</th></tr></thead>
              <tbody>
                {c.rows.map(([f, us, them]) => (
                  <tr key={f}><th scope="row">{f}</th><td className="us">{us}</td><td className="them">{them}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small">{lang === "es" ? `Los datos de ${c.name} provienen de fuentes públicas a ${checkedFor(lang)} y pueden haber cambiado. Consulte su sitio para conocer las condiciones actuales.` : `${c.name} details are from public sources as of ${CHECKED} and may have changed. Check their site for current terms.`}</p>
        </section>

        <section className="grid cols-2">
          <article className="card card-strong stack g16">
            <h2 className="h2" style={{ fontSize: 22 }}>{t("If you own the business", "Si usted es dueño del negocio")}</h2>
            <p className="p">{c.owner}</p>
            <Link className="btn btn-blue" href="/open-account" style={{ alignSelf: "flex-start" }}>{t("Open your account", "Abra su cuenta")}</Link>
          </article>
          <article className="card stack g16">
            <h2 className="h2" style={{ fontSize: 22 }}>{t("If you run an agency", "Si dirige una agencia")}</h2>
            <p className="p">{c.agency}</p>
            <div className="grid" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}>
              {[50000, 150000, 500000].map((s) => (
                <div key={s}><div className="money">{money(s)}</div><div className="small">{t(`a month at $${s / 1000}k spend`, `al mes con $${s / 1000} mil de gasto`)}</div></div>
              ))}
            </div>
            <Link className="btn btn-line" href="/agencies" style={{ alignSelf: "flex-start" }}>{t("Ask about an agency agreement", "Pregunte por un acuerdo para agencias")}</Link>
          </article>
        </section>

        <section className="card stack g12" style={{ background: "var(--ground)", border: 0 }}>
          <h2 className="h2" style={{ fontSize: 20 }}>{t(`When ${c.name} makes more sense`, `Cuándo conviene más ${c.name}`)}</h2>
          <p className="p" style={{ maxWidth: 760 }}>{c.whenText}</p>
        </section>

        <section className="stack g16" aria-labelledby="faq-h">
          <h2 id="faq-h" className="h2" style={{ fontSize: 24 }}>{t("Common questions", "Preguntas frecuentes")}</h2>
          {faq.map(([q, a]) => (
            <details key={q} className="card stack g8">
              <summary style={{ cursor: "pointer", fontWeight: 600 }}>{q}</summary>
              <p className="p" style={{ marginTop: 8 }}>{a}</p>
            </details>
          ))}
        </section>

        <section className="cta dark">
          <div className="stack g8" style={{ flex: "1 1 360px", minWidth: 0 }}>
            <h2 className="h2" style={{ fontSize: 26 }}>{t("See inside before you decide.", "Véalo por dentro antes de decidir.")}</h2>
            <p className="p">{t("Open a sample account set up for a business like yours. No call required.", "Abra una cuenta de ejemplo configurada para un negocio como el suyo. Sin necesidad de llamada.")}</p>
          </div>
          <Link className="btn btn-white" href="/#market">{t("See the demo", "Ver la demostración")}</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
