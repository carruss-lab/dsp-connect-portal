import { generateText, Output } from "ai";
import { z } from "zod";
import { CHANNELS, GOAL_OPTIONS, TAXONOMIES, type ChannelKey, type Plan } from "./plan";
import type { Signals } from "./scan";
import { MIN_BUDGET, SETUP_DAYS } from "./site";

// Writes an ad plan from what a business's website says. The model runs through Vercel AI Gateway
// (signed in with the deployment's own OIDC token, or AI_GATEWAY_API_KEY if one is set). If the model
// is unavailable the planner still answers, with a plan built from simple rules.

/** Tried in order: the best model first, then lighter ones the account may allow (the free tier limits models). */
export const MODELS = (process.env.PLANNER_MODEL || "anthropic/claude-sonnet-5.5,anthropic/claude-haiku-5.5,anthropic/claude-haiku-4.5,openai/gpt-5-mini")
  .split(",").map((m) => m.trim()).filter(Boolean);

const KEYS = Object.keys(CHANNELS) as [ChannelKey, ...ChannelKey[]];
const schema = z.object({
  headline: z.string().describe("One plain sentence: the plan in a nutshell, naming the business's offer and area."),
  learned: z.object({
    offer: z.string().describe("What they sell, in under 8 words."),
    customer: z.string().describe("Who buys it, in one sentence."),
    area: z.string().describe("Where their customers are."),
    action: z.string().describe("The action a customer takes on the site: call, book, buy, request a quote, and so on."),
    notes: z.array(z.string()).describe("2 to 5 short facts from the website that shaped this plan."),
  }),
  goal: z.enum(GOAL_OPTIONS),
  goalWhy: z.string(),
  channels: z.array(z.object({
    key: z.enum(KEYS),
    share: z.number().int().describe("Percent of the starting budget. All shares add up to 100. Never below 15."),
    role: z.string().describe("This channel's job in the plan, in under 10 words."),
    why: z.string().describe("Why it fits this business, in one or two sentences, tied to something from the website."),
    ads: z.string().describe("The ads it needs, in one sentence."),
  })).min(2).max(5),
  targeting: z.object({
    locations: z.array(z.string()).describe("Cities, ZIP codes, a radius or states."),
    ages: z.string(),
    interests: z.array(z.enum(TAXONOMIES as [string, ...string[]])).max(4),
    audiences: z.array(z.string()).describe("2 to 4 audiences to reach, in plain words."),
    exclude: z.array(z.string()).describe("Who or where to leave out. Can be empty."),
  }),
  tracking: z.object({
    action: z.string().describe("The one result to count."),
    steps: z.array(z.string()).describe("2 to 4 steps to count it."),
  }),
  creative: z.array(z.object({ format: z.string(), spec: z.string(), message: z.string() })).min(1).max(4),
  launch: z.array(z.string()).describe("4 to 6 steps for the first 30 days, in order."),
  questions: z.array(z.string()).describe("2 to 4 questions to confirm with the business before launch."),
});

const SYSTEM = `You are an experienced programmatic media planner at DSP Connect. You write a first ad plan for a business from what its website says.

DSP Connect runs streaming TV (CTV), online video, display (banner), native and retargeting ads across apps, websites and streaming TV, bought through a demand-side platform. Targeting available: location (cities, ZIP codes, a radius), age, device (connected TV, mobile, desktop, tablet), content categories, time of day, website visitors (retargeting), and the apps and sites ads run on.

Facts you may use:
- Accounts start from a $${MIN_BUDGET} ad budget, with no long-term contract.
- DSP Connect sets up the account, tracking, ads and audience; ads are live within ${SETUP_DAYS} days of payment.
- The plan splits the starting budget the business chose (given below, $${MIN_BUDGET} or more) across the channels: 2 to 3 channels for budgets under $2,000, up to 5 for larger budgets.

Rules you must follow:
- Base everything on the website and the details given. Never invent facts about the business. If something is unclear, put it in "questions".
- Do not predict or promise results: no expected clicks, leads, sales, views, click-through rates, costs per result, CPMs or return on ad spend. Say what each channel is for, not what it will deliver.
- Do not name any ad platform, ad tech company, exchange or vendor, and do not mention fees, margins or pricing other than the starting budget.
- Plan for exactly the budget they chose. Do not advise spending more or adding money later.
- Only use the five channels listed. Retargeting needs website visitors and a tracking tag; with a small budget, keep it to a small share or leave it out for a brand-new site. Streaming TV suits local awareness and businesses with a visual story; with a small budget, pair it with a channel that drives action.
- Speak to the owner as "you" and call the business "your business"; do not use the business name or any person's name.
- Write for a business owner: plain English, short sentences, no jargon (say "streaming TV" alongside CTV once), no exclamation marks, no emojis.`;

// For Spanish speakers the same plan, written in Spanish. The fixed values the app reads stay as they are.
const SPANISH = `

Language: write every sentence of the plan in neutral US Spanish, addressing the owner as "usted" ("su negocio"). Use common Spanish ad words: "TV por streaming", "anuncios de display (banners)", "anuncios nativos", "retargeting", "seguimiento". Keep these values exactly as listed, in English, because the app reads them: "goal", each channel "key", and each "interests" value. The website may be in English; still write in Spanish. "No prometer resultados" applies in Spanish too: never use "garantizar" or estimate results.`;

const TRIM = (s: string, n = 400) => s.replace(/\s+/g, " ").trim().slice(0, n);
/** Last line of defense: nothing that names our provider, talks about margins, or promises results. */
const BANNED = /\b(epom|mark-?up|margin|take rate|guarantee[ds]?|garantiza\w*|garantía\w*|margen)\b/i;
function clean(p: Plan): Plan {
  const fix = (s: string) => (BANNED.test(s) ? "" : TRIM(s));
  const list = (a: string[], n = 6) => a.map(fix).filter(Boolean).slice(0, n);
  const seen = new Set<string>();
  let channels = p.channels.filter((c) => !seen.has(c.key) && !!seen.add(c.key)).slice(0, 5).map((c) => ({ ...c, share: Math.max(1, Math.round(c.share)), role: fix(c.role), why: fix(c.why), ads: fix(c.ads) }));
  const total = channels.reduce((t, c) => t + c.share, 0) || 1;
  channels = channels.map((c) => ({ ...c, share: Math.round((c.share / total) * 100) }));
  return {
    budget: p.budget, siteRead: p.siteRead, headline: fix(p.headline), goal: p.goal, goalWhy: fix(p.goalWhy), channels,
    learned: { offer: fix(p.learned.offer).slice(0, 80), customer: fix(p.learned.customer), area: fix(p.learned.area), action: fix(p.learned.action), notes: list(p.learned.notes, 5) },
    targeting: { locations: list(p.targeting.locations, 8), ages: fix(p.targeting.ages), interests: p.targeting.interests.filter((t) => TAXONOMIES.includes(t)).slice(0, 4), audiences: list(p.targeting.audiences, 4), exclude: list(p.targeting.exclude, 4) },
    tracking: { action: fix(p.tracking.action), steps: list(p.tracking.steps, 4) },
    creative: p.creative.map((c) => ({ format: fix(c.format), spec: fix(c.spec), message: fix(c.message) })).filter((c) => c.format).slice(0, 4),
    launch: list(p.launch, 6), questions: list(p.questions, 4),
  };
}

export type PlanInput = { business: string; website: string; industry: string; market: string; budget: number; lang?: "en" | "es" };

function brief(i: PlanInput, s: Signals | null) {
  const lines = [
    `Starting ad budget they chose: $${i.budget}`, `Business name: ${i.business}`, `Website: ${i.website}`, `Industry they chose: ${i.industry}`, `Where their customers are (they told us): ${i.market}`,
  ];
  if (!s?.reachable) {
    lines.push("We could not read the website, so plan from the details above and ask the key questions. In learned.notes, only state that the website could not be read; do not repeat the details above as notes.");
    return lines.join("\n");
  }
  const yes = (b: boolean) => (b ? "yes" : "no");
  lines.push(
    `Page title: ${s.title}`, `Meta description: ${s.description}`,
    `Built on: ${s.platform || "unknown"}. Online store: ${yes(s.ecommerce)}. Prices seen: ${s.prices.join(", ") || "none"}.`,
    `Phone link: ${yes(s.phone)}. Forms: ${yes(s.forms)}. Online booking: ${yes(s.booking)}. Video on site: ${yes(s.video)}. Mobile app: ${yes(s.app)}.`,
    `Tags already on the site: Google tag ${yes(s.tags.googleTag)}, Tag Manager ${yes(s.tags.tagManager)}, Meta pixel ${yes(s.tags.metaPixel)}, TikTok pixel ${yes(s.tags.tiktokPixel)}.`,
    `Locations in the site's structured data: ${s.locations.join("; ") || "none"}. Business types: ${s.schemaTypes.join(", ") || "none"}.`,
    `Social profiles linked: ${s.socials.join(", ") || "none"}.`,
    `Other pages read: ${s.pages.map((p) => `${p.url} (${p.title})`).join("; ") || "none"}.`,
    `Headings: ${s.headings.join(" | ")}`,
    `Text from the site:\n${s.text}`,
  );
  return lines.join("\n");
}

/** A sensible plan from rules alone, used when the model is unavailable. */
export function rulePlan(i: PlanInput, s: Signals | null): Plan {
  const store = !!s?.ecommerce;
  const action = store ? "Buy online" : s?.booking ? "Book an appointment" : s?.phone ? "Call or send an enquiry" : "Send an enquiry";
  const channels: Plan["channels"] = store
    ? [
        { key: "native", share: 40, role: "Bring shoppers to your products", why: "Native ads look like the content around them and send people straight to product pages.", ads: "A product image, a short headline and a line of copy." },
        { key: "display", share: 35, role: "Reach shoppers across apps and sites", why: "Display ads reach people browsing apps and websites who match your customer.", ads: "Banner ads in the common sizes, each showing one product and the offer." },
        { key: "retargeting", share: 25, role: "Bring back visitors who did not buy", why: "People who looked at a product are the most likely to come back and buy.", ads: "Banners showing the products people viewed or a reason to come back." },
      ]
    : [
        { key: "ctv", share: 40, role: "Be seen on the big screen locally", why: `Streaming TV puts your business on household TVs in ${i.market}, where people relax and pay attention.`, ads: "A 15 or 30 second video with your name, offer and website at the end." },
        { key: "display", share: 35, role: "Stay in front of local customers", why: "Display ads follow up across the apps and sites the same people use every day.", ads: "Banner ads in the common sizes with one clear offer." },
        { key: "native", share: 25, role: "Turn interest into enquiries", why: "Native ads read like content and bring people who want to learn more to your website.", ads: "An image, a headline and a short description." },
      ];
  return {
    headline: `A starting plan for your business in ${i.market}, focused on ${store ? "online sales" : "local customers"}.`,
    learned: {
      offer: s?.title ? TRIM(s.title.split(/[|–-]/)[0], 60) : i.industry, customer: `People in ${i.market} who need what you offer.`, area: s?.locations[0] || i.market, action,
      notes: s?.reachable ? [s.platform ? `Website built on ${s.platform}.` : "", s.phone ? "Visitors can call from the website." : "", s.booking ? "The website takes bookings online." : "", store ? "The website sells online." : ""].filter(Boolean) : ["We could not read the website, so this plan uses the details you gave us."],
    },
    goal: store || s?.forms || s?.booking ? "Conversions" : "Website visits",
    goalWhy: `Most businesses like yours want people to ${action.toLowerCase()}, so we count that as the result.`,
    channels,
    targeting: { locations: [i.market], ages: "Adults 25 to 64", interests: [], audiences: [`Adults in ${i.market}`, "People interested in what you offer"], exclude: [] },
    tracking: { action, steps: ["We place a tracking tag on your website during setup.", `We count each ${action.toLowerCase()} as a result.`] },
    creative: [{ format: "Banner", spec: "300x250, 320x50, 728x90, 160x600", message: "One clear offer and your website." }],
    launch: ["Open your account and pay your starting budget.", "Fill in your campaign brief.", "We place tracking and build your audience.", `Your ads go live within ${SETUP_DAYS} days.`, "We review where your ads ran and move budget to what works."],
    questions: ["What is the one result you want most from your ads?", "Which areas do you serve?"],
  };
}

/** The rule-based plan in Spanish, for when the model is unavailable. */
export function rulePlanEs(i: PlanInput, s: Signals | null): Plan {
  const store = !!s?.ecommerce;
  const action = store ? "Comprar en línea" : s?.booking ? "Reservar una cita" : s?.phone ? "Llamar o enviar una consulta" : "Enviar una consulta";
  const channels: Plan["channels"] = store
    ? [
        { key: "native", share: 40, role: "Llevar compradores a sus productos", why: "Los anuncios nativos se ven como el contenido que los rodea y llevan a las personas directo a las páginas de producto.", ads: "Una imagen del producto, un título corto y una línea de texto." },
        { key: "display", share: 35, role: "Llegar a compradores en apps y sitios", why: "Los anuncios de display llegan a personas que navegan en apps y sitios web y que se parecen a su cliente.", ads: "Banners en los tamaños comunes, cada uno con un producto y la oferta." },
        { key: "retargeting", share: 25, role: "Recuperar visitantes que no compraron", why: "Quienes vieron un producto son los más propensos a volver y comprar.", ads: "Banners con los productos que vieron o una razón para volver." },
      ]
    : [
        { key: "ctv", share: 40, role: "Aparecer en la pantalla grande localmente", why: `La TV por streaming pone su negocio en los televisores de los hogares de ${i.market}, donde la gente se relaja y presta atención.`, ads: "Un video de 15 o 30 segundos con su nombre, su oferta y su sitio web al final." },
        { key: "display", share: 35, role: "Mantenerse frente a clientes locales", why: "Los anuncios de display dan seguimiento en las apps y sitios que esas mismas personas usan a diario.", ads: "Banners en los tamaños comunes con una oferta clara." },
        { key: "native", share: 25, role: "Convertir interés en consultas", why: "Los anuncios nativos se leen como contenido y llevan a su sitio web a quienes quieren saber más.", ads: "Una imagen, un título y una descripción corta." },
      ];
  return {
    headline: `Un plan inicial para su negocio en ${i.market}, enfocado en ${store ? "ventas en línea" : "clientes locales"}.`,
    learned: {
      offer: s?.title ? TRIM(s.title.split(/[|–-]/)[0], 60) : i.industry, customer: `Personas en ${i.market} que necesitan lo que usted ofrece.`, area: s?.locations[0] || i.market, action,
      notes: s?.reachable ? [s.platform ? `Sitio web hecho en ${s.platform}.` : "", s.phone ? "Los visitantes pueden llamar desde el sitio web." : "", s.booking ? "El sitio web acepta reservaciones en línea." : "", store ? "El sitio web vende en línea." : ""].filter(Boolean) : ["No pudimos leer el sitio web, así que este plan usa los datos que nos dio."],
    },
    goal: store || s?.forms || s?.booking ? "Conversions" : "Website visits",
    goalWhy: `La mayoría de los negocios como el suyo quieren que la gente pueda ${action.toLowerCase()}, así que contamos eso como el resultado.`,
    channels,
    targeting: { locations: [i.market], ages: "Adultos de 25 a 64 años", interests: [], audiences: [`Adultos en ${i.market}`, "Personas interesadas en lo que usted ofrece"], exclude: [] },
    tracking: { action, steps: ["Colocamos una etiqueta de seguimiento en su sitio web durante la configuración.", `Contamos cada acción de "${action.toLowerCase()}" como un resultado.`] },
    creative: [{ format: "Banner", spec: "300x250, 320x50, 728x90, 160x600", message: "Una oferta clara y su sitio web." }],
    launch: ["Abra su cuenta y pague su presupuesto inicial.", "Llene el resumen de su campaña.", "Colocamos el seguimiento y armamos su audiencia.", `Sus anuncios se activan en ${SETUP_DAYS} días.`, "Revisamos dónde se mostraron sus anuncios y movemos el presupuesto a lo que funciona."],
    questions: ["¿Cuál es el resultado que más quiere de sus anuncios?", "¿Qué zonas atiende?"],
  };
}

export async function writePlan(i: PlanInput, s: Signals | null): Promise<{ plan: Plan; model: string }> {
  for (const model of MODELS) {
    try {
      const { output } = await generateText({
        model,
        system: i.lang === "es" ? SYSTEM + SPANISH : SYSTEM,
        prompt: `Write the ad plan for this business.\n\n${brief(i, s)}`,
        output: Output.object({ schema }),
        maxOutputTokens: 4000,
        maxRetries: 1,
        abortSignal: AbortSignal.timeout(40_000),
      });
      return { plan: clean({ ...(output as Plan), budget: i.budget, siteRead: !!s?.reachable }), model };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("planner model failed", model, msg.slice(0, 300));
      // Only a model the account cannot use is worth trying the next one for; a timeout would just double the wait.
      if (!/free tier|no_providers|not have access|not found|unsupported/i.test(msg)) break;
    }
  }
  return { plan: clean({ ...(i.lang === "es" ? rulePlanEs(i, s) : rulePlan(i, s)), budget: i.budget, siteRead: !!s?.reachable }), model: "rules" };
}
