import { Footer, Header } from "@/components/Chrome";
import { ID, JsonLd, pageGraph } from "@/lib/seo";
import { LEGAL_ENTITY, LEGAL_UPDATED, SUPPORT_EMAIL } from "@/lib/site";
import { localePath, tr, type Lang } from "@/lib/i18n";
import { LEGAL_NOTICE_ES } from "@/lib/legal.es";

export type Part = [heading: string, paragraphs: string[]];

/** One layout for the terms, privacy and refund pages, so they read the same way. */
export default function Legal({ title, intro, parts, path, lang = "en" }: { title: string; intro: string; parts: Part[]; path: string; lang?: Lang }) {
  const t = tr(lang);
  const updated = lang === "es" ? new Date(LEGAL_UPDATED + "T12:00:00Z").toLocaleDateString("es-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : LEGAL_UPDATED;
  return (
    <>
      <JsonLd data={pageGraph({ lang, path, name: title, description: intro, trail: [[t("Home", "Inicio"), "/"], [title, path]], about: [ID.org], modified: new Date(LEGAL_UPDATED) })} />
      <Header />
      <main className="wrap stack g32" style={{ maxWidth: 800, padding: "64px 32px 80px" }}>
        <div className="stack g12">
          <h1 className="h1" style={{ fontSize: "clamp(30px,4vw,40px)" }}>{title}</h1>
          <p className="small">{t("Last updated", "Última actualización:")} {updated}</p>
          {lang === "es" && <p className="note">{LEGAL_NOTICE_ES} <a href={path}>Ver la versión en inglés</a>.</p>}
          <p className="lead">{intro}</p>
        </div>
        {parts.map(([h, ps], i) => (
          <section className="stack g12" key={h}>
            <h2 className="h3" style={{ fontSize: 19 }}>{i + 1}. {h}</h2>
            {ps.map((p) => <p className="p" key={p.slice(0, 40)}>{p}</p>)}
          </section>
        ))}
        <section className="stack g12">
          <h2 className="h3" style={{ fontSize: 19 }}>{parts.length + 1}. {t("How to reach us", "Cómo comunicarse con nosotros")}</h2>
          <p className="p">
            {t(`DSP Connect is a service of ${LEGAL_ENTITY}. Email`, `DSP Connect es un servicio de ${LEGAL_ENTITY}. Escríbanos a`)} <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            .
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
