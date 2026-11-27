import type { Metadata } from "next";
import { Footer, Header } from "@/components/Chrome";
import ApplyForm from "@/components/partner/ApplyForm";
import VideoEmbed from "@/components/VideoEmbed";
import PlannerVideo from "@/components/PlannerVideo";
import { VIDEOS, forLang, videoNode } from "@/lib/videos";
import { partnerFaq } from "@/lib/faq";
import { getLang } from "@/lib/lang";
import { industryName, localePath, tr } from "@/lib/i18n";
import { JsonLd, PARTNER_PROGRAM, SITE_URL, pageGraph, pageMeta } from "@/lib/seo";
import { INDUSTRIES, LEGAL_ENTITY, MIN_BUDGET, SETUP_DAYS, PARTNER_PCT } from "@/lib/site";

const desc = (t: ReturnType<typeof tr>) => t(`For ISOs, merchant-services agents and independent sales pros: earn ${PARTNER_PCT}% of your clients' ad spend, paid daily, with residuals for as long as they spend.`,
  `Para ISOs, agentes de servicios para comerciantes y vendedores independientes: gane el ${PARTNER_PCT}% del gasto publicitario de sus clientes, pagado a diario, con residuales mientras sigan gastando.`);
export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang(); const t = tr(lang);
  return pageMeta({
    lang, title: t("Become an Authorized Sales Partner", "Hágase Socio de Ventas Autorizado"), description: desc(t), path: "/partners", image: `${SITE_URL}${localePath("/partners", lang)}/opengraph-image`,
    ogTitle: t(`Authorized Sales Partner program: earn ${PARTNER_PCT}% of client ad spend, for life | DSP Connect`, `Programa de Socios de Ventas Autorizados: gane el ${PARTNER_PCT}% del gasto publicitario de sus clientes, de por vida | DSP Connect`),
  });
}

export default async function Partners() {
  const lang = await getLang(); const t = tr(lang); const es = lang === "es";
  const DESCRIPTION = desc(t);
  const FAQ = partnerFaq(lang);
  const pv = forLang(VIDEOS.partners, lang);
  const STEPS = es ? [
    ["Solicite", "Cuéntenos a quién le vende hoy. Toma tres minutos."],
    ["Firme su acuerdo", "Su enlace de inscripción llega por correo de inmediato. Firme su Acuerdo de Socio de Ventas en línea, como persona o por su empresa."],
    ["Verifíquese con Stripe", "Configure sus pagos diarios con Stripe, que verifica su identidad y sus datos bancarios. Cuando Stripe lo verifica, queda aprobado automáticamente."],
    ["Capacítese", "Un curso corto sobre el producto, la demo, la conversación y las reglas."],
    ["Venda y gane", `Los clientes abren su cuenta con su enlace. Usted gana el ${PARTNER_PCT}% de lo que gastan, mientras sigan gastando.`],
  ] : [
    ["Apply", "Tell us who you sell to today. It takes three minutes."],
    ["Sign your agreement", "Your enrollment link arrives by email right away. Sign your Sales Partner Agreement online, as yourself or for your company."],
    ["Verify with Stripe", "Set up daily payouts with Stripe, which verifies your identity and bank details. Once Stripe verifies you, you are approved automatically."],
    ["Train", "A short course on the product, the demo, the conversation and the rules."],
    ["Sell and earn", `Clients open their account through your link. You earn ${PARTNER_PCT}% of what they spend, for as long as they spend.`],
  ];
  const WHY = es ? [
    ["Residuales de por vida", "Sigue ganando por cada cliente que trae mientras siga gastando, aunque usted deje de vender. Sin tope y sin fecha de fin."],
    ["Pagos diarios", "La comisión de cada día se deposita en su banco por Stripe después de 7 días de retención. Sin esperar a fin de mes."],
    ["Nada que cobrar ni facturar", "Los clientes le pagan directamente a DSP Connect a nuestros precios publicados. Usted nunca maneja dinero, datos de tarjeta ni facturas."],
    ["Nosotros hacemos la configuración", `Sus clientes están activos en ${SETUP_DAYS} días después de pagar: cuenta, seguimiento, revisión de anuncios y audiencia, todo hecho por nosotros.`],
  ] : [
    ["Residuals for life", "You keep earning on every client you bring for as long as they keep spending, even if you stop selling. No cap, no end date."],
    ["Paid daily", "Each day's commission is paid to your bank through Stripe after a 7-day hold. No waiting for month end."],
    ["Nothing to bill or collect", "Clients pay DSP Connect directly at our published prices. You never handle money, card details or invoices."],
    ["We do the setup", `Your clients are live within ${SETUP_DAYS} days of paying: account, tracking, ad review and audience, done for them.`],
  ];
  return (
    <>
      <JsonLd data={pageGraph({
        lang, path: "/partners", name: t("Become an Authorized Sales Partner", "Hágase Socio de Ventas Autorizado"), description: DESCRIPTION,
        trail: [[t("Home", "Inicio"), "/"], [t("Sales Partners", "Socios de Ventas"), "/partners"]], main: PARTNER_PROGRAM, faq: FAQ,
        image: `${SITE_URL}${localePath("/partners", lang)}/opengraph-image`,
        nodes: [videoNode(VIDEOS.partners, "/partners", "video", lang), videoNode(VIDEOS.plannerPartners, "/partners", "planner-video", lang), {
          "@type": "HowTo", "@id": `${SITE_URL}${localePath("/partners", lang)}#how`, name: t("How to become a DSP Connect Authorized Sales Partner", "Cómo hacerse Socio de Ventas Autorizado de DSP Connect"),
          step: STEPS.map(([name, text], i) => ({ "@type": "HowToStep", position: i + 1, name, text, url: `${SITE_URL}${localePath("/partners", lang)}#apply` })),
        }],
      })} />
      <Header />
      <main>
        <section className="hero"><div className="wrap" style={{ alignItems: "flex-start" }}>
          <div className="hero-copy stack g24">
            <div className="eyebrow">{t("Authorized Sales Partner program", "Programa de Socios de Ventas Autorizados")}</div>
            <h1 className="h1">{t(`Sell DSP Connect to the businesses you already call on. Earn ${PARTNER_PCT}% of what they spend, for life.`, `Venda DSP Connect a los negocios que ya visita. Gane el ${PARTNER_PCT}% de lo que gastan, de por vida.`)}</h1>
            <p className="lead" style={{ maxWidth: 600, fontWeight: 600, color: "var(--ink)" }}>{t("You make the introduction. We set up and run the ads.", "Usted hace la presentación. Nosotros configuramos y manejamos los anuncios.")}</p>
            <p className="lead" style={{ maxWidth: 600 }}>{t("Built for ISOs, merchant-services agents and local sales pros. You bring the relationships. We provide the product, the demo, the setup and the support, and pay you residuals for as long as your clients spend.", "Hecho para ISOs, agentes de servicios para comerciantes y vendedores locales. Usted pone las relaciones. Nosotros ponemos el producto, la demo, la configuración y el soporte, y le pagamos residuales mientras sus clientes sigan gastando.")}</p>
            <div className="ticks"><span>{t(`${PARTNER_PCT}% of qualified ad spend`, `${PARTNER_PCT}% del gasto publicitario calificado`)}</span><span>{t("Residuals for life", "Residuales de por vida")}</span><span>{t("Paid daily", "Pagos diarios")}</span><span>{t("Individual or company", "Persona o empresa")}</span></div>
          </div>
          <div id="apply" className="card formcard stack g16" style={{ background: "var(--ground)", scrollMarginTop: 80 }}>
            <div className="h3" style={{ fontSize: 18 }}>{t("Apply to become a Sales Partner", "Solicite ser Socio de Ventas")}</div>
            <ApplyForm />
          </div>
        </div></section>
        <section className="wrap" style={{ padding: "8px 32px 56px" }} aria-labelledby="video-h">
          <div className="stack g16" style={{ maxWidth: 960, margin: "0 auto" }}>
            <h2 id="video-h" className="h2" style={{ textAlign: "center" }}>{t("See how the program works", "Vea cómo funciona el programa")}</h2>
            <p className="p" style={{ textAlign: "center" }}>{t(`Sell to the businesses you already call on. Earn ${PARTNER_PCT}% of what they spend, for life.`, `Venda a los negocios que ya visita. Gane el ${PARTNER_PCT}% de lo que gastan, de por vida.`)}</p>
            <VideoEmbed id={pv.id} title={pv.title} poster={pv.poster} />
          </div>
        </section>
        <PlannerVideo v={VIDEOS.plannerPartners} id="planner" eyebrow={t("Your sales tool", "Su herramienta de ventas")} title={t("Hand any business owner an ad plan in 30 seconds.", "Entréguele a cualquier dueño de negocio un plan de anuncios en 30 segundos.")} cta={t("See the free ad planner", "Ver el planificador de anuncios gratis")}
          points={es
            ? ["Escriba el sitio web del dueño y reciba un plan de TV por streaming y programática para su negocio.", "Explíqueselo en la cuenta de demostración y armen la campaña juntos.", "Su enlace del planificador le acredita cada plan y cada registro, aunque el dueño termine después por su cuenta.", "No necesita experiencia en publicidad, y sin promesas: el plan nunca predice resultados."]
            : ["Type in the owner's website and get a streaming TV and programmatic plan for their business.", "Walk them through it in the demo account and build the campaign together.", "Your planner link credits every plan and sign-up to you, even if they finish later on their own.", "No advertising experience needed, and no promises: the plan never predicts results."]} />

        <section className="section band"><div className="wrap stack g32">
          <h2 className="h2">{t("Why sales partners choose DSP Connect.", "Por qué los socios de ventas eligen DSP Connect.")}</h2>
          <div className="grid cols-4">{WHY.map(([h, d]) => <div className="card stack g8" key={h}><h3 className="h3">{h}</h3><p className="p" style={{ fontSize: 14 }}>{d}</p></div>)}</div>
        </div></section>

        <section className="section"><div className="wrap stack g32">
          <h2 className="h2">{t("From application to your first commission.", "De la solicitud a su primera comisión.")}</h2>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
            {STEPS.map(([h, d], i) => <div className="step stack g8" key={h}><div className="num">0{i + 1}</div><h3 className="h3">{h}</h3><p className="p" style={{ fontSize: 14 }}>{d}</p></div>)}
          </div>
        </div></section>

        <section className="section band"><div className="wrap stack g24" style={{ maxWidth: 860 }}>
          <h2 className="h2">{t("How commission works.", "Cómo funciona la comisión.")}</h2>
          {es ? (<>
          <p className="p" style={{ fontSize: 16 }}>Usted gana el <b>{PARTNER_PCT}%</b> del <b>gasto publicitario calificado</b> de cada cliente que se le acredita: el presupuesto de anuncios que el cliente pagó completo y que realmente se usó en anuncios. La comisión de cada día se retiene 7 días y luego se deposita en su banco por Stripe.</p>
          <ul className="list"><li>Los residuales continúan mientras el cliente siga gastando, incluso después de que termine su asociación, salvo que termine por causa justificada.</li><li>Los reembolsos, contracargos y montos no pagados no son calificados, y la comisión sobre ellos se revierte.</li><li>No hay salario ni ingresos garantizados. Lo que gana depende de los clientes que trae y de lo que gastan.</li></ul>
          <p className="small">Los términos completos están en el Acuerdo de Socio de Ventas que revisa y firma al inscribirse.</p>
          </>) : (<>
          <p className="p" style={{ fontSize: 16 }}>You earn <b>{PARTNER_PCT}%</b> of the <b>qualified ad spend</b> of every client credited to you: ad budget the client has paid in full that has actually run as ads. Each day&apos;s commission is held for 7 days, then paid to your bank through Stripe.</p>
          <ul className="list"><li>Residuals continue for as long as the client keeps spending, including after your partnership ends, unless it is ended for cause.</li><li>Refunds, chargebacks and unpaid amounts are not qualified, and commission on them is reversed.</li><li>There is no salary and no guaranteed income. What you earn depends on the clients you bring and what they spend.</li></ul>
          <p className="small">Full terms are in the Sales Partner Agreement you review and sign when you enroll.</p>
          </>)}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "baseline" }}>
            <h3 className="h3" style={{ fontSize: 18, flex: "1 1 240px" }}>{t("Industries our partners sell into", "Industrias a las que venden nuestros socios")}</h3>
            <div className="chips" style={{ flex: "999 1 560px" }}>{INDUSTRIES.filter((i) => i !== "Other").map((i) => <span className="chip" key={i}>{industryName(i, lang)}</span>)}</div>
          </div>
        </div></section>

        <section className="section"><div className="wrap stack g24" style={{ maxWidth: 860 }}>
          <h2 className="h2">{t("Questions.", "Preguntas.")}</h2>
          {FAQ.map(([q, a]) => <details key={q} className="card stack g8"><summary style={{ cursor: "pointer", fontWeight: 600 }}>{q}</summary><p className="p" style={{ marginTop: 8 }}>{a}</p></details>)}
          <p className="small">{t("Already a Sales Partner?", "¿Ya es Socio de Ventas?")} <a href={localePath("/partner", lang)}>{t("Sign in to your portal", "Entre a su portal")}</a>. {t(`Authorized Sales Partners are independent contractors of ${LEGAL_ENTITY}, not employees or resellers.`, `Los Socios de Ventas Autorizados son contratistas independientes de ${LEGAL_ENTITY}, no empleados ni revendedores.`)}</p>
          <a className="btn btn-blue" href="#apply" style={{ alignSelf: "flex-start" }}>{t("Apply now", "Solicitar ahora")}</a>
        </div></section>
      </main>
      <Footer />
    </>
  );
}
