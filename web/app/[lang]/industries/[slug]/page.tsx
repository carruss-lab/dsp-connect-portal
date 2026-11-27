import type { Metadata } from "next";
import Link from "@/components/Link";
import { IndustryNote } from "@/components/Personal";
import { notFound } from "next/navigation";
import { Footer, Header, TalkBand } from "@/components/Chrome";
import { INDUSTRY_PAGES, industryBySlug } from "@/lib/industries";
import { AREA_SERVED, ID, JsonLd, SITE_URL, pageGraph, pageMeta } from "@/lib/seo";
import { MIN_BUDGET, SETUP_DAYS } from "@/lib/site";
import { industryFor } from "@/lib/industries.es";
import { asLang, localePath, tr, type Lang } from "@/lib/i18n";

const svcName = (label: string, lang: Lang) => tr(lang)(`Programmatic advertising for ${label.toLowerCase()}`, `Publicidad programática para ${label.toLowerCase()}`);

export const dynamicParams = false;
export function generateStaticParams() {
  return INDUSTRY_PAGES.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/industries/[slug]">): Promise<Metadata> {
  const { slug, lang: l } = await params; const lang = asLang(l);
  const base = industryBySlug(slug);
  if (!base) return {};
  const i = industryFor(base, lang);
  return pageMeta({ title: svcName(i.label, lang), description: i.intro, path: `/industries/${i.slug}`, lang });
}

export default async function IndustryPage({ params }: PageProps<"/[lang]/industries/[slug]">) {
  const { slug, lang: l } = await params; const lang = asLang(l); const t = tr(lang);
  const base = industryBySlug(slug);
  if (!base) notFound();
  const i = industryFor(base, lang);
  const name = svcName(i.label, lang);
  const url = `${SITE_URL}${localePath(`/industries/${i.slug}`, lang)}`;
  const demo = `/?industry=${encodeURIComponent(i.name)}#market`;
  return (
    <>
      <JsonLd data={pageGraph({
        lang, path: `/industries/${i.slug}`, name, description: i.intro,
        trail: [[t("Home", "Inicio"), "/"], [t("Industries", "Industrias"), "/industries"], [i.label, `/industries/${i.slug}`]], faq: i.faq,
        main: {
          "@type": "Service", "@id": `${url}#service`, name,
          serviceType: t("Programmatic advertising", "Publicidad programática"), category: i.label, description: i.intro, url,
          provider: { "@id": ID.org }, isRelatedTo: { "@id": ID.ads }, areaServed: AREA_SERVED,
          audience: { "@type": "BusinessAudience", name: t(`${i.name} businesses`, `Negocios de ${i.label.toLowerCase()}`) },
        },
      })} />
      <Header />
      <main>
        <section className="wrap narrow stack g24" style={{ padding: "64px 32px 56px" }}>
          <div className="eyebrow">{i.label}</div>
          <h1 className="h1" style={{ fontSize: "clamp(32px,4.4vw,46px)", maxWidth: 860 }}>{i.headline}</h1>
          <p className="lead" style={{ maxWidth: 720 }}>{i.intro}</p>
          <IndustryNote industry={i.name} />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link className="btn btn-blue" href={demo}>{t(`See the demo for ${i.name.toLowerCase()}`, `Ver la demostración para ${i.label.toLowerCase()}`)}</Link>
            <Link className="btn btn-line" href={`/open-account?industry=${encodeURIComponent(i.name)}`}>{t("Open your account", "Abra su cuenta")}</Link>
          </div>
          <p className="small">{lang === "es" ? `Configuración hecha por nosotros. Activo en ${SETUP_DAYS} días. Desde $${MIN_BUDGET}. Sin cuota mensual de plataforma.` : `Done-for-you setup. Live within ${SETUP_DAYS} days. From $${MIN_BUDGET}. No monthly platform fee.`}</p>
        </section>

        <section className="section band">
          <div className="wrap narrow stack g24">
            <h2 className="h2">{t(`Campaigns a ${i.who} typically runs`, `Campañas típicas en ${i.label.toLowerCase()}`)}</h2>
            <div className="grid cols-3">
              {i.campaigns.map(([h, d]) => <div className="step stack g8" key={h}><h3 className="h3">{h}</h3><p className="p" style={{ fontSize: 14 }}>{d}</p></div>)}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap narrow grid cols-2" style={{ gap: 40 }}>
            <div className="stack g16">
              <h2 className="h2" style={{ fontSize: 26 }}>{t("What we set tracking up to count", "Lo que configuramos el seguimiento para medir")}</h2>
              <p className="p">{t("So you can see what your ads produced, not just how many people saw them.", "Para que vea lo que produjeron sus anuncios, no solo cuántas personas los vieron.")}</p>
              <ul className="list">{i.counts.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
            <div className="stack g16">
              <h2 className="h2" style={{ fontSize: 26 }}>{t("Rules we build in from the start", "Reglas que incluimos desde el principio")}</h2>
              {i.rules.map(([h, d]) => <div className="stack g8" key={h}><h3 className="h3" style={{ fontSize: 15 }}>{h}</h3><p className="p" style={{ fontSize: 14 }}>{d}</p></div>)}
            </div>
          </div>
        </section>

        <section className="section band" style={{ padding: "64px 0" }}>
          <div className="wrap narrow stack g16" style={{ maxWidth: 880 }}>
            <h2 className="h2" style={{ fontSize: 26 }}>{t("Common questions", "Preguntas frecuentes")}</h2>
            <div>{i.faq.map(([q, a]) => <div className="faq stack g8" key={q}><h3 className="h3" style={{ fontSize: 16 }}>{q}</h3><p className="p">{a}</p></div>)}</div>
          </div>
        </section>
        <TalkBand industry={i.name} />
      </main>
      <Footer />
    </>
  );
}
