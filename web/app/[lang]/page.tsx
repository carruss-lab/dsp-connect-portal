import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/Link";
import { Footer, Header } from "@/components/Chrome";
import LeadForm from "@/components/LeadForm";
import { COMPARISONS } from "@/lib/compare";
import { EXCHANGES, MIN_BUDGET, SETUP_DAYS, SHARE_PCT } from "@/lib/site";
import VideoEmbed from "@/components/VideoEmbed";
import PlannerVideo from "@/components/PlannerVideo";
import { ADS_SERVICE, JsonLd, pageGraph, pageMeta } from "@/lib/seo";
import { VIDEOS, forLang, videoNode } from "@/lib/videos";
import { INDUSTRY_PAGES } from "@/lib/industries";
import { homeFaq } from "@/lib/faq";
import { getLang } from "@/lib/lang";
import { industryName, tr } from "@/lib/i18n";

const EXCH_ES = `más de ${EXCHANGES.replace("+", "")}`;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const t = tr(lang);
  return pageMeta({
    lang, path: "/",
    title: t("DSP Connect | Enterprise programmatic advertising, without the enterprise contract", "DSP Connect | Publicidad programática empresarial, sin el contrato empresarial"),
    ogTitle: t("DSP Connect | Enterprise programmatic advertising, without the enterprise contract", "DSP Connect | Publicidad programática empresarial, sin el contrato empresarial"),
    description: t(`Streaming TV, apps and websites across ${EXCHANGES} ad exchanges, open to any business from a $${MIN_BUDGET} ad budget. Set up for you, live within ${SETUP_DAYS} days. No contract.`,
      `TV por streaming, aplicaciones y sitios web en ${EXCH_ES} exchanges de anuncios, abierto a cualquier negocio desde un presupuesto de $${MIN_BUDGET}. Configurado para usted y activo en ${SETUP_DAYS} días. Sin contrato.`),
  });
}

export default async function Home() {
  const lang = await getLang();
  const t = tr(lang);
  const FAQ = homeFaq(lang);
  const owners = forLang(VIDEOS.owners, lang);
  const STEPS = [
    [t("See the demo", "Vea la demo"), t("Open a sample account set up for a business like yours, before you spend anything.", "Abra una cuenta de muestra configurada para un negocio como el suyo, antes de gastar nada.")],
    [t("Tell us about your business", "Cuéntenos sobre su negocio"), t("Fill in one short form online: your goals, your area and the ads you want to run.", "Llene un formulario corto en línea: sus metas, su zona y los anuncios que quiere publicar.")],
    [t("Pay online", "Pague en línea"), t(`Agree to the terms and pay your ad budget by card or bank transfer. Budgets start at $${MIN_BUDGET}.`, `Acepte los términos y pague su presupuesto de anuncios con tarjeta o transferencia bancaria. Los presupuestos empiezan en $${MIN_BUDGET}.`)],
    [t(`Live within ${SETUP_DAYS} days`, `Activo en ${SETUP_DAYS} días`), t("We set up your account and launch your ads. Log in any time to see views, clicks, leads and spend.", "Configuramos su cuenta y lanzamos sus anuncios. Entre cuando quiera para ver visualizaciones, clics, contactos y gasto.")],
  ];
  const SETUP = [
    [t("Create your account", "Creamos su cuenta"), t("Your login, your budget loaded, your reporting ready.", "Su acceso, su presupuesto cargado y sus reportes listos.")],
    [t("Place your tracking", "Instalamos el seguimiento"), t("So leads and sales from your ads are counted on your own website.", "Para que los contactos y las ventas de sus anuncios se cuenten en su propio sitio web.")],
    [t("Review your ads", "Revisamos sus anuncios"), t("Checked against exchange rules so they are approved the first time.", "Revisados según las reglas de los exchanges para que se aprueben a la primera.")],
    [t("Build your audience", "Creamos su audiencia"), t("Your area, your customers, the apps and sites that fit your business.", "Su zona, sus clientes, las aplicaciones y sitios que van con su negocio.")],
  ];
  const TRUST: [string, string, string, string][] = [
    [t("The account itself", "La cuenta misma"), t("Open the demo and click through every screen you will use, before you give us a card.", "Abra la demo y recorra cada pantalla que va a usar, antes de darnos una tarjeta."), "/#market", t("Open the demo", "Abrir la demo")],
    [t("Answers, any hour", "Respuestas, a cualquier hora"), t("Ask Fin in the chat about your market, your ads, the setup or the terms, and get a straight answer in seconds.", "Pregúntele a Fin en el chat sobre su mercado, sus anuncios, la configuración o los términos, y reciba una respuesta clara en segundos."), "/#market", t("See it in the demo", "Véalo en la demo")],
    [t("Your way out", "Su salida"), t("No long-term contract. Cancel any time and your unspent ad budget is refunded.", "Sin contrato a largo plazo. Cancele cuando quiera y le reembolsamos el presupuesto de anuncios que no se haya gastado."), "/refunds", t("Read the refund policy", "Leer la política de reembolsos")],
    [t("The terms", "Los términos"), t("Short, plain client terms. Payment is taken by Stripe; we never see your card details.", "Términos para clientes cortos y claros. Stripe procesa el pago; nunca vemos los datos de su tarjeta."), "/terms", t("Read the client terms", "Leer los términos para clientes")],
  ];
  return (
    <>
      <JsonLd data={pageGraph({ lang, path: "/", name: t("DSP Connect | Enterprise programmatic advertising, without the enterprise contract", "DSP Connect | Publicidad programática empresarial, sin el contrato empresarial"), description: t(`Streaming TV, apps and websites across ${EXCHANGES} ad exchanges, open to any business from a $${MIN_BUDGET} ad budget. Set up for you, live within ${SETUP_DAYS} days. No contract.`, `TV por streaming, aplicaciones y sitios web en ${EXCH_ES} exchanges de anuncios, abierto a cualquier negocio desde un presupuesto de $${MIN_BUDGET}. Configurado para usted y activo en ${SETUP_DAYS} días. Sin contrato.`), main: ADS_SERVICE, faq: FAQ, nodes: [videoNode(VIDEOS.owners, "/", "video", lang), videoNode(VIDEOS.plannerOwners, "/", "planner-video", lang)] })} />
      <Header />
      <main>
        <section className="hero">
          <div className="wrap">
            <div className="hero-copy stack g24">
              <div className="eyebrow">{t("Programmatic advertising for every business", "Publicidad programática para todo negocio")}</div>
              <h1 className="h1">{t("Enterprise programmatic advertising. Without the enterprise contract.", "Publicidad programática empresarial. Sin el contrato empresarial.")}</h1>
              <p className="lead" style={{ maxWidth: 600, fontWeight: 600, color: "var(--ink)" }}>{t("Your streaming TV and online ads on autopilot: we set them up, and Autopilot rules keep tuning them for you.", "Sus anuncios en TV por streaming y en internet en piloto automático: nosotros los configuramos, y las reglas de Autopilot los siguen ajustando por usted.")}</p>
              <p className="lead" style={{ maxWidth: 600 }}>
                {t(`The same kind of buying big brands do through The Trade Desk and Amazon DSP: streaming TV, apps and websites across ${EXCHANGES} ad exchanges. Open to any business from a $${MIN_BUDGET} ad budget, set up for you and live within ${SETUP_DAYS} days.`,
                  `El mismo tipo de compra que hacen las grandes marcas con The Trade Desk y Amazon DSP: TV por streaming, aplicaciones y sitios web en ${EXCH_ES} exchanges de anuncios. Abierto a cualquier negocio desde un presupuesto de $${MIN_BUDGET}, configurado para usted y activo en ${SETUP_DAYS} días.`)}
              </p>
              <div className="ticks">
                <span>{t("From", "Desde")} ${MIN_BUDGET}</span>
                <span>{t(`Live within ${SETUP_DAYS} days`, `Activo en ${SETUP_DAYS} días`)}</span>
                <span>{t("No contract", "Sin contrato")}</span>
                <span>{t("No monthly platform fee", "Sin tarifa mensual de plataforma")}</span>
              </div>
              <Link className="btn btn-blue" href="/open-account" style={{ alignSelf: "flex-start" }}>{t("Open your account", "Abra su cuenta")}</Link>
            </div>
            <div id="market" className="card formcard stack g16" style={{ scrollMarginTop: 90 }}>
              <div className="stack g8">
                <h2 className="h3" style={{ fontSize: 18 }}>{t("See your sample account", "Vea su cuenta de muestra")}</h2>
                <p className="small">{t("Tell us your industry and area and we open a sample account set up for a business like yours. See exactly what you get before you spend a dollar. No card needed.", "Díganos su industria y su zona y le abrimos una cuenta de muestra configurada para un negocio como el suyo. Vea exactamente lo que recibe antes de gastar un dólar. No se necesita tarjeta.")}</p>
              </div>
              <LeadForm kind="market_check" cta={t("Open the demo", "Abrir la demo")} />
            </div>
          </div>
        </section>
        <section className="wrap" style={{ padding: "8px 32px 56px" }} aria-labelledby="video-h">
          <div className="stack g16" style={{ maxWidth: 960, margin: "0 auto" }}>
            <h2 id="video-h" className="h2" style={{ textAlign: "center" }}>{t("See how it works in 2 minutes", "Vea cómo funciona en 2 minutos")}</h2>
            <p className="p" style={{ textAlign: "center" }}>{t("Enterprise programmatic advertising, without the enterprise contract.", "Publicidad programática empresarial, sin el contrato empresarial.")}</p>
            <VideoEmbed id={owners.id} title={owners.title} poster={owners.poster} />
          </div>
        </section>

        <section style={{ paddingBottom: 40 }}>
          <div className="wrap stack g16">
            <div className="shot">
              <Image src="/demo-dashboard.png" alt={t("The DSP Connect dashboard in the demo account, showing spend, impressions, clicks, conversions and a chart of impressions by day for four campaigns.", "El panel de DSP Connect en la cuenta de demostración, con gasto, impresiones, clics, conversiones y un gráfico de impresiones por día de cuatro campañas.")} width={2560} height={1520} sizes="(max-width: 1240px) 100vw, 1176px" priority />
            </div>
            <p className="small">{t("The demo account, with sample data. Enter your industry and area above to open it set up for a business like yours.", "La cuenta de demostración, con datos de muestra. Escriba su industria y su zona arriba para abrirla configurada para un negocio como el suyo.")}</p>
          </div>
        </section>

        <section id="how" className="section" style={{ scrollMarginTop: 70, paddingTop: 40 }}>
          <div className="wrap stack g32">
            <div className="stack g12" style={{ maxWidth: 680 }}>
              <h2 className="h2">{t(`Done-for-you setup. Live in ${SETUP_DAYS} days.`, `Configuración hecha por nosotros. Activo en ${SETUP_DAYS} días.`)}</h2>
              <p className="p" style={{ fontSize: 16 }}>{t("You fill in one form and pay. We build everything else and hand you the keys.", "Usted llena un formulario y paga. Nosotros construimos todo lo demás y le entregamos las llaves.")}</p>
            </div>
            <div className="grid cols-4">
              {STEPS.map(([h, d], i) => (
                <div className="step stack g8" key={h}>
                  <div className="num">0{i + 1}</div><h3 className="h3">{h}</h3><p className="p" style={{ fontSize: 14 }}>{d}</p>
                </div>
              ))}
            </div>
            <div className="card stack g24" style={{ background: "var(--ground)" }}>
              <h3 className="h3" style={{ fontSize: 16 }}>{t(`What we do for you in those ${SETUP_DAYS} days`, `Lo que hacemos por usted en esos ${SETUP_DAYS} días`)}</h3>
              <div className="grid cols-4" style={{ gap: 20 }}>
                {SETUP.map(([h, d]) => (
                  <div className="stack" style={{ gap: 4 }} key={h}><div style={{ fontSize: 14, fontWeight: 600 }}>{h}</div><p className="small" style={{ color: "var(--body)" }}>{d}</p></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <PlannerVideo v={VIDEOS.plannerOwners} id="planner" eyebrow={t("Free ad planner", "Planificador de anuncios gratis")} title={t("Get a free ad plan from your website.", "Obtenga un plan de anuncios gratis a partir de su sitio web.")} cta={t("Get your free ad plan", "Obtenga su plan gratis")}
          points={lang === "es"
            ? [`Escriba su sitio web y el presupuesto que tiene en mente, desde $${MIN_BUDGET}.`, "Reciba un plan para TV por streaming, video en línea, display, native y retargeting, repartido en dólares.", "Ábralo en su cuenta de demostración y arme la campaña.", "Gratis, en unos 30 segundos, y guardado en su correo."]
            : ["Enter your website and the budget you have in mind, from $750.", "Get a plan for streaming TV, online video, display, native and retargeting, split in dollars.", "Open it in your demo account and build the campaign.", "Free, in about 30 seconds, and saved to your email."]} />

        <section id="who" className="section band" style={{ scrollMarginTop: 70 }}>
          <div className="wrap stack g32">
            <h2 className="h2">{t("Built for two kinds of customer.", "Hecho para dos tipos de cliente.")}</h2>
            <div className="grid cols-2">
              <article className="card card-strong stack g16">
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <h3 className="h2" style={{ fontSize: 22 }}>{t("Business owners", "Dueños de negocios")}</h3><span className="mono" style={{ fontSize: 14, color: "var(--body)" }}>{t("from", "desde")} ${MIN_BUDGET}</span>
                </div>
                <p className="p">{t("Used to running ads on Facebook or Google? Reach the same customers on the apps and websites they use the rest of the day.", "¿Acostumbrado a anunciarse en Facebook o Google? Llegue a los mismos clientes en las aplicaciones y sitios web que usan el resto del día.")}</p>
                <ul className="list">
                  <li>{t("Account and tracking set up for you", "Cuenta y seguimiento configurados para usted")}</li>
                  <li>{t("Video, banner and native ads, run by you", "Anuncios de video, banner y native, manejados por usted")}</li>
                  <li>{t(`Live within ${SETUP_DAYS} days of paying`, `Activo en ${SETUP_DAYS} días después de pagar`)}</li>
                </ul>
                <Link className="btn btn-blue" href="/open-account" style={{ alignSelf: "flex-start" }}>{t("Open your account", "Abra su cuenta")}</Link>
              </article>
              <article className="card stack g16">
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <h3 className="h2" style={{ fontSize: 22 }}>{t("Agencies", "Agencias")}</h3><span className="mono" style={{ fontSize: 14, color: "var(--body)" }}>{t(`${SHARE_PCT}% revenue share`, `${SHARE_PCT}% de participación`)}</span>
                </div>
                <p className="p">{t("Run your clients' campaigns on our platform under a revenue share agreement. Your clients stay yours.", "Maneje las campañas de sus clientes en nuestra plataforma con un acuerdo de participación en ingresos. Sus clientes siguen siendo suyos.")}</p>
                <ul className="list">
                  <li>{t("All your clients in one account, each with their own login", "Todos sus clientes en una cuenta, cada uno con su propio acceso")}</li>
                  <li>{t(`${SHARE_PCT}% of the ad spend you manage`, `El ${SHARE_PCT}% del gasto publicitario que administra`)}</li>
                  <li>{t(`Each client set up within ${SETUP_DAYS} days`, `Cada cliente configurado en ${SETUP_DAYS} días`)}</li>
                </ul>
                <Link className="btn btn-line" href="/agencies" style={{ alignSelf: "flex-start" }}>{t("Ask about an agency agreement", "Pregunte por un acuerdo de agencia")}</Link>
              </article>
            </div>
            <p className="small">{t("No monthly platform fee. Our fee is included in the price of your ads.", "Sin tarifa mensual de plataforma. Nuestra tarifa está incluida en el precio de sus anuncios.")}</p>
          </div>
        </section>

        <section className="section" style={{ padding: "56px 0" }}>
          <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "baseline" }}>
            <h2 className="h3" style={{ fontSize: 20, flex: "1 1 240px" }}>{t("Industries we set up most", "Industrias que más configuramos")}</h2>
            <div className="chips" style={{ flex: "999 1 560px" }}>
              {INDUSTRY_PAGES.map((i) => <Link className="chip" key={i.slug} href={`/industries/${i.slug}`} style={{ textDecoration: "none", color: "inherit" }}>{industryName(i.name, lang)}</Link>)}
            </div>
          </div>
        </section>

        <section className="section" style={{ borderTop: "1px solid var(--line)", padding: "72px 0" }}>
          <div className="wrap stack g24">
            <div className="stack g12" style={{ maxWidth: 680 }}>
              <h2 className="h2">{t("How we compare.", "Cómo nos comparamos.")}</h2>
              <p className="p" style={{ fontSize: 16 }}>{t("Already looked at another platform? See setup, minimums and fees side by side.", "¿Ya vio otra plataforma? Compare configuración, mínimos y tarifas lado a lado.")}</p>
            </div>
            <div className="grid cols-3" style={{ gap: 12 }}>
              {COMPARISONS.map((c) => (
                <Link key={c.slug} className="linkrow" href={`/${c.slug}`}>
                  <span>DSP Connect {t("vs", "frente a")} {c.name}</span><span aria-hidden="true" style={{ color: "var(--blue)" }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section band" style={{ padding: "64px 0" }}>
          <div className="wrap stack g24">
            <h2 className="h2" style={{ fontSize: 28 }}>{t("What you can check before you pay.", "Lo que puede revisar antes de pagar.")}</h2>
            <div className="grid cols-4">
              {TRUST.map(([h, d, href, label]) => (
                <div className="step stack g8" key={h}><h3 className="h3">{h}</h3><p className="p" style={{ fontSize: 14 }}>{d}</p>
                  {href.startsWith("http") ? <a href={href} target="_blank" rel="noopener" style={{ fontSize: 14 }}>{label}</a> : <Link href={href} style={{ fontSize: 14 }}>{label}</Link>}</div>
              ))}
            </div>
          </div>
        </section>

        <section className="section dark" style={{ padding: "72px 0" }}>
          <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: 40, alignItems: "center", justifyContent: "space-between" }}>
            <div className="stack g12" style={{ flex: "1 1 480px", minWidth: 0 }}>
              <div className="eyebrow" style={{ color: "var(--soft)" }}>{t("Ready when you are", "Listos cuando usted lo esté")}</div>
              <h2 className="h2">{t(`Open your account today. Be live within ${SETUP_DAYS} days.`, `Abra su cuenta hoy. Esté activo en ${SETUP_DAYS} días.`)}</h2>
              <p className="p" style={{ fontSize: 16 }}>{t("Fill in your details, pay your ad budget online, and we set up the rest.", "Llene sus datos, pague su presupuesto de anuncios en línea y nosotros configuramos el resto.")}</p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="btn btn-white" href="/open-account">{t("Open your account", "Abra su cuenta")}</Link>
              <Link className="btn btn-line" style={{ borderColor: "#fff", color: "#fff" }} href="/#market">{t("See the demo first", "Vea la demo primero")}</Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap stack g24" style={{ maxWidth: 880 }}>
            <h2 className="h2" style={{ fontSize: 28 }}>{t("Common questions", "Preguntas frecuentes")}</h2>
            <div>
              {FAQ.map(([q, a]) => (
                <div className="faq stack g8" key={q}><h3 className="h3" style={{ fontSize: 16 }}>{q}</h3><p className="p">{a}</p></div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
