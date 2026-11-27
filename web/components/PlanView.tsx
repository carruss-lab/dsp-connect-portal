"use client";
import { CHANNELS, GOAL_ES, channelName, planBudget, split, type SavedPlan } from "@/lib/plan";
import { useLang } from "@/lib/useLang";
import { industryName, tr } from "@/lib/i18n";
import "material-icons/iconfont/filled.css";

// An ad plan, laid out the way a media planner would walk a client through it. Used on the planner page,
// inside the demo account and on the client's setup page.

const COLOR: Record<string, string> = { ctv: "#0A4FD6", video: "#5B3FD6", display: "#0F8A6A", native: "#C2700A", retargeting: "#B4306A" };
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };

function Sec({ n, t, children }: { n: string; t: string; children: React.ReactNode }) {
  return (
    <section className="pv-sec" aria-labelledby={`pv-${n}`}>
      <h3 id={`pv-${n}`} className="pv-h"><span className="pv-n">{n}</span>{t}</h3>
      {children}
    </section>
  );
}

export default function PlanView({ saved, actions, compact = false }: { saved: SavedPlan; actions?: React.ReactNode; compact?: boolean }) {
  const p = saved.plan;
  const lang = useLang(); const t = tr(lang); const es = lang === "es";
  const ch = (k: keyof typeof CHANNELS) => channelName(k, lang);
  const budget = planBudget(p);
  const mix = split(p.channels, budget);
  return (
    <article className="pv" aria-label={`${t("Ad plan for", "Plan de anuncios para")} ${host(saved.website)}`}>
      <header className="pv-top">
        <div className="pv-eyebrow">{[t("Your ad plan", "Su plan de anuncios"), saved.industry ? industryName(saved.industry, lang) : "", saved.market].filter(Boolean).join(" · ")}</div>
        <h2 className="pv-title">{t("Ad plan for", "Plan de anuncios para")} {host(saved.website)}</h2>
        <p className="pv-lead">{p.headline}</p>
        <div className="pv-goal"><span className="pv-pill">{t("Goal", "Meta")}: {es ? GOAL_ES[p.goal] || p.goal : p.goal}</span><span>{p.goalWhy}</span></div>
        {actions && <div className="pv-actions">{actions}</div>}
      </header>

      <Sec n="01" t={p.siteRead === false ? t("Your business", "Su negocio") : t("What we learned from your website", "Lo que aprendimos de su sitio web")}>
        <dl className="pv-kv">
          <div><dt>{t("You sell", "Usted vende")}</dt><dd>{p.learned.offer}</dd></div>
          <div><dt>{t("Your customer", "Su cliente")}</dt><dd>{p.learned.customer}</dd></div>
          <div><dt>{t("Where they are", "Dónde están")}</dt><dd>{p.learned.area}</dd></div>
          <div><dt>{t("What they do on your site", "Qué hacen en su sitio")}</dt><dd>{p.learned.action}</dd></div>
        </dl>
        {p.siteRead === false && <p className="pv-p" style={{ marginTop: 14 }}>{t("We could not read your website, so this plan uses what you told us. We will check your site with you before anything runs.", "No pudimos leer su sitio web, así que este plan usa lo que usted nos dijo. Revisaremos su sitio con usted antes de que salga cualquier anuncio.")}</p>}
        {p.siteRead !== false && p.learned.notes.length > 0 && <ul className="pv-notes">{p.learned.notes.map((x) => <li key={x}>{x}</li>)}</ul>}
      </Sec>

      <Sec n="02" t={t(`Your channel mix for a $${budget.toLocaleString()} starting budget`, `Su mezcla de canales para un presupuesto inicial de $${budget.toLocaleString()}`)}>
        <div className="pv-bar" role="img" aria-label={mix.map((c) => `${ch(c.key)} ${c.pct}%`).join(", ")}>
          {mix.map((c) => <span key={c.key} style={{ width: `${c.pct}%`, background: COLOR[c.key] }} />)}
        </div>
        <div className="pv-channels">
          {mix.map((c) => (
            <div key={c.key} className="pv-ch" style={{ borderTopColor: COLOR[c.key] }}>
              <div className="pv-ch-top">
                <span className="mi" aria-hidden="true" style={{ color: COLOR[c.key] }}>{CHANNELS[c.key].icon}</span>
                <b>{ch(c.key)}</b>
                <span className="pv-ch-amt">{c.pct}% · ${c.usd.toLocaleString()}</span>
              </div>
              <div className="pv-ch-role">{c.role}</div>
              <p>{c.why}</p>
              {!compact && <p className="pv-ch-ads"><b>{t("Ads:", "Anuncios:")}</b> {c.ads}</p>}
            </div>
          ))}
        </div>
      </Sec>

      <Sec n="03" t={t("Who we reach", "A quién llegamos")}>
        <dl className="pv-kv">
          <div><dt>{t("Where", "Dónde")}</dt><dd>{p.targeting.locations.join(", ") || saved.market}</dd></div>
          {p.targeting.ages && <div><dt>{t("Ages", "Edades")}</dt><dd>{p.targeting.ages}</dd></div>}
          {p.targeting.audiences.length > 0 && <div><dt>{t("Audiences", "Audiencias")}</dt><dd>{p.targeting.audiences.join("; ")}</dd></div>}
          {p.targeting.interests.length > 0 && <div><dt>{t("Content they watch and read", "Contenido que ven y leen")}</dt><dd>{p.targeting.interests.map((t) => t.replace(/^IAB\d+\s/, "")).join(", ")}</dd></div>}
          {p.targeting.exclude.length > 0 && <div><dt>{t("Left out", "Excluidos")}</dt><dd>{p.targeting.exclude.join("; ")}</dd></div>}
        </dl>
      </Sec>

      {!compact && (
        <>
          <Sec n="04" t={t("The ads you need", "Los anuncios que necesita")}>
            <ul className="pv-list">{p.creative.map((c) => <li key={c.format + c.spec}><b>{c.format}</b> · {c.spec}<br /><span>{c.message}</span></li>)}</ul>
          </Sec>
          <Sec n="05" t={t("How we count results", "Cómo contamos los resultados")}>
            <p className="pv-p"><b>{t("The result:", "El resultado:")}</b> {p.tracking.action}</p>
            <ul className="pv-list">{p.tracking.steps.map((x) => <li key={x}>{x}</li>)}</ul>
          </Sec>
          <Sec n="06" t={t("Your first 30 days", "Sus primeros 30 días")}>
            <ol className="pv-steps">{p.launch.map((x) => <li key={x}>{x}</li>)}</ol>
          </Sec>
          {p.questions.length > 0 && (
            <Sec n="07" t={t("What we will confirm with you", "Lo que confirmaremos con usted")}>
              <ul className="pv-list">{p.questions.map((x) => <li key={x}>{x}</li>)}</ul>
            </Sec>
          )}
        </>
      )}

      <footer className="pv-foot">
        <p>{t("No monthly platform fee. Our fee is included in the price of your ads.", "Sin tarifa mensual de plataforma. Nuestra tarifa está incluida en el precio de sus anuncios.")}</p>
        <p>{t("A starting plan written from your website. We confirm it with you before anything runs. Advertising can’t guarantee results.", "Un plan inicial escrito a partir de su sitio web. Lo confirmamos con usted antes de que salga cualquier anuncio. La publicidad no puede garantizar resultados.")}</p>
      </footer>
    </article>
  );
}
