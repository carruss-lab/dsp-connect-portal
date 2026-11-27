import { MIN_BUDGET, SETUP_DAYS, PARTNER_PCT } from "./site";
import { FEE_LINE_ES } from "./salesKit";

// The Authorized Sales Partner course: 14 video lessons (YouTube, unlisted), each with key points and a
// checklist line the partner ticks. Finishing all 14 marks the partner trained. Scripts and videos are
// produced from the dsp-videos project; keep the wording here in step with them.
export type Lesson = { id: string; title: string; minutes: number; video: string; points: string[]; check: string };

export const LESSONS: Lesson[] = [
  { id: "v1-welcome", title: "Welcome and how this program works", minutes: 2, video: "vaBohuRLAXQ",
    points: ["Your role: introduce DSP Connect to owners you know, show the demo, help them open an account through your link.", "You never set prices, take money, run campaigns or promise results.", "Five steps to your first commission: training, payouts, first demo, first account, their ads run."],
    check: "I know the five steps to my first commission." },
  { id: "v2-agreement", title: "Your agreement in plain English", minutes: 2, video: "1Bv5awl2cB8",
    points: ["You are an independent contractor, not staff and not a reseller. Company partners are responsible for their staff.", "No sub-agents. Clients contract with and pay DSP Connect. Confidentiality and 12 months of no soliciting.", "Either side can end it with 30 days' notice; residuals continue unless it ends for cause."],
    check: "I have read my signed agreement and Exhibits A and B." },
  { id: "v3-pay", title: "How you get paid", minutes: 2, video: "XiKSNtEgijI",
    points: [`${PARTNER_PCT}% of qualified ad spend: paid in full by the client and actually spent on their ads.`, "Held 7 days, then paid daily through Stripe. Your first payout is checked by a person.", "Refunds and chargebacks reverse commission. Residuals for life, unless ended for cause. No salary or guarantee."],
    check: "I can explain when and how I am paid, and what reverses commission." },
  { id: "v4-product", title: "What DSP Connect is, and who it fits", minutes: 2, video: "eBMUX37h7UE",
    points: [`From a $${MIN_BUDGET} ad budget. No monthly platform fee. Our fee is included in the price of your ads. Live within ${SETUP_DAYS} days, no long-term contract.`, "We set up account, tracking, ad review and audience; the client runs it with support.", "Poor fits: anyone needing guaranteed results, a tight budget, or someone to run it for them."],
    check: "I can explain DSP Connect in two sentences and spot a poor fit." },
  { id: "v5-screens", title: "The account, screen by screen", minutes: 2, video: "tEY0PWG7sR4",
    points: ["Explore, Dashboard, Campaigns, Audience, Conversion Tracking, Analytics and Traffic Funnel.", "Creative Assets, Allowlist / Blocklist, Retargeting, Custom Locations, Billing, Planning and Autopilot.", "Never suggest a client adds funds."],
    check: "I can open and explain every screen without notes." },
  { id: "v6-after-pay", title: "What happens after a client pays", minutes: 2, video: "uA90O3r3bm8",
    points: ["Payment email and setup page; the campaign brief takes about 10 minutes. Help them send it the same day.", `Four setup steps, live within ${SETUP_DAYS} days, then their own login.`, "Billing, refunds, cancellations and logins always go to DSP Connect support."],
    check: `I can tell a client exactly what happens in their first ${SETUP_DAYS} days.` },
  { id: "v7-who", title: "Who to talk to", minutes: 1, video: "ovecY07xXeY",
    points: ["Start with owners you already know and serve; ask happy clients for warm introductions.", "No cold outreach: no bulk messages to people who didn't agree, no ads, domains or social accounts using our name.", "Write your list of 20 owners you know."],
    check: "I will only contact people who know me or asked." },
  { id: "v8-conversation", title: "The first conversation", minutes: 2, video: "BDubG-FdoYI",
    points: ["Open, ask before you tell, show the demo, explain how it works, agree one next step.", "They choose the budget. Never push higher, never estimate results.", "Practise the whole call out loud; ask Fin to play the owner."],
    check: "I have practised the full call out loud once." },
  { id: "v9-demo", title: "Running the demo live", minutes: 2, video: "mvyiowU1ejA",
    points: ["Always use your own demo link with your partner code.", "Show where the ads appear, who they reach, and what results they will see. Say the sample data is not real results.", "Let them build a practice campaign; never name the technology or suggest a bigger budget."],
    check: "I have run the demo end to end for a practice prospect." },
  { id: "v10-objections", title: "Questions and objections", minutes: 2, video: "9kg80opbSLE",
    points: ["Use the approved answers in your sales kit, word for word.", "Never promise results; state the price and fee line exactly.", "Don't know? \"Let me get DSP Connect to answer that properly.\""],
    check: "I can answer every objection in the kit without promising results." },
  { id: "v11-kit", title: "Your sales kit", minutes: 2, video: "onDrqaxIeL4",
    points: ["Three emails with your links filled in: first email, after the demo, one gentle follow-up.", "Your leave-behind with your QR code: print it or save it as a PDF.", "The first-call script and approved answers."],
    check: "I have opened my sales kit and printed or saved my leave-behind." },
  { id: "v12-support", title: "Supporting your clients", minutes: 1, video: "MFLfTXgFkjI",
    points: ["Help with the brief on day one; watch their progress in your portal.", "Advise on creative, audience, areas, tracking, landing page and pacing.", "Never advise spending more or offer to run their campaigns. Keep their data private."],
    check: "I know what I handle and what I send to support." },
  { id: "v13-rules", title: "The rules, with real examples", minutes: 2, video: "UX3cP22_PBE",
    points: ["Never promise results. Prices exactly as published. Never the technology or our costs.", "Never manage campaigns or advise spending more. Describe yourself correctly.", "Never take money, cards or passwords. No bulk messages. Breaking the rules can end residuals."],
    check: "I have read the Operating Rules and will follow them." },
  { id: "v14-first-30", title: "Your first 30 days", minutes: 1, video: "rHxYbi1pq_A",
    points: ["Week 1: payouts, your list of 20, your leave-behind. Week 2: book 5 demos.", "Week 3: same-day follow-up emails, help your first client open and send their brief.", "Week 4: review, prepare with Fin, ask for warm introductions."],
    check: "I have written my list and booked my first demo." },
];

export const LESSON_IDS = LESSONS.map((l) => l.id);

// ─── Spanish ─────────────────────────────────────────────────────────────────────────────────────
// The same course in Spanish. Same ids, so progress counts in either language. `video` is the Spanish
// recording of each lesson.
type LessonEs = Omit<Lesson, "minutes" | "id">;
const ES: Record<string, LessonEs> = {
  "v1-welcome": { title: "Bienvenida y cómo funciona este programa", video: "QCyfzbnRQLw",
    points: ["Su papel: presentar DSP Connect a dueños que conoce, mostrar la demostración y ayudarles a abrir una cuenta con su enlace.", "Usted nunca fija precios, recibe dinero, maneja campañas ni promete resultados.", "Cinco pasos para su primera comisión: capacitación, pagos, primera demostración, primera cuenta y que sus anuncios corran."],
    check: "Conozco los cinco pasos para mi primera comisión." },
  "v2-agreement": { title: "Su acuerdo en palabras sencillas", video: "Y57hQ-1CJTc",
    points: ["Usted es contratista independiente, no empleado ni revendedor. Los socios que son empresas responden por su personal.", "No se permiten subagentes. Los clientes contratan con DSP Connect y le pagan a DSP Connect. Confidencialidad y 12 meses sin captar clientes ni personal.", "Cualquiera de las partes puede terminarlo con 30 días de aviso; las comisiones recurrentes siguen salvo que termine por causa justificada."],
    check: "Leí mi acuerdo firmado y los Anexos A y B." },
  "v3-pay": { title: "Cómo se le paga", video: "nTWQRnylDYc",
    points: [`El ${PARTNER_PCT}% del gasto publicitario calificado: pagado por completo por el cliente y realmente invertido en sus anuncios.`, "Se retiene 7 días y luego se paga a diario por Stripe. Una persona revisa su primer pago.", "Los reembolsos y contracargos revierten la comisión. Comisiones recurrentes de por vida, salvo terminación por causa justificada. Sin salario ni garantía."],
    check: "Puedo explicar cuándo y cómo se me paga, y qué revierte la comisión." },
  "v4-product": { title: "Qué es DSP Connect y para quién es", video: "UdUdEFtY020",
    points: [`Desde un presupuesto publicitario de $${MIN_BUDGET}. ${FEE_LINE_ES} Activo en ${SETUP_DAYS} días, sin contrato a largo plazo.`, "Configuramos la cuenta, el seguimiento, la revisión de anuncios y la audiencia; el cliente la maneja con apoyo.", "No es para: quien necesita resultados garantizados, tiene un presupuesto muy justo o quiere que alguien se la maneje."],
    check: "Puedo explicar DSP Connect en dos frases y detectar cuando no es para alguien." },
  "v5-screens": { title: "La cuenta, pantalla por pantalla", video: "1Olp8P-FT10",
    points: ["Explore, Dashboard, Campaigns, Audience, Conversion Tracking, Analytics y Traffic Funnel.", "Creative Assets, Allowlist / Blocklist, Retargeting, Custom Locations, Billing, Planning y Autopilot.", "Nunca sugiera a un cliente que agregue fondos."],
    check: "Puedo abrir y explicar cada pantalla sin notas." },
  "v6-after-pay": { title: "Qué pasa después de que un cliente paga", video: "2ajizp-gdNk",
    points: ["Correo de pago y página de configuración; el resumen de campaña toma unos 10 minutos. Ayúdelo a enviarlo el mismo día.", `Cuatro pasos de configuración, activo en ${SETUP_DAYS} días, y luego su propio acceso.`, "Facturación, reembolsos, cancelaciones y accesos siempre van al soporte de DSP Connect."],
    check: `Puedo decirle a un cliente exactamente qué pasa en sus primeros ${SETUP_DAYS} días.` },
  "v7-who": { title: "Con quién hablar", video: "enZufC25nS4",
    points: ["Empiece con dueños que ya conoce y atiende; pida a clientes contentos que le presenten a otros.", "Nada de contacto en frío: sin mensajes masivos a quien no lo aceptó, sin anuncios, dominios ni redes sociales con nuestro nombre.", "Escriba su lista de 20 dueños que conoce."],
    check: "Solo contactaré a personas que me conocen o que lo pidieron." },
  "v8-conversation": { title: "La primera conversación", video: "sT-d73tmSD0",
    points: ["Apertura, preguntar antes de explicar, mostrar la demostración, explicar cómo funciona y acordar un siguiente paso.", "Ellos eligen el presupuesto. Nunca presione para subirlo ni estime resultados.", "Practique la llamada completa en voz alta; pídale a Fin que haga de dueño."],
    check: "Practiqué la llamada completa en voz alta una vez." },
  "v9-demo": { title: "La demostración en vivo", video: "0I0CXgwDpUU",
    points: ["Use siempre su propio enlace de demostración con su código de socio.", "Muestre dónde aparecen los anuncios, a quién llegan y qué resultados verán. Aclare que los datos de ejemplo no son resultados reales.", "Deje que arme una campaña de práctica; nunca nombre la tecnología ni sugiera un presupuesto mayor."],
    check: "Hice la demostración completa con un prospecto de práctica." },
  "v10-objections": { title: "Preguntas y objeciones", video: "2o7VUy3UxOc",
    points: ["Use las respuestas aprobadas de su kit de ventas, palabra por palabra.", "Nunca prometa resultados; diga el precio y la frase de la tarifa exactamente.", "¿No sabe? \"Déjeme pedirle a DSP Connect que le responda bien.\""],
    check: "Puedo responder cada objeción del kit sin prometer resultados." },
  "v11-kit": { title: "Su kit de ventas", video: "0QnmUaeqWZo",
    points: ["Tres correos con sus enlaces ya incluidos: primer correo, después de la demostración y un seguimiento amable.", "Su hoja informativa con su código QR: imprímala o guárdela como PDF.", "El guion para la primera llamada y las respuestas aprobadas."],
    check: "Abrí mi kit de ventas e imprimí o guardé mi hoja informativa." },
  "v12-support": { title: "Cómo apoyar a sus clientes", video: "gzEGOzQYHIE",
    points: ["Ayude con el resumen el primer día; siga su avance en su portal.", "Aconseje sobre creatividad, audiencia, zonas, seguimiento, página de destino y ritmo de gasto.", "Nunca aconseje gastar más ni ofrezca manejar sus campañas. Mantenga sus datos en privado."],
    check: "Sé qué atiendo yo y qué envío a soporte." },
  "v13-rules": { title: "Las reglas, con ejemplos reales", video: "7ShGKwr6ig0",
    points: ["Nunca prometa resultados. Precios exactamente como se publican. Nunca hable de la tecnología ni de nuestros costos.", "Nunca maneje campañas ni aconseje gastar más. Preséntese correctamente.", "Nunca reciba dinero, tarjetas ni contraseñas. Nada de mensajes masivos. Romper las reglas puede terminar sus comisiones recurrentes."],
    check: "Leí las Reglas de Operación y las seguiré." },
  "v14-first-30": { title: "Sus primeros 30 días", video: "Hw686qv7LcY",
    points: ["Semana 1: pagos, su lista de 20 y su hoja informativa. Semana 2: agende 5 demostraciones.", "Semana 3: correos de seguimiento el mismo día; ayude a su primer cliente a abrir su cuenta y enviar su resumen.", "Semana 4: revise, prepárese con Fin y pida que le presenten a otros dueños."],
    check: "Escribí mi lista y agendé mi primera demostración." },
};
export const LESSONS_ES: Lesson[] = LESSONS.map((l) => ({ ...l, ...ES[l.id] }));
export const lessonsFor = (lang: "en" | "es") => (lang === "es" ? LESSONS_ES : LESSONS);
