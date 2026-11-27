// The questions answered on the site, in one place. Each list is shown on its page and also feeds that page's
// structured data (FAQPage) and llms.txt, so what search engines, AI assistants and visitors read never differs.
import { EXCHANGES, MIN_BUDGET, SETUP_DAYS, SHARE_PCT, PARTNER_PCT } from "./site";

type QA = [question: string, answer: string];

export const HOME_FAQ: QA[] = [
  ["What is DSP Connect?", `DSP Connect is a programmatic advertising service for businesses and agencies. It buys ads on streaming TV, apps and websites across ${EXCHANGES} ad exchanges, the same kind of buying big brands do, open to any business from a $${MIN_BUDGET} ad budget, with the account set up for you.`],
  ["How is DSP Connect different from The Trade Desk or Amazon DSP?", `The Trade Desk starts with a sales conversation and a negotiated contract, and Amazon DSP is built around Amazon shoppers and Amazon's own properties. DSP Connect is open to any business from a $${MIN_BUDGET} ad budget with no long-term contract, and we set up the account, tracking, ads and audience for you within ${SETUP_DAYS} days.`],
  ["What is programmatic advertising?", "Programmatic advertising is buying ad space automatically, one impression at a time, across many apps, websites and streaming TV services at once, instead of booking each one separately. A demand-side platform (DSP) is the software that does the buying."],
  ["Can I advertise on streaming TV (CTV)?", "Yes. Video ads can run on streaming TV apps watched on connected TVs, as well as on apps and websites, from the same account and the same budget."],
  ["What is the smallest budget I can start with?", `The minimum starting ad budget is $${MIN_BUDGET}, with no long-term contract.`],
  ["How long until my ads are running?", `Within ${SETUP_DAYS} days of paying. We use that time to set up your account, tracking, ads and audience for you.`],
  ["Where do my ads appear?", `On streaming TV, apps and websites reached through ${EXCHANGES} ad exchanges. You can approve or block specific apps and sites.`],
  ["How do I know it is working?", "You get your own login showing views, clicks and spend, plus tracking on your website that counts leads and sales."],
  ["How does the campaign improve over time?", "Automatic rules drop the apps and sites that are not performing and move your budget to the ones that are."],
  ["What does it cost?", "No monthly platform fee. Our fee is included in the price of your ads."],
];

export const PARTNER_FAQ: QA[] = [
  ["Who is this for?", "ISOs and merchant-services agents, POS and telecom sellers, marketing consultants and independent reps who already call on local businesses. You can join as an individual or as a company."],
  ["Do I need advertising experience?", "No. If you can talk to a business owner about getting more customers, the training and the demo cover the rest."],
  ["What do my clients pay?", `Accounts start from a $${MIN_BUDGET} ad budget. There is no monthly platform fee: our fee is included in the price of the ads, and there is no long-term contract.`],
  ["Do I set prices or resell?", "No. You are an independent sales partner, not a reseller. Clients contract and pay DSP Connect directly, so you never carry billing risk."],
  ["Is there a cost to join?", "No. There is no fee to apply or to join. It is commission only: no salary, no draw and no guaranteed income."],
  ["Can my team sell under my company?", "Yes. Add your reps in your partner portal under Your team. Each rep gets their own sign-in and their own planner, demo and sign-up links, and only sees their own clients. Every client is credited to you, you see which rep brought each one, and all commission is paid to you; you pay your reps however you choose. Your company makes sure they follow our rules. Outside sub-agents are not part of the program."],
  ["Sales Partner or agency: which is right for me?", `Will you introduce business owners and let DSP Connect set up and run their advertising? Become a Sales Partner: you earn ${PARTNER_PCT}% of each client's qualified ad spend, paid daily through Stripe, for as long as they spend. Will you run your clients' campaigns yourself, in your own agency account with a login for each client? Join as an agency at /agencies: you earn ${SHARE_PCT}% of the ad spend you manage, paid through PartnerStack.`],
];

// Spanish (neutral US Spanish, "usted").
export const HOME_FAQ_ES: QA[] = [
  ["¿Qué es DSP Connect?", `DSP Connect es un servicio de publicidad programática para negocios y agencias. Compra anuncios en TV por streaming, aplicaciones y sitios web a través de más de ${EXCHANGES.replace("+", "")} exchanges de anuncios, el mismo tipo de compra que hacen las grandes marcas, abierto a cualquier negocio desde un presupuesto de anuncios de $${MIN_BUDGET}, con la cuenta configurada para usted.`],
  ["¿En qué se diferencia DSP Connect de The Trade Desk o Amazon DSP?", `The Trade Desk empieza con una conversación de ventas y un contrato negociado, y Amazon DSP está pensado para los compradores de Amazon y las propiedades de Amazon. DSP Connect está abierto a cualquier negocio desde un presupuesto de anuncios de $${MIN_BUDGET}, sin contrato a largo plazo, y nosotros configuramos la cuenta, el seguimiento, los anuncios y la audiencia por usted en un plazo de ${SETUP_DAYS} días.`],
  ["¿Qué es la publicidad programática?", "La publicidad programática es la compra automática de espacios publicitarios, una impresión a la vez, en muchas aplicaciones, sitios web y servicios de TV por streaming al mismo tiempo, en lugar de reservar cada uno por separado. Una plataforma del lado de la demanda (DSP) es el software que hace la compra."],
  ["¿Puedo anunciarme en TV por streaming (CTV)?", "Sí. Los anuncios de video pueden aparecer en aplicaciones de TV por streaming vistas en televisores conectados, además de en aplicaciones y sitios web, desde la misma cuenta y con el mismo presupuesto."],
  ["¿Cuál es el presupuesto mínimo para empezar?", `El presupuesto inicial mínimo de anuncios es de $${MIN_BUDGET}, sin contrato a largo plazo.`],
  ["¿Cuánto tardan en salir mis anuncios?", `En un plazo de ${SETUP_DAYS} días después del pago. Usamos ese tiempo para configurar su cuenta, el seguimiento, los anuncios y la audiencia por usted.`],
  ["¿Dónde aparecen mis anuncios?", `En TV por streaming, aplicaciones y sitios web a través de más de ${EXCHANGES.replace("+", "")} exchanges de anuncios. Puede aprobar o bloquear aplicaciones y sitios específicos.`],
  ["¿Cómo sé si está funcionando?", "Recibe su propio acceso, donde ve las visualizaciones, los clics y el gasto, además de un seguimiento en su sitio web que cuenta los contactos y las ventas."],
  ["¿Cómo mejora la campaña con el tiempo?", "Reglas automáticas quitan las aplicaciones y sitios que no rinden y pasan su presupuesto a los que sí."],
  ["¿Cuánto cuesta?", "Sin tarifa mensual de plataforma. Nuestra tarifa está incluida en el precio de sus anuncios."],
];

export const PARTNER_FAQ_ES: QA[] = [
  ["¿Para quién es?", "Para ISOs y agentes de servicios para comerciantes, vendedores de puntos de venta y telecomunicaciones, consultores de marketing y representantes independientes que ya visitan negocios locales. Puede unirse como persona o como empresa."],
  ["¿Necesito experiencia en publicidad?", "No. Si puede hablar con el dueño de un negocio sobre cómo conseguir más clientes, la capacitación y la demo cubren el resto."],
  ["¿Cuánto pagan mis clientes?", `Las cuentas empiezan desde un presupuesto de anuncios de $${MIN_BUDGET}. No hay tarifa mensual de plataforma: nuestra tarifa está incluida en el precio de los anuncios, y no hay contrato a largo plazo.`],
  ["¿Fijo yo los precios o revendo?", "No. Usted es un socio de ventas independiente, no un revendedor. Los clientes contratan y pagan directamente a DSP Connect, así que usted nunca asume riesgo de cobro."],
  ["¿Cuesta algo unirse?", "No. No hay ninguna tarifa para solicitar ni para unirse. Es solo comisión: sin salario, sin anticipos y sin ingresos garantizados."],
  ["¿Puede mi equipo vender bajo mi empresa?", "Sí. Agregue a sus representantes en su portal de socio, en Su equipo. Cada representante recibe su propio acceso y sus propios enlaces al planificador, la demo y el registro, y solo ve sus propios clientes. Cada cliente se le acredita a usted, usted ve qué representante trajo a cada uno, y toda la comisión se le paga a usted; usted les paga a sus representantes como prefiera. Su empresa se asegura de que cumplan nuestras reglas. Los subagentes externos no forman parte del programa."],
  ["¿Socio de Ventas o agencia: cuál me conviene?", `¿Va a presentar dueños de negocios y dejar que DSP Connect configure y maneje su publicidad? Hágase Socio de Ventas: gana el ${PARTNER_PCT}% del gasto publicitario calificado de cada cliente, pagado a diario por Stripe, mientras el cliente siga gastando. ¿Va a manejar usted mismo las campañas de sus clientes, en su propia cuenta de agencia con un acceso para cada cliente? Únase como agencia en /es/agencies: gana el ${SHARE_PCT}% del gasto publicitario que administra, pagado por PartnerStack.`],
];

export const homeFaq = (lang: "en" | "es") => (lang === "es" ? HOME_FAQ_ES : HOME_FAQ);
export const partnerFaq = (lang: "en" | "es") => (lang === "es" ? PARTNER_FAQ_ES : PARTNER_FAQ);
