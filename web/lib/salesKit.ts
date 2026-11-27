import { MIN_BUDGET, SETUP_DAYS } from "./site";

// The Authorized Sales Partner sales kit: the one source for prospect emails, the first-call script and
// answers to common objections. The portal shows it with each partner's own link filled in, and the
// training program builds on the same text. Every line follows the Operating Rules: no promised or
// estimated results, no technology providers, the fee line exactly as written, never advise spending more.

export const FEE_LINE = "No monthly platform fee. Our fee is included in the price of your ads.";

/** Placeholders: {first} prospect's first name, {business}, {me} partner's name, {company} partner's company or name, {demo} and {open} partner links. */
export type Template = { id: string; title: string; when: string; subject: string; body: string };

export const EMAILS: Template[] = [
  {
    id: "intro",
    title: "First email",
    when: "To a business owner you already know or have just met.",
    subject: "Ads on streaming TV and apps for {business}",
    body: `Hi {first},

I work with DSP Connect, which puts local businesses' ads on streaming TV, websites and apps, aimed at people in the area you serve.

The easiest way to see it is the demo: it opens a sample account set up for a business like yours, so you can see where the ads appear and who they reach before spending anything.

{demo}

Accounts start from a $${MIN_BUDGET} ad budget. ${FEE_LINE} DSP Connect does the setup, and you are live within ${SETUP_DAYS} days.

Would 20 minutes this week work to walk through it together?

{me}
{company}`,
  },
  {
    id: "after-demo",
    title: "After the demo",
    when: "Same day as you walk a prospect through the demo.",
    subject: "Your DSP Connect demo",
    body: `Hi {first},

Thanks for going through the demo today. As we discussed, here is the link to open your account when you are ready:

{open}

What happens next: you pay your starting ad budget online, DSP Connect sets up your account, tracking, ads and audience, and your ads are live within ${SETUP_DAYS} days. You will get a short campaign brief to fill in, which takes about ten minutes.

If anything is unclear, reply here and I will help.

{me}`,
  },
  {
    id: "follow-up",
    title: "Gentle follow-up",
    when: "About a week after the first email if you have not heard back. Send it once.",
    subject: "Following up on DSP Connect",
    body: `Hi {first},

Just following up in case my last note got buried. If reaching more people in your area is on your list this season, the demo shows what it would look like for {business} in a couple of minutes:

{demo}

If now is not the right time, no problem at all. Just let me know and I will not keep following up.

{me}`,
  },
];

export const CALL_SCRIPT: { step: string; say: string[] }[] = [
  { step: "Open (1 minute)", say: [
    "Thank them for the time and say what the call is for: to see whether advertising on streaming TV, websites and apps makes sense for their business.",
    "Ask for 20 minutes and promise to tell them honestly if it is not a fit.",
  ] },
  { step: "Ask before you tell (5 minutes)", say: [
    "What does a good customer look like for you?",
    "Where do most of your customers come from today?",
    "What area do you serve?",
    "What have you tried in advertising, and what worked or did not?",
    "What would you count as a good result: calls, form leads, bookings, store visits, online sales or awareness?",
  ] },
  { step: "Show the demo (8 minutes)", say: [
    "Open the demo with their industry and area. Show where the ads appear, who they reach in that area, and what the results page will show them.",
    "Build a short practice campaign with them. Let them choose; do not drive.",
  ] },
  { step: "Explain how it works (3 minutes)", say: [
    `Accounts start from a $${MIN_BUDGET} ad budget, paid online to DSP Connect. ${FEE_LINE}`,
    `DSP Connect does the setup (account, tracking, ad review and audience) and they are live within ${SETUP_DAYS} days. After that they run the account themselves, with support.`,
    "There is no long-term contract.",
  ] },
  { step: "One next step (2 minutes)", say: [
    "Agree one next step before you hang up: open the account now, or a second look at the demo with their questions answered by Fin in the chat.",
    "Send the matching email from your kit the same day.",
  ] },
];

export const OBJECTIONS: { q: string; a: string }[] = [
  { q: "How many leads or sales will I get?", a: "Nobody can honestly promise that, and DSP Connect does not. What the demo shows is where your ads appear and who they reach in your area, and your account shows every result your tracking counts once you are live." },
  { q: "What does it cost?", a: `Accounts start from a $${MIN_BUDGET} ad budget. ${FEE_LINE} There is no long-term contract.` },
  { q: `Is $${MIN_BUDGET} enough?`, a: "It is the starting budget, and you choose what to spend. I will not tell you to spend more; the setup team will help you make the most of the budget you choose." },
  { q: "I already run Google or Facebook ads.", a: "This reaches people in other places: streaming TV, apps and websites. Many businesses use it alongside what they already run." },
  { q: "Who runs the ads after setup?", a: "You do, with support. DSP Connect does the setup and helps you along the way, and your account shows everything." },
  { q: "Do I pay you?", a: "No. You pay DSP Connect directly through their website. I never handle your money or your card details." },
  { q: "What do you use to run the ads?", a: "DSP Connect's own platform. I am not able to go into the technology behind it, but the demo shows exactly what you get." },
];

/** Fills a template's placeholders. */
export function fill(text: string, v: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (m, k) => (k in v && v[k] ? v[k] : m));
}

// ─── Spanish ─────────────────────────────────────────────────────────────────────────────────────
// The same kit in neutral US Spanish ("usted"), for partners selling to Spanish-speaking owners.
// Same rules: no promised results, the fee line exactly as written, never advise spending more.

export const FEE_LINE_ES = "Sin cuota mensual de plataforma. Nuestra tarifa está incluida en el precio de sus anuncios.";

export const EMAILS_ES: Template[] = [
  {
    id: "intro",
    title: "Primer correo",
    when: "Para un dueño de negocio que ya conoce o que acaba de conocer.",
    subject: "Anuncios en TV por streaming y apps para {business}",
    body: `Hola, {first}:

Trabajo con DSP Connect, que pone los anuncios de negocios locales en TV por streaming, sitios web y apps, dirigidos a las personas de la zona que usted atiende.

La forma más fácil de verlo es la demostración: abre una cuenta de ejemplo configurada para un negocio como el suyo, para que vea dónde aparecen los anuncios y a quién llegan antes de gastar nada.

{demo}

Las cuentas empiezan con un presupuesto publicitario de $${MIN_BUDGET}. ${FEE_LINE_ES} DSP Connect hace la configuración y sus anuncios están activos en ${SETUP_DAYS} días.

¿Le funcionan 20 minutos esta semana para verlo juntos?

{me}
{company}`,
  },
  {
    id: "after-demo",
    title: "Después de la demostración",
    when: "El mismo día en que le muestra la demostración a un prospecto.",
    subject: "Su demostración de DSP Connect",
    body: `Hola, {first}:

Gracias por ver la demostración hoy. Como hablamos, aquí está el enlace para abrir su cuenta cuando esté listo:

{open}

Lo que sigue: paga su presupuesto publicitario inicial en línea, DSP Connect configura su cuenta, el seguimiento, los anuncios y la audiencia, y sus anuncios están activos en ${SETUP_DAYS} días. Recibirá un breve resumen de campaña para llenar, que toma unos diez minutos.

Si algo no está claro, responda a este correo y con gusto le ayudo.

{me}`,
  },
  {
    id: "follow-up",
    title: "Seguimiento amable",
    when: "Más o menos una semana después del primer correo si no ha recibido respuesta. Envíelo una sola vez.",
    subject: "Seguimiento sobre DSP Connect",
    body: `Hola, {first}:

Le escribo por si mi mensaje anterior se perdió. Si llegar a más personas en su zona está entre sus planes esta temporada, la demostración le muestra en un par de minutos cómo se vería para {business}:

{demo}

Si ahora no es buen momento, no hay ningún problema. Solo avíseme y no le volveré a escribir.

{me}`,
  },
];

export const CALL_SCRIPT_ES: { step: string; say: string[] }[] = [
  { step: "Apertura (1 minuto)", say: [
    "Agradezca su tiempo y diga para qué es la llamada: ver si la publicidad en TV por streaming, sitios web y apps tiene sentido para su negocio.",
    "Pida 20 minutos y prometa decirle con honestidad si no es para su negocio.",
  ] },
  { step: "Pregunte antes de explicar (5 minutos)", say: [
    "¿Cómo es un buen cliente para usted?",
    "¿De dónde vienen hoy la mayoría de sus clientes?",
    "¿Qué zona atiende?",
    "¿Qué ha probado en publicidad, y qué funcionó o qué no?",
    "¿Qué consideraría un buen resultado: llamadas, formularios, citas, visitas a la tienda, ventas en línea o que lo conozcan más?",
  ] },
  { step: "Muestre la demostración (8 minutos)", say: [
    "Abra la demostración con su industria y su zona. Muestre dónde aparecen los anuncios, a quién llegan en esa zona y qué le mostrará la página de resultados.",
    "Arme con él una campaña de práctica corta. Deje que él elija; no lleve el control.",
  ] },
  { step: "Explique cómo funciona (3 minutos)", say: [
    `Las cuentas empiezan con un presupuesto publicitario de $${MIN_BUDGET}, pagado en línea a DSP Connect. ${FEE_LINE_ES}`,
    `DSP Connect hace la configuración (cuenta, seguimiento, revisión de anuncios y audiencia) y está activo en ${SETUP_DAYS} días. Después, él maneja la cuenta con apoyo.`,
    "No hay contrato a largo plazo.",
  ] },
  { step: "Un siguiente paso (2 minutos)", say: [
    "Acuerden un siguiente paso antes de colgar: abrir la cuenta ahora, o ver la demostración otra vez con sus preguntas respondidas por Fin en el chat.",
    "Envíe el correo correspondiente de su kit ese mismo día.",
  ] },
];

export const OBJECTIONS_ES: { q: string; a: string }[] = [
  { q: "¿Cuántos clientes o ventas voy a conseguir?", a: "Nadie puede prometer eso con honestidad, y DSP Connect no lo hace. La demostración le muestra dónde aparecen sus anuncios y a quién llegan en su zona, y su cuenta le muestra cada resultado que su seguimiento registre una vez que esté activo." },
  { q: "¿Cuánto cuesta?", a: `Las cuentas empiezan con un presupuesto publicitario de $${MIN_BUDGET}. ${FEE_LINE_ES} No hay contrato a largo plazo.` },
  { q: `¿Alcanzan $${MIN_BUDGET}?`, a: "Es el presupuesto inicial, y usted decide cuánto invertir. No le voy a decir que gaste más; el equipo de configuración le ayudará a aprovechar al máximo el presupuesto que elija." },
  { q: "Ya tengo anuncios en Google o Facebook.", a: "Esto llega a las personas en otros lugares: TV por streaming, apps y sitios web. Muchos negocios lo usan junto con lo que ya tienen." },
  { q: "¿Quién maneja los anuncios después de la configuración?", a: "Usted, con apoyo. DSP Connect hace la configuración y le ayuda en el camino, y su cuenta le muestra todo." },
  { q: "¿Le pago a usted?", a: "No. Usted le paga directamente a DSP Connect en su sitio web. Yo nunca manejo su dinero ni los datos de su tarjeta." },
  { q: "¿Qué usan para manejar los anuncios?", a: "La plataforma propia de DSP Connect. No puedo entrar en detalles de la tecnología, pero la demostración le muestra exactamente lo que recibe." },
];

export const emailsFor = (lang: "en" | "es") => (lang === "es" ? EMAILS_ES : EMAILS);
export const callScriptFor = (lang: "en" | "es") => (lang === "es" ? CALL_SCRIPT_ES : CALL_SCRIPT);
export const objectionsFor = (lang: "en" | "es") => (lang === "es" ? OBJECTIONS_ES : OBJECTIONS);
