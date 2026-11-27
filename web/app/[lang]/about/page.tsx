import type { Metadata } from "next";
import Link from "@/components/Link";
import { Footer, Header } from "@/components/Chrome";
import { FACTS, FACTS_ES } from "@/lib/facts";
import { getLang } from "@/lib/lang";
import { tr, type Lang } from "@/lib/i18n";
import { ID, JsonLd, PROFILES, SLOGAN, pageGraph, pageMeta } from "@/lib/seo";
import { HELP_URL, LEGAL_ENTITY, MIN_BUDGET, SETUP_DAYS, SHARE_PCT, PARTNER_PCT, SUPPORT_EMAIL } from "@/lib/site";

const DESC = {
  en: `About DSP Connect: programmatic advertising on streaming TV, apps and websites for any business from a $${MIN_BUDGET} ad budget, set up for you.`,
  es: `Acerca de DSP Connect: publicidad programática en TV por streaming, apps y sitios web para cualquier negocio desde un presupuesto publicitario de $${MIN_BUDGET}, configurada por nosotros.`,
};
const TITLE = { en: "About DSP Connect", es: "Acerca de DSP Connect" };
export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return pageMeta({ title: TITLE[lang], description: DESC[lang], path: "/about", lang });
}

const WHO_ES: [string, string, string][] = [
  ["Dueños de negocio", `Anúnciese en TV por streaming, apps y sitios web desde un presupuesto publicitario de $${MIN_BUDGET}. Configuramos la cuenta, el seguimiento, los anuncios y la audiencia, y los anuncios están activos en ${SETUP_DAYS} días.`, "/open-account"],
  ["Agencias", `Maneje la publicidad programática de sus clientes en DSP Connect, conserve la relación con el cliente y gane el ${SHARE_PCT}% del gasto publicitario que administra.`, "/agencies"],
  ["Socios de ventas", `ISOs, agentes de servicios para comercios y representantes independientes presentan DSP Connect a los negocios que ya visitan y ganan el ${PARTNER_PCT}% del gasto publicitario calificado de sus clientes.`, "/partners"],
];
const SLOGAN_ES = "Publicidad programática de nivel empresarial. Sin el contrato empresarial.";

const WHO: [string, string, string][] = [
  ["Business owners", `Advertise on streaming TV, apps and websites from a $${MIN_BUDGET} ad budget. We set up the account, tracking, ads and audience, and ads are live within ${SETUP_DAYS} days.`, "/open-account"],
  ["Agencies", `Run your clients' programmatic advertising on DSP Connect, keep the client relationship, and earn ${SHARE_PCT}% of the ad spend you manage.`, "/agencies"],
  ["Sales partners", `ISOs, merchant-services agents and independent reps introduce DSP Connect to the businesses they already call on and earn ${PARTNER_PCT}% of their clients' qualified ad spend.`, "/partners"],
];

const PROFILE_NAMES: Record<string, string> = {
  "https://www.youtube.com/@getdspconnect": "YouTube",
  "https://www.linkedin.com/company/getdspconnect": "LinkedIn",
};

export default async function About() {
  const lang: Lang = await getLang(); const t = tr(lang); const es = lang === "es";
  const DESCRIPTION = DESC[lang];
  return (
    <>
      <JsonLd data={pageGraph({
        lang, path: "/about", type: "AboutPage", name: TITLE[lang], description: DESCRIPTION,
        trail: [[t("Home", "Inicio"), "/"], [t("About", "Acerca de"), "/about"]], main: ID.org, about: [ID.org, ID.ads],
      })} />
      <Header />
      <main className="wrap narrow stack g56" style={{ padding: "64px 32px 80px" }}>
        <section className="stack g16">
          <div className="eyebrow">{t("About", "Acerca de")}</div>
          <h1 className="h1" style={{ fontSize: "clamp(32px,4.4vw,46px)", maxWidth: 860 }}>{es ? SLOGAN_ES : SLOGAN}</h1>
          <p className="lead" style={{ maxWidth: 720 }}>{es
            ? "DSP Connect es un servicio de publicidad programática. Compra anuncios en TV por streaming, apps y sitios web, el mismo tipo de compra que hacen las grandes marcas en plataformas como The Trade Desk y Amazon DSP, y la abre a cualquier negocio y agencia sin un contrato empresarial."
            : "DSP Connect is a programmatic advertising service. It buys ads on streaming TV, apps and websites, the same kind of buying big brands do through platforms like The Trade Desk and Amazon DSP, and opens it to any business and agency without an enterprise contract."}</p>
        </section>

        <section className="stack g16" aria-labelledby="facts-h">
          <h2 id="facts-h" className="h2" style={{ fontSize: 24 }}>{t("DSP Connect at a glance", "DSP Connect de un vistazo")}</h2>
          <div className="tablebox">
            <table>
              <tbody>
                {(es ? FACTS_ES : FACTS).map(([k, v]) => (
                  <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="stack g16" aria-labelledby="who-h">
          <h2 id="who-h" className="h2" style={{ fontSize: 24 }}>{t("Who it is for", "Para quién es")}</h2>
          <div className="grid cols-3" style={{ gap: 16 }}>
            {(es ? WHO_ES : WHO).map(([h, body, href]) => (
              <article key={h} className="card stack g8">
                <h3 className="h3" style={{ fontSize: 18 }}>{h}</h3>
                <p className="p">{body}</p>
                <Link href={href} className="small">{t("Learn more", "Más información")}</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="stack g12" aria-labelledby="co-h">
          <h2 id="co-h" className="h2" style={{ fontSize: 24 }}>{t("The company", "La empresa")}</h2>
          {es ? (
            <p className="p">
              DSP Connect es un servicio de {LEGAL_ENTITY}. Escriba a <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>, visite
              el <a href={HELP_URL}>centro de ayuda</a> o vea cómo nos comparamos con{" "}
              <Link href="/compare">otras plataformas de publicidad</Link>. Atendemos en inglés y en español.
            </p>
          ) : (
            <p className="p">
              DSP Connect is a service of {LEGAL_ENTITY}. Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>, visit
              the <a href={HELP_URL}>help center</a>, or see how we compare with{" "}
              <Link href="/compare">other advertising platforms</Link>.
            </p>
          )}
          <p className="p">
            {t("Follow DSP Connect on", "Siga a DSP Connect en")}{" "}
            {PROFILES.filter((u) => PROFILE_NAMES[u]).map((u, i, a) => (
              <span key={u}><a href={u} rel="me noopener" target="_blank">{PROFILE_NAMES[u]}</a>{i < a.length - 1 ? t(" and ", " y ") : "."}</span>
            ))}
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}

