import type { Metadata } from "next";
import Link from "@/components/Link";
import { Footer, Header, TalkBand } from "@/components/Chrome";
import LeadForm from "@/components/LeadForm";
import { PARTNERSTACK_AGENCY_URL, SETUP_DAYS, SHARE_PCT, PARTNER_PCT } from "@/lib/site";
import VideoEmbed from "@/components/VideoEmbed";
import PlannerVideo from "@/components/PlannerVideo";
import { VIDEOS, forLang, videoNode } from "@/lib/videos";
import { AGENCY_PROGRAM, JsonLd, SITE_URL, pageGraph, pageMeta } from "@/lib/seo";
import { getLang } from "@/lib/lang";
import { localePath, tr } from "@/lib/i18n";

const desc = (t: ReturnType<typeof tr>) => t(`Run client campaigns on DSP Connect and earn ${SHARE_PCT}% of the ad spend you manage.`, `Maneje las campañas de sus clientes en DSP Connect y gane el ${SHARE_PCT}% del gasto publicitario que administra.`);
export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang(); const t = tr(lang);
  return pageMeta({ lang, title: t("For agencies", "Para agencias"), description: desc(t), path: "/agencies", image: `${SITE_URL}${localePath("/agencies", lang)}/opengraph-image`,
    ogTitle: t(`For agencies: keep your clients, earn ${SHARE_PCT}% of what they spend | DSP Connect`, `Para agencias: conserve a sus clientes y gane el ${SHARE_PCT}% de lo que gastan | DSP Connect`) });
}
const money = (s: number) => `$${((s * SHARE_PCT) / 100).toLocaleString("en-US")}`;

export default async function Agencies() {
  const lang = await getLang(); const t = tr(lang);
  const DESCRIPTION = desc(t);
  const POINTS = [
    [t("Your clients stay yours", "Sus clientes siguen siendo suyos"), t("We never contact, bill or sell to your clients. You own the relationship.", "Nunca contactamos, cobramos ni vendemos a sus clientes. La relación es suya.")],
    [t("All clients in one account", "Todos los clientes en una cuenta"), t("Each client gets their own login, with the access you choose for them.", "Cada cliente recibe su propio acceso, con los permisos que usted elija.")],
    [t(`${SHARE_PCT}% of the ad spend you manage`, `El ${SHARE_PCT}% del gasto publicitario que administra`), t("Paid through PartnerStack on spend your clients actually run, on top of the fees you already charge.", "Pagado por PartnerStack sobre el gasto que sus clientes realmente usan, además de las tarifas que usted ya cobra.")],
    [t(`Each client set up in ${SETUP_DAYS} days`, `Cada cliente configurado en ${SETUP_DAYS} días`), t("We create the account, place tracking, review ads and build the audience.", "Creamos la cuenta, instalamos el seguimiento, revisamos los anuncios y creamos la audiencia.")],
    [t("Your whole sales team, tracked", "Todo su equipo de ventas, con seguimiento"), t("Invite your reps from your PartnerStack dashboard. Each gets their own link, every client is tracked to the rep who brought it, and all commission comes to your agency.", "Invite a sus representantes desde su panel de PartnerStack. Cada uno recibe su propio enlace, cada cliente queda asignado al representante que lo trajo, y toda la comisión llega a su agencia.")],
  ];
  const ag = forLang(VIDEOS.agencies, lang);
  return (
    <>
      <JsonLd data={pageGraph({ lang, path: "/agencies", name: t("For agencies", "Para agencias"), description: DESCRIPTION, trail: [[t("Home", "Inicio"), "/"], [t("For agencies", "Para agencias"), "/agencies"]], main: AGENCY_PROGRAM, nodes: [videoNode(VIDEOS.agencies, "/agencies", "video", lang), videoNode(VIDEOS.plannerAgencies, "/agencies", "planner-video", lang), videoNode(VIDEOS.teamAgencies, "/agencies", "team-video", lang)], image: `${SITE_URL}${localePath("/agencies", lang)}/opengraph-image` })} />
      <Header />
      <main>
        <section className="hero">
          <div className="wrap">
            <div className="hero-copy stack g24">
              <div className="eyebrow">{t("For agencies", "Para agencias")}</div>
              <h1 className="h1">{t(`Keep your clients. Earn ${SHARE_PCT}% of what they spend.`, `Conserve a sus clientes. Gane el ${SHARE_PCT}% de lo que gastan.`)}</h1>
              <p className="lead" style={{ maxWidth: 560 }}>
                {t("Run your clients' advertising across apps and websites on our platform, under a revenue share agreement.", "Maneje la publicidad de sus clientes en aplicaciones y sitios web desde nuestra plataforma, con un acuerdo de participación en ingresos.")}
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a className="btn btn-blue" href={PARTNERSTACK_AGENCY_URL} target="_blank" rel="noopener noreferrer">{t("Join the agency program", "Unirse al programa de agencias")}</a>
                <Link className="btn btn-line" href="/demo?view=agency">{t("See the agency demo", "Ver la demo para agencias")}</Link>
              </div>
              <div className="grid" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16, maxWidth: 520 }}>
                {[50000, 150000, 500000].map((s) => (
                  <div key={s}><div className="money" style={{ fontSize: 24 }}>{money(s)}</div><div className="small">{t(`a month at $${s / 1000}k managed spend`, `al mes con $${s / 1000}k de gasto administrado`)}</div></div>
                ))}
              </div>
            </div>
            <div className="card formcard stack g16">
              <div className="stack g8">
                <h2 className="h3" style={{ fontSize: 18 }}>{t("Ask about an agency agreement", "Pregunte por un acuerdo de agencia")}</h2>
                <p className="small">{t("We reply within one business day.", "Respondemos en un día hábil.")}</p>
              </div>
              <LeadForm kind="agency" cta={t("Request agreement details", "Solicitar detalles del acuerdo")} />
            </div>
          </div>
        </section>
        <section className="wrap" style={{ padding: "8px 32px 56px" }} aria-labelledby="video-h">
          <div className="stack g16" style={{ maxWidth: 960, margin: "0 auto" }}>
            <h2 id="video-h" className="h2" style={{ textAlign: "center" }}>{t("See the agency program in 90 seconds", "Vea el programa de agencias en 90 segundos")}</h2>
            <p className="p" style={{ textAlign: "center" }}>{t(`Your clients stay yours. You earn ${SHARE_PCT}% of the ad spend you manage.`, `Sus clientes siguen siendo suyos. Usted gana el ${SHARE_PCT}% del gasto publicitario que administra.`)}</p>
            <VideoEmbed id={ag.id} title={ag.title} poster={ag.poster} />
          </div>
        </section>
        <PlannerVideo v={VIDEOS.plannerAgencies} id="planner" eyebrow={t("Free ad planner", "Planificador de anuncios gratis")} title={t("Walk into every pitch with a plan.", "Llegue a cada presentación con un plan.")} cta={t("Try it on your next prospect", "Pruébelo con su próximo prospecto")}
          points={lang === "es"
            ? ["Convierta el sitio web de cualquier prospecto en un plan de TV por streaming y programática en unos 30 segundos.", "Una mezcla de canales con razones ligadas a su sitio, y el reparto del presupuesto en dólares.", "Ábralo en la demo y arme la campaña en vivo durante la reunión.", "Pruebe los sitios de sus clientes actuales para ver dónde encajan después la TV por streaming y native."]
            : ["Turn any prospect's website into a streaming TV and programmatic plan in about 30 seconds.", "A channel mix with reasons tied to their site, and the budget split in dollars.", "Open it in the demo and build the campaign live in the meeting.", "Run existing clients' sites to see where streaming TV and native fit next."]} />
        <section className="section band">
          <div className="wrap grid cols-4">
            {POINTS.map(([h, d]) => (
              <div className="step stack g8" key={h}><h3 className="h3">{h}</h3><p className="p" style={{ fontSize: 14 }}>{d}</p></div>
            ))}
          </div>
        </section>
        <PlannerVideo v={VIDEOS.teamAgencies} id="team" eyebrow={t("Your sales team", "Su equipo de ventas")} title={t("Add your reps in PartnerStack.", "Agregue a sus representantes en PartnerStack.")} cta={t("Sign in to PartnerStack", "Entrar a PartnerStack")} href="https://dash.partnerstack.com"
          points={lang === "es"
            ? ["Haga clic en sus iniciales y luego en Members & Invites.", "Invite por correo y elija Member para cada vendedor.", "Cada representante recibe su propio enlace de referido y solo ve sus propios clientes y comisiones.", "Cada cliente se le acredita a su agencia, y solo el dueño y Finance pueden retirar."]
            : ["Click your initials, then Members & Invites.", "Invite by email, and choose Member for each salesperson.", "Each rep gets their own referral link and sees only their own customers and commissions.", "Every customer is credited to your agency, and only the owner and Finance can withdraw."]} />
        <section className="section" aria-labelledby="which-h">
          <div className="wrap narrow stack g16">
            <h2 id="which-h" className="h2">{t("Agency or Sales Partner?", "¿Agencia o Socio de Ventas?")}</h2>
            {lang === "es" ? (<>
            <p className="p"><b>Únase como agencia</b> si usted mismo maneja las campañas de sus clientes, en su propia cuenta de agencia con un acceso para cada cliente. Usted conserva la relación con el cliente y gana el {SHARE_PCT}% del gasto publicitario que administra, pagado por PartnerStack.</p>
            <p className="p"><b>Hágase <Link href="/partners">Socio de Ventas</Link></b> si presenta dueños de negocios y quiere que DSP Connect configure y maneje su publicidad. Usted gana el {PARTNER_PCT}% del gasto publicitario calificado de cada cliente, pagado a diario por Stripe, mientras sigan gastando.</p>
            <p className="p">Ambos programas le permiten agregar a su equipo de ventas: las agencias invitan representantes desde su panel de PartnerStack, y los Socios de Ventas los agregan en su portal de socio. En ambos casos, cada cliente queda asignado al representante que lo trajo y toda la comisión llega a usted.</p>
            </>) : (<>
            <p className="p"><b>Join as an agency</b> if you run your clients&apos; campaigns yourself, in your own agency account with a login for each client. You keep the client relationship and earn {SHARE_PCT}% of the ad spend you manage, paid through PartnerStack.</p>
            <p className="p"><b>Become a <Link href="/partners">Sales Partner</Link></b> if you introduce business owners and want DSP Connect to set up and run their advertising. You earn {PARTNER_PCT}% of each client&apos;s qualified ad spend, paid daily through Stripe, for as long as they spend.</p>
            <p className="p">Both programs let you add your sales team: agencies invite reps from their PartnerStack dashboard, and Sales Partners add reps in their partner portal. Either way, every client is tracked to the rep who brought it and all commission comes to you.</p>
            </>)}
          </div>
        </section>
        <TalkBand agency />
      </main>
      <Footer />
    </>
  );
}
