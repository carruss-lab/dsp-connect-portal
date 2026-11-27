import type { Metadata } from "next";
import Link from "@/components/Link";
import { Footer, Header, TalkBand } from "@/components/Chrome";
import { industryPagesFor } from "@/lib/industries.es";
import { JsonLd, pageGraph, pageMeta } from "@/lib/seo";
import { getLang } from "@/lib/lang";
import { tr } from "@/lib/i18n";

const DESC = {
  en: "Programmatic advertising set up for healthcare, legal, financial services, automotive, real estate, home services, franchise, hospitality and political.",
  es: "Publicidad programática configurada para salud, legal, servicios financieros, automotriz, bienes raíces, servicios para el hogar, franquicias, hotelería y restaurantes, y política.",
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return pageMeta({ title: tr(lang)("Industries", "Industrias"), description: DESC[lang], path: "/industries", lang });
}

export default async function Industries() {
  const lang = await getLang(); const t = tr(lang);
  const pages = industryPagesFor(lang);
  const svc = (label: string) => t(`Programmatic advertising for ${label.toLowerCase()}`, `Publicidad programática para ${label.toLowerCase()}`);
  return (
    <>
      <JsonLd data={pageGraph({ lang, path: "/industries", type: "CollectionPage", name: t("Industries", "Industrias"), description: DESC[lang], trail: [[t("Home", "Inicio"), "/"], [t("Industries", "Industrias"), "/industries"]], items: pages.map((i) => ({ name: svc(i.label), path: `/industries/${i.slug}` })) })} />
      <Header />
      <main>
        <section className="wrap narrow stack g32" style={{ padding: "64px 32px 80px" }}>
          <div className="stack g16">
            <div className="eyebrow">{t("Industries", "Industrias")}</div>
            <h1 className="h1" style={{ fontSize: "clamp(32px,4.4vw,46px)" }}>{t("Set up for the way your industry advertises.", "Configurado para la forma en que se anuncia su industria.")}</h1>
            <p className="lead" style={{ maxWidth: 720 }}>{t("Each industry has its own campaigns, its own results worth counting and its own rules. We build all three into your setup.", "Cada industria tiene sus propias campañas, sus propios resultados que vale la pena medir y sus propias reglas. Incluimos las tres cosas en su configuración.")}</p>
          </div>
          <div className="grid cols-3" style={{ gap: 16 }}>
            {pages.map((i) => (
              <Link key={i.slug} href={`/industries/${i.slug}`} className="card stack g8" style={{ textDecoration: "none", color: "inherit" }}>
                <h2 className="h3">{i.label} <span aria-hidden="true" style={{ color: "var(--blue)" }}>→</span></h2>
                <p className="p" style={{ fontSize: 14 }}>{i.headline}</p>
              </Link>
            ))}
          </div>
          <p className="small">{t("Not listed? We set up most kinds of business.", "¿No aparece la suya? Configuramos casi cualquier tipo de negocio.")} <Link href="/#market">{t("Open the demo", "Abra la demostración")}</Link> {t("and choose Other.", "y elija Otra.")}</p>
        </section>
        <TalkBand />
      </main>
      <Footer />
    </>
  );
}
