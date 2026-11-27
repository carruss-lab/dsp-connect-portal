import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { chatCookie } from "@/lib/chatId";
import { button, esc, notifyTeam, send, wrap } from "@/lib/email";
import { bodyLang, setLang } from "@/lib/reqLang";
import { channelName } from "@/lib/plan";
import { syncPerson } from "@/lib/intercom";
import { CHANNELS, planBudget, planSummary, split, type Plan } from "@/lib/plan";
import { writePlan } from "@/lib/planner";
import { normaliseUrl, scanSite } from "@/lib/scan";
import { isUuid, rest, secretRpc } from "@/lib/server";
import { INDUSTRIES, MIN_BUDGET, siteOrigin } from "@/lib/site";

// The ad planner: reads a business's website and writes a first ad plan, saved against their email so it
// follows them into the demo, the account sign-up, payment, the setup page and the chat.

export const maxDuration = 60;

// Sales Partners and agencies make plans for many businesses, so their links allow more.
const PER_EMAIL = 3, PER_IP = 10, PARTNER_PER_EMAIL = 15, PARTNER_PER_IP = 30;
const clean = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "We could not read that. Please try again." }, { status: 400 }); }
  const lang = bodyLang(body); const es = lang === "es";
  const t = (en: string, sp: string) => (es ? sp : en);

  const email = clean(body.email).toLowerCase();
  const business = clean(body.business, 120);
  const website = clean(body.website, 300);
  const industry = INDUSTRIES.includes(clean(body.industry, 60)) ? clean(body.industry, 60) : "Other";
  const market = clean(body.market, 120).replace(/[^\p{L}\p{N} ,.'-]/gu, "");
  const source = clean(body.source, 240);
  const partnerCode = /^[A-Za-z0-9]{4,20}$/.test(clean(body.partner_code, 20)) ? clean(body.partner_code, 20).toUpperCase() : null;
  const budget = Math.round(Number(body.budget ?? MIN_BUDGET));
  if (!Number.isFinite(budget) || budget < MIN_BUDGET || budget > 5_000_000) return NextResponse.json({ error: t(`Please enter a starting budget of $${MIN_BUDGET} or more.`, `Escriba un presupuesto inicial de $${MIN_BUDGET} o más.`) }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: t("Please enter a valid email address.", "Escriba un correo electrónico válido.") }, { status: 400 });
  if (!business) return NextResponse.json({ error: t("Please add your business name.", "Escriba el nombre de su negocio.") }, { status: 400 });
  if (!market) return NextResponse.json({ error: t("Please tell us where your customers are.", "Díganos dónde están sus clientes.") }, { status: 400 });
  const url = normaliseUrl(website);
  if (!url) return NextResponse.json({ error: t("Please enter your website address, for example yourbusiness.com.", "Escriba la dirección de su sitio web, por ejemplo sunegocio.com.") }, { status: 400 });

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  const ipHash = createHash("sha256").update(`${ip}:${process.env.SERVER_SECRET || ""}`).digest("hex").slice(0, 32);
  try {
    const used = await secretRpc<{ email: number; ip: number }>("strategy_count", { p_email: email, p_ip: ipHash });
    const [maxEmail, maxIp] = partnerCode ? [PARTNER_PER_EMAIL, PARTNER_PER_IP] : [PER_EMAIL, PER_IP];
    if (used.email >= maxEmail || used.ip >= maxIp) {
      return NextResponse.json({ error: t(`You have made ${maxEmail} plans today, which is the daily limit. Your plans are saved; ask in the chat if you need another.`, `Ya creó ${maxEmail} planes hoy, que es el límite diario. Sus planes están guardados; pregunte en el chat si necesita otro.`) }, { status: 429 });
    }
  } catch (err) {
    console.error("strategy count failed", err);
    return NextResponse.json({ error: t("The planner is not available right now. Please try again shortly.", "El planificador no está disponible en este momento. Inténtelo de nuevo en un momento.") }, { status: 503 });
  }

  const signals = await scanSite(url.toString());
  const input = { business, website: signals?.url || url.toString(), industry, market, budget, lang };
  const { plan, model } = await writePlan(input, signals);

  let id: string;
  try {
    id = await secretRpc<string>("strategy_save", {
      p_email: email, p_business: business, p_website: input.website, p_industry: industry, p_market: market, p_ip: ipHash,
      p_source: source || null, p_plan: plan, p_signals: signals ? { ...signals, text: signals.text.slice(0, 3000) } : null, p_model: model, p_partner: partnerCode,
    });
  } catch (err) {
    console.error("strategy save failed", err);
    return NextResponse.json({ error: t("We wrote your plan but could not save it. Please try again.", "Escribimos su plan, pero no pudimos guardarlo. Inténtelo de nuevo.") }, { status: 502 });
  }
  if (es) await setLang("strategy", id, "es");

  // The plan also counts as a lead, so the team and the chat know about this person.
  const link = `${siteOrigin()}${es ? "/es" : ""}/planner?plan=${id}`;
  await Promise.all([
    rest("leads", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ kind: "market_check", email, business, website: input.website, industry, market, partner_code: partnerCode, lang, source: `planner | ${source}`.slice(0, 240) }) })
      .then(async (r) => { if (!r.ok) console.error("planner lead insert failed", r.status, await r.text()); }).catch((e) => console.error("planner lead insert failed", e)),
    notifyTeam("plan", { email, business, website: input.website, industry, market, budget, ...(es ? { language: "Spanish" } : {}), plan: planSummary(plan), link, read_website: signals?.reachable ? "yes" : "no", written_by: model }),
    send(email, es ? "Su plan de anuncios de DSP Connect" : "Your DSP Connect ad plan", planEmail(plan, input.website, link, lang)).catch((e) => console.error("plan email failed", e)),
    syncPerson({
      email, role: "prospect", status: "lead", industry, market, ...(es ? { lang } : {}),
      extra: { lead_stage: "ad_plan", monthly_ad_budget: budget, business_name: business, business_website: input.website, ad_plan_url: link, ad_plan_summary: planSummary(plan) },
    }),
  ]);

  const res = NextResponse.json({ ok: true, id, plan, business, website: input.website, industry, market, read: !!signals?.reachable });
  res.cookies.set(chatCookie(email));
  return res;
}

/** The plan link by email, so the person (or the partner who made it with them) can come back to it. */
function planEmail(p: Plan, website: string, link: string, lang: "en" | "es" = "en") {
  const host = website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  if (lang === "es") {
    const rowsEs = split(p.channels, planBudget(p)).map((c) => `<li>${esc(channelName(c.key, "es"))}: ${c.pct}% ($${c.usd.toLocaleString("en-US")}). ${esc(c.role)}</li>`).join("");
    return wrap(
      `<p>Aquí está el plan de anuncios que escribimos a partir de <b>${esc(host)}</b>.</p>` +
      `<p>${esc(p.headline)}</p>` +
      `<p><b>Su combinación de canales para un presupuesto inicial de $${planBudget(p).toLocaleString("en-US")}</b></p><ul>${rowsEs}</ul>` +
      button(link, "Abrir su plan completo", "#0A4FD6") +
      `<p>Desde el plan puede verlo en su cuenta de demostración, crear la campaña o abrir su cuenta con el plan incluido. ¿Preguntas? Responda a este correo o escríbanos en el chat del sitio, en español.</p>` +
      `<p style="color:#5B6577;font-size:13px">Sin cuota mensual de plataforma. Nuestra tarifa está incluida en el precio de sus anuncios. Un plan inicial escrito a partir de su sitio web; la publicidad no puede garantizar resultados.</p>`, "es");
  }
  const rows = split(p.channels, planBudget(p)).map((c) => `<li>${esc(CHANNELS[c.key].name)}: ${c.pct}% ($${c.usd.toLocaleString()}). ${esc(c.role)}</li>`).join("");
  return wrap(
    `<p>Here is the ad plan we wrote from <b>${esc(host)}</b>.</p>` +
    `<p>${esc(p.headline)}</p>` +
    `<p><b>Your channel mix for a $${planBudget(p).toLocaleString()} starting budget</b></p><ul>${rows}</ul>` +
    `<p><a href="${link}" style="display:inline-block;background:#0A4FD6;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Open your full plan</a></p>` +
    `<p>From the plan you can see it in your demo account, build the campaign, or open your account with the plan attached. Questions? Reply to this email or ask in the chat on the site.</p>` +
    `<p style="color:#5B6577;font-size:13px">No monthly platform fee. Our fee is included in the price of your ads. A starting plan written from your website; advertising can't guarantee results.</p>`,
  );
}

/** A saved plan by its id, for the planner page, the demo and the sign-up form. */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!isUuid(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  try {
    const s = await secretRpc<{ id: string; business: string; website: string; industry: string; market: string; plan: Plan; created_at: string } | null>("strategy_get", { p_id: id });
    if (!s) return NextResponse.json({ error: "not found" }, { status: 404 });
    // Never the email or the raw scan: anyone holding the link sees only the plan.
    return NextResponse.json({ id, business: s.business, website: s.website, industry: s.industry, market: s.market, plan: s.plan, created_at: s.created_at }, { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
  } catch (err) {
    console.error("strategy get failed", err);
    return NextResponse.json({ error: "not available" }, { status: 503 });
  }
}
