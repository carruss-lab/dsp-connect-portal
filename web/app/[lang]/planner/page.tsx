import type { Metadata } from "next";
import Link from "@/components/Link";
import { Footer, Header } from "@/components/Chrome";
import PlannerApp from "@/components/PlannerApp";
import PlannerVideo from "@/components/PlannerVideo";
import { VIDEOS, videoNode } from "@/lib/videos";
import { ID, JsonLd, SITE_URL, pageGraph, pageMeta } from "@/lib/seo";
import { MIN_BUDGET, SETUP_DAYS } from "@/lib/site";
import { getLang } from "@/lib/lang";
import { localePath, tr, type Lang } from "@/lib/i18n";

const PATH = "/planner";
const content = (lang: Lang) => {
  const t = tr(lang);
  const DESCRIPTION = t("Enter your website and get a free ad plan: streaming TV, video, display, native and retargeting, split for your budget, with targeting and tracking.",
    "Escriba su sitio web y reciba un plan de anuncios gratis: TV por streaming, video, display, native y retargeting, repartido para su presupuesto, con segmentación y seguimiento.");
  const COVERS: [string, string][] = lang === "es" ? [
    ["Lo que aprendimos de su sitio web", "Qué vende, quién lo compra, dónde están y qué hacen en su sitio."],
    ["Su mezcla de canales", `TV por streaming (CTV), video en línea, display, native y retargeting: cuáles le convienen y cómo repartir el presupuesto inicial que elija (desde $${MIN_BUDGET}).`],
    ["A quién llegamos", "Ubicaciones, edades, audiencias y el contenido que ven y leen."],
    ["Los anuncios que necesita", "Formatos, tamaños y duraciones, y el mensaje de cada uno."],
    ["Cómo se cuentan los resultados", "El resultado que vamos a medir y cómo se configura el seguimiento."],
    ["Sus primeros 30 días", "Desde que abre su cuenta hasta que sus anuncios salen al aire y la primera revisión."],
  ] : [
    ["What we learned from your website", "What you sell, who buys it, where they are and what they do on your site."],
    ["Your channel mix", `Streaming TV (CTV), online video, display, native and retargeting: which fit you, and how to split the starting budget you choose (from $${MIN_BUDGET}).`],
    ["Who we reach", "Locations, ages, audiences and the content they watch and read."],
    ["The ads you need", "Formats, sizes and lengths, and the message for each."],
    ["How results are counted", "The one result to track, and how tracking is set up."],
    ["Your first 30 days", "From opening your account to your ads going live and the first review."],
  ];
  const FAQ: [string, string][] = lang === "es" ? [
    ["¿Cómo funciona el planificador de anuncios?", "Usted escribe su sitio web, el nombre de su negocio, su industria, su zona y el presupuesto inicial que tiene en mente. Leemos su página principal y algunas páginas clave, como servicios, productos y contacto, y escribimos un plan inicial de anuncios para TV por streaming, video en línea, display, native y retargeting, repartido para ese presupuesto."],
    ["¿El plan de anuncios es gratis?", "Sí. El plan es gratis y se guarda con su correo. Lo acompaña si abre una cuenta, y lo usamos para su configuración y el resumen de su campaña."],
    ["¿Qué es la publicidad CTV?", "La publicidad CTV (TV conectada) son anuncios de video en aplicaciones de TV por streaming que se ven en un televisor, como smart TVs y dispositivos de streaming. Se puede segmentar por ubicación, edad e intereses, igual que los anuncios en internet."],
    ["¿Cuánto cuesta poner el plan en marcha?", `Las cuentas empiezan desde un presupuesto de anuncios de $${MIN_BUDGET}. Sin tarifa mensual de plataforma. Nuestra tarifa está incluida en el precio de sus anuncios. Sus anuncios están activos en ${SETUP_DAYS} días después del pago.`],
    ["¿El plan predice mis resultados?", "No. La publicidad no puede garantizar resultados. El plan explica para qué sirve cada canal y cómo se cuentan los resultados. Lo confirmamos con usted antes de que salga cualquier anuncio."],
    ["¿Qué hacen con mi sitio web?", "Leemos una vez las páginas públicas de su sitio web para escribir el plan. No cambiamos nada en su sitio."],
  ] : [
    ["How does the ad planner work?", "You enter your website, business name, industry, area and the starting budget you have in mind. We read your homepage and a few key pages, such as services, products and contact, then write a starting ad plan for streaming TV, online video, display, native and retargeting ads, split for that budget."],
    ["Is the ad plan free?", "Yes. The plan is free and saved to your email. It goes with you if you open an account, and we use it for your setup and campaign brief."],
    ["What is CTV advertising?", "CTV (connected TV) advertising means video ads on streaming TV apps watched on a television, such as smart TVs and streaming sticks. You can target it by location, age and interest, like online ads."],
    ["What does the plan cost to run?", `Accounts start from a $${MIN_BUDGET} ad budget. No monthly platform fee. Our fee is included in the price of your ads. Your ads are live within ${SETUP_DAYS} days of payment.`],
    ["Does the plan predict my results?", "No. Advertising can't guarantee results. The plan says what each channel is for and how results are counted. We confirm it with you before anything runs."],
    ["What do you do with my website?", "We read the public pages of your website once to write the plan. We do not change anything on your site."],
  ];
  return { t, DESCRIPTION, COVERS, FAQ };
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang(); const { t, DESCRIPTION } = content(lang);
  return pageMeta({ lang, title: t("Free Ad Planner for Streaming TV and Programmatic", "Planificador de anuncios gratis para TV por streaming y programática"), description: DESCRIPTION, path: PATH });
}

export default async function Planner() {
  const lang = await getLang();
  const { t, DESCRIPTION, COVERS, FAQ } = content(lang);
  const URL = `${SITE_URL}${localePath(PATH, lang)}`;
  const graph = pageGraph({
    lang, path: PATH, name: t("Free ad planner", "Planificador de anuncios gratis"), description: DESCRIPTION, trail: [[t("Home", "Inicio"), "/"], [t("Ad planner", "Planificador de anuncios"), PATH]], about: [ID.ads, ID.org],
    faq: FAQ, main: `${URL}#app`,
    nodes: [{
      "@type": "WebApplication", "@id": `${URL}#app`, name: t("DSP Connect ad planner", "Planificador de anuncios de DSP Connect"), url: URL, inLanguage: lang === "es" ? "es-US" : "en-US",
      applicationCategory: "BusinessApplication", operatingSystem: "Any (web browser)", browserRequirements: "Requires JavaScript",
      description: DESCRIPTION, isAccessibleForFree: true, provider: { "@id": ID.org }, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: COVERS.map(([t]) => t),
    },
    videoNode(VIDEOS.plannerOwners, PATH, "video", lang),
    {
      "@type": "HowTo", "@id": `${URL}#howto`, name: t("How to get a free ad plan from your website", "Cómo obtener un plan de anuncios gratis a partir de su sitio web"),
      description: t("Get a streaming TV and programmatic ad plan written from your own website, then build the campaign in the demo account.", "Reciba un plan de anuncios de TV por streaming y programática escrito a partir de su propio sitio web, y luego arme la campaña en la cuenta de demostración."),
      totalTime: "PT1M", tool: [{ "@type": "HowToTool", name: t("Your business website", "El sitio web de su negocio") }], video: { "@id": `${URL}#video` },
      step: (lang === "es" ? [
        ["Escriba sus datos", `Escriba su sitio web, el nombre de su negocio, su correo, su industria, dónde están sus clientes y su presupuesto inicial (desde $${MIN_BUDGET}).`],
        ["Reciba su plan", "Leemos su sitio web y escribimos un plan: qué vende y quién lo compra, la mezcla de canales y el reparto del presupuesto, a quién llegar, los anuncios que necesita y cómo se cuentan los resultados."],
        ["Véalo en su cuenta de demostración", "Abra el plan en su cuenta de demostración y presione Crear esta campaña para llenar el creador de campañas a partir del plan."],
        ["Abra su cuenta con el plan", `Abra su cuenta con el plan adjunto. Lo usamos para su configuración, y sus anuncios están activos en ${SETUP_DAYS} días.`],
      ] : [
        ["Enter your details", "Enter your website, business name, email, industry, where your customers are and your starting budget (from $" + MIN_BUDGET + ")."],
        ["Get your plan", "We read your website and write a plan: what you sell and who buys it, the channel mix and budget split, who to reach, the ads you need and how results are counted."],
        ["See it in your demo account", "Open the plan in your demo account and press Build this campaign to fill in the campaign builder from the plan."],
        ["Open your account with the plan", "Open your account with the plan attached. We use it for your setup, and your ads are live within " + SETUP_DAYS + " days."],
      ]).map(([name, text], i) => ({ "@type": "HowToStep", position: i + 1, name, text, url: `${URL}#app` })),
    }],
  });
  return (
    <>
      <JsonLd data={graph} />
      <Header />
      <main>
        <section id="top" className="hero" style={{ paddingBottom: 48, scrollMarginTop: 80 }}>
          <PlannerApp intro={
            <>
              <div className="eyebrow">{t("Free ad planner", "Planificador de anuncios gratis")}</div>
              <h1 className="h1" style={{ maxWidth: 720 }}>{t("Your website in. Your ad plan out.", "Entra su sitio web. Sale su plan de anuncios.")}</h1>
              <p className="lead" style={{ maxWidth: 640 }}>
                {t(`Enter your website and we read it the way a media planner would, then write a plan for streaming TV, online video, display, native and retargeting ads: which channels fit, how to split the budget you choose (from $${MIN_BUDGET}), who to reach, which ads you need and how results are counted.`,
                  `Escriba su sitio web y lo leemos como lo haría un planificador de medios, y luego escribimos un plan de anuncios para TV por streaming, video en línea, display, native y retargeting: qué canales le convienen, cómo repartir el presupuesto que elija (desde $${MIN_BUDGET}), a quién llegar, qué anuncios necesita y cómo se cuentan los resultados.`)}
              </p>
              <ul className="list" style={{ fontSize: 15 }}>
                <li>{t("Free, in about 30 seconds.", "Gratis, en unos 30 segundos.")}</li>
                <li>{t("Saved to your email, and it carries into your account.", "Guardado con su correo, y pasa a su cuenta.")}</li>
                <li>{t("Open it in your demo account and build the campaign.", "Ábralo en su cuenta de demostración y arme la campaña.")}</li>
              </ul>
            </>
          } />
        </section>

        <PlannerVideo v={VIDEOS.plannerOwners} id="watch" eyebrow={t("Watch", "Vea")} title={t("See the planner in 60 seconds.", "Vea el planificador en 60 segundos.")} cta={t("Get your free ad plan", "Obtenga su plan gratis")} href="#top"
          points={lang === "es"
            ? ["Escriba su sitio web, su zona y el presupuesto que tiene en mente.", "Reciba la mezcla de canales y el reparto del presupuesto, en dólares, con la razón de cada uno.", "Ábralo en su cuenta de demostración y arme la campaña.", "Abra su cuenta con el plan adjunto cuando esté listo."]
            : ["Enter your website, area and the budget you have in mind.", "Get the channel mix and budget split, in dollars, with the reason for each.", "Open it in your demo account and build the campaign.", "Open your account with the plan attached when you are ready."]} />

        <section className="section band" aria-labelledby="covers-h">
          <div className="wrap stack g24">
            <h2 id="covers-h" className="h2">{t("What your plan covers", "Lo que cubre su plan")}</h2>
            <div className="grid cols-3" style={{ gap: 16 }}>
              {COVERS.map(([h, d], i) => (
                <div key={h} className="step stack g8"><div className="num">{String(i + 1).padStart(2, "0")}</div><h3 className="h3">{h}</h3><p className="p" style={{ fontSize: 15 }}>{d}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="faq-h">
          <div className="wrap narrow stack g24">
            <h2 id="faq-h" className="h2">{t("Questions about the ad planner", "Preguntas sobre el planificador de anuncios")}</h2>
            <div>{FAQ.map(([q, a]) => <div key={q} className="faq stack g8"><h3 className="h3">{q}</h3><p className="p faq-a">{a}</p></div>)}</div>
            <p className="small">{t("Want to see the platform first?", "¿Quiere ver la plataforma primero?")} <Link href="/#market">{t("Open the demo account", "Abra la cuenta de demostración")}</Link> {t("or", "o")} <Link href="/videos">{t("watch the videos", "vea los videos")}</Link>.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
