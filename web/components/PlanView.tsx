import { CHANNELS, planBudget, split, type SavedPlan } from "@/lib/plan";
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
  const budget = planBudget(p);
  const mix = split(p.channels, budget);
  return (
    <article className="pv" aria-label={`Ad plan for ${host(saved.website)}`}>
      <header className="pv-top">
        <div className="pv-eyebrow">{["Your ad plan", saved.industry, saved.market].filter(Boolean).join(" · ")}</div>
        <h2 className="pv-title">Ad plan for {host(saved.website)}</h2>
        <p className="pv-lead">{p.headline}</p>
        <div className="pv-goal"><span className="pv-pill">Goal: {p.goal}</span><span>{p.goalWhy}</span></div>
        {actions && <div className="pv-actions">{actions}</div>}
      </header>

      <Sec n="01" t="What we learned from your website">
        <dl className="pv-kv">
          <div><dt>You sell</dt><dd>{p.learned.offer}</dd></div>
          <div><dt>Your customer</dt><dd>{p.learned.customer}</dd></div>
          <div><dt>Where they are</dt><dd>{p.learned.area}</dd></div>
          <div><dt>What they do on your site</dt><dd>{p.learned.action}</dd></div>
        </dl>
        {p.learned.notes.length > 0 && <ul className="pv-notes">{p.learned.notes.map((x) => <li key={x}>{x}</li>)}</ul>}
      </Sec>

      <Sec n="02" t={`Your channel mix for a $${budget.toLocaleString()} starting budget`}>
        <div className="pv-bar" role="img" aria-label={mix.map((c) => `${CHANNELS[c.key].name} ${c.pct}%`).join(", ")}>
          {mix.map((c) => <span key={c.key} style={{ width: `${c.pct}%`, background: COLOR[c.key] }} />)}
        </div>
        <div className="pv-channels">
          {mix.map((c) => (
            <div key={c.key} className="pv-ch" style={{ borderTopColor: COLOR[c.key] }}>
              <div className="pv-ch-top">
                <span className="mi" aria-hidden="true" style={{ color: COLOR[c.key] }}>{CHANNELS[c.key].icon}</span>
                <b>{CHANNELS[c.key].name}</b>
                <span className="pv-ch-amt">{c.pct}% · ${c.usd.toLocaleString()}</span>
              </div>
              <div className="pv-ch-role">{c.role}</div>
              <p>{c.why}</p>
              {!compact && <p className="pv-ch-ads"><b>Ads:</b> {c.ads}</p>}
            </div>
          ))}
        </div>
      </Sec>

      <Sec n="03" t="Who we reach">
        <dl className="pv-kv">
          <div><dt>Where</dt><dd>{p.targeting.locations.join(", ") || saved.market}</dd></div>
          {p.targeting.ages && <div><dt>Ages</dt><dd>{p.targeting.ages}</dd></div>}
          {p.targeting.audiences.length > 0 && <div><dt>Audiences</dt><dd>{p.targeting.audiences.join("; ")}</dd></div>}
          {p.targeting.interests.length > 0 && <div><dt>Content they watch and read</dt><dd>{p.targeting.interests.map((t) => t.replace(/^IAB\d+\s/, "")).join(", ")}</dd></div>}
          {p.targeting.exclude.length > 0 && <div><dt>Left out</dt><dd>{p.targeting.exclude.join("; ")}</dd></div>}
        </dl>
      </Sec>

      {!compact && (
        <>
          <Sec n="04" t="The ads you need">
            <ul className="pv-list">{p.creative.map((c) => <li key={c.format + c.spec}><b>{c.format}</b> · {c.spec}<br /><span>{c.message}</span></li>)}</ul>
          </Sec>
          <Sec n="05" t="How we count results">
            <p className="pv-p"><b>The result:</b> {p.tracking.action}</p>
            <ul className="pv-list">{p.tracking.steps.map((x) => <li key={x}>{x}</li>)}</ul>
          </Sec>
          <Sec n="06" t="Your first 30 days">
            <ol className="pv-steps">{p.launch.map((x) => <li key={x}>{x}</li>)}</ol>
          </Sec>
          {p.questions.length > 0 && (
            <Sec n="07" t="What we will confirm with you">
              <ul className="pv-list">{p.questions.map((x) => <li key={x}>{x}</li>)}</ul>
            </Sec>
          )}
        </>
      )}

      <footer className="pv-foot">
        <p>No monthly platform fee. Our fee is included in the price of your ads.</p>
        <p>A starting plan written from your website. We confirm it with you before anything runs. Advertising can&apos;t guarantee results.</p>
      </footer>
    </article>
  );
}
