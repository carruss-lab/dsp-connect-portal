// The facts about DSP Connect, stated once. Shown on the About page and in llms.txt, so every place that
// describes the company (to visitors, search engines and AI assistants) says the same thing.
// Only what is true and on the site: no results, ratings or client names.
import { EXCHANGES, MIN_BUDGET, SETUP_DAYS, SHARE_PCT, PARTNER_PCT } from "./site";

export const FACTS: [string, string][] = [
  ["What it is", "Programmatic advertising (a demand-side platform service) with done-for-you setup"],
  ["Where ads run", `Streaming TV (connected TV), apps and websites, across ${EXCHANGES} ad exchanges`],
  ["Ad formats", "Video, banner and native ads"],
  ["Minimum ad budget", `$${MIN_BUDGET} to start`],
  ["Time to live", `Within ${SETUP_DAYS} days of payment: account, tracking, ad review and audience set up for you`],
  ["Pricing", "No monthly platform fee. Our fee is included in the price of your ads."],
  ["Contract", "No long-term contract. Cancel any time; unspent ad budget is refunded, less the payment processing fee."],
  ["Reporting", "Your own login with views, clicks and spend, plus tracking on your website that counts leads and sales"],
  ["Agency program", `Agencies earn ${SHARE_PCT}% of the ad spend they manage and keep their client relationships. Paid through PartnerStack`],
  ["Sales partner program", `Free to join; partners earn ${PARTNER_PCT}% of their clients' qualified ad spend. Paid daily through Stripe`],
  ["Who it is for", "Business owners, advertising agencies and independent sales partners"],
];

/** The same facts in Spanish, for the Spanish About page. */
export const FACTS_ES: [string, string][] = [
  ["Qué es", "Publicidad programática (un servicio de plataforma del lado de la demanda, DSP) con configuración hecha por nosotros"],
  ["Dónde se muestran los anuncios", `TV por streaming (TV conectada), apps y sitios web, en ${EXCHANGES} intercambios publicitarios`],
  ["Formatos de anuncio", "Anuncios en video, banner y nativos"],
  ["Presupuesto publicitario mínimo", `$${MIN_BUDGET} para empezar`],
  ["Tiempo para estar activo", `En ${SETUP_DAYS} días desde el pago: cuenta, seguimiento, revisión de anuncios y audiencia configurados por nosotros`],
  ["Precios", "Sin cuota mensual de plataforma. Nuestra tarifa está incluida en el precio de sus anuncios."],
  ["Contrato", "Sin contrato a largo plazo. Cancele cuando quiera; el presupuesto no invertido se reembolsa, menos la comisión de procesamiento del pago."],
  ["Reportes", "Su propio acceso con vistas, clics y gasto, más seguimiento en su sitio web que cuenta clientes potenciales y ventas"],
  ["Programa para agencias", `Las agencias ganan el ${SHARE_PCT}% del gasto publicitario que administran y conservan la relación con sus clientes. Pagado a través de PartnerStack`],
  ["Programa de socios de ventas", `Unirse es gratis; los socios ganan el ${PARTNER_PCT}% del gasto publicitario calificado de sus clientes. Pagado a diario a través de Stripe`],
  ["Para quién es", "Dueños de negocio, agencias de publicidad y socios de ventas independientes"],
  ["Idiomas", "Sitio, chat y soporte en inglés y en español"],
];
