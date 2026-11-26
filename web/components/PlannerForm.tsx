"use client";
import { useEffect, useRef, useState } from "react";
import { PLAN_STAGES, requestPlan } from "@/lib/planClient";
import type { SavedPlan } from "@/lib/plan";
import { readProfile } from "@/lib/profile";
import { INDUSTRIES, MIN_BUDGET } from "@/lib/site";

/** Progress while the plan is written: the steps tick over on a timer, since the work happens in one request. */
export function PlanProgress() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => Math.min(x + 1, PLAN_STAGES.length - 1)), 7000); return () => clearInterval(t); }, []);
  return (
    <ol className="pl-progress" aria-live="polite" style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {PLAN_STAGES.map((s, n) => (
        <li key={s} data-on={n === i || undefined} data-done={n < i || undefined}><span className="pl-dot" aria-hidden="true">{n < i ? "✓" : ""}</span>{s}{n === i ? "…" : ""}</li>
      ))}
      <li className="small" style={{ marginTop: 4 }}>This takes about 30 seconds.</li>
    </ol>
  );
}

/**
 * Asks for an email, business name, website, industry and area, then writes the plan.
 * `known` skips fields the visitor already gave us (inside the demo, their email, industry and area).
 */
export default function PlannerForm({ onPlan, known, cta = "Build my ad plan", dark = false }: {
  onPlan: (p: SavedPlan) => void; known?: { email?: string; industry?: string; market?: string }; cta?: string; dark?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pre, setPre] = useState<Record<string, string>>({});
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    // A Sales Partner's or agency's link (?p=CODE) is remembered, so the plan and the sign-up are credited to them.
    const code = new URLSearchParams(location.search).get("p");
    if (code && /^[A-Za-z0-9]{4,20}$/.test(code)) { try { sessionStorage.setItem("partner_code", code.toUpperCase()); } catch {} }
    const p = readProfile() as Record<string, string | undefined>;
    const o: Record<string, string> = {};
    for (const k of ["email", "business", "website", "industry", "market", "budget"]) if (p[k]) o[k] = p[k]!;
    Object.assign(o, Object.fromEntries(Object.entries(known || {}).filter(([, v]) => v)));
    Promise.resolve().then(() => setPre(o));
    if (!o.market) fetch("/api/geo").then((r) => r.json()).then((g) => { if (g?.market) setPre((c) => (c.market ? c : { ...c, market: g.market })); }).catch(() => {});
  }, [known]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const d = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    try {
      onPlan(await requestPlan({ email: d.email || known?.email || "", business: d.business, website: d.website, industry: d.industry || known?.industry || "Other", market: d.market || known?.market || "", budget: Number(d.budget) || MIN_BUDGET }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  if (busy) return <PlanProgress />;
  const ask = (k: "email" | "industry" | "market") => !known?.[k];
  const lbl = dark ? { color: "#fff" } : undefined;
  return (
    <form ref={form} key={JSON.stringify(pre)} onSubmit={submit} className="stack g16">
      <div className="field">
        <label htmlFor="pl-website" style={lbl}>Your website</label>
        <input className="input" id="pl-website" name="website" required inputMode="url" autoComplete="url" placeholder="yourbusiness.com" defaultValue={pre.website || ""} />
      </div>
      <div className="field">
        <label htmlFor="pl-business" style={lbl}>Business name</label>
        <input className="input" id="pl-business" name="business" required autoComplete="organization" defaultValue={pre.business || ""} />
      </div>
      {ask("email") && (
        <div className="field">
          <label htmlFor="pl-email" style={lbl}>Work email</label>
          <input className="input" id="pl-email" name="email" type="email" required autoComplete="email" placeholder="you@yourbusiness.com" defaultValue={pre.email || ""} />
          <span className="small" style={dark ? { color: "#C9D6EE" } : undefined}>We save your plan to this email so it carries into your account.</span>
        </div>
      )}
      {(ask("industry") || ask("market")) && (
        <div className="grid cols-2" style={{ gap: 16 }}>
          {ask("industry") && (
            <div className="field">
              <label htmlFor="pl-industry" style={lbl}>Industry</label>
              <select className="input" id="pl-industry" name="industry" defaultValue={INDUSTRIES.includes(pre.industry) ? pre.industry : INDUSTRIES[0]}>
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
          )}
          {ask("market") && (
            <div className="field">
              <label htmlFor="pl-market" style={lbl}>Where your customers are</label>
              <input className="input" id="pl-market" name="market" required placeholder="City, state or nationwide" defaultValue={pre.market || ""} />
            </div>
          )}
        </div>
      )}
      <div className="field">
        <label htmlFor="pl-budget" style={lbl}>Your starting ad budget (US dollars)</label>
        <input className="input mono" id="pl-budget" name="budget" type="number" required min={MIN_BUDGET} step={50} inputMode="numeric" defaultValue={Number(pre.budget) >= MIN_BUDGET ? Number(pre.budget) : MIN_BUDGET} />
        <span className="small" style={dark ? { color: "#C9D6EE" } : undefined}>Any amount from ${MIN_BUDGET}. We split it across the channels in your plan.</span>
      </div>
      {error && <p className="note note-err" role="alert">{error}</p>}
      <button className={`btn ${dark ? "btn-white" : "btn-blue"}`} type="submit">{cta}</button>
    </form>
  );
}
