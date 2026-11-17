"use client";
import { track } from "@vercel/analytics";
import { identify } from "@/lib/identify";
import { readProfile, saveProfile } from "@/lib/profile";
import { useEffect, useState } from "react";
import { INDUSTRIES, MIN_BUDGET, SETUP_DAYS } from "@/lib/site";
import { trackLead } from "@/lib/analytics";

type Kind = "market_check" | "account" | "agency";
const DONE: Record<Kind, string> = {
  market_check: "Thank you. Opening the demo.",
  account: `Thank you. We have your details and will be in touch to take payment. Your ${SETUP_DAYS}-day setup starts when payment is received.`,
  agency: "Thank you. We will be in touch about an agency agreement within one business day.",
};

export default function LeadForm({ kind, cta }: { kind: Kind; cta: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");
  const [pre, setPre] = useState<Record<string, string>>({});
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    // What the visitor told us before fills the form in; what the link carries (from the demo) wins.
    const prof = readProfile() as Record<string, string | number | undefined>;
    const o: Record<string, string> = {};
    for (const k of ["name", "email", "phone", "business", "website", "goals", "budget", "formats", "market", "industry"]) { const v = prof[k]; if (typeof v === "string" && v) o[k] = v; }
    for (const k of ["budget", "formats", "goals", "market", "industry"]) { const v = q.get(k); if (v) o[k] = v.slice(0, 200); }
    if (Object.keys(o).length) setPre(o);
    if (!o.market) {
      fetch("/api/geo").then((r) => r.json()).then((g) => { if (g?.market) setPre((cur) => (cur.market ? cur : { ...cur, market: g.market })); }).catch(() => {});
    }
    // A partner's link (?p=CODE) is remembered for this visit so their client is credited to them.
    // Remember how this visitor first arrived (campaign tags, referring site, first page) for the whole visit.
    try {
      if (!sessionStorage.getItem("first_touch")) {
        const ref = document.referrer && !document.referrer.includes(location.host) ? new URL(document.referrer).hostname : "";
        const tags = ["utm_source", "utm_medium", "utm_campaign"].map((k) => q.get(k)).filter(Boolean).join("/");
        sessionStorage.setItem("first_touch", [tags || ref || "direct", location.pathname].join(" | ").slice(0, 180));
      }
    } catch {}
    const code = q.get("p");
    if (code && /^[A-Za-z0-9]{4,20}$/.test(code)) { try { sessionStorage.setItem("partner_code", code.toUpperCase()); } catch {} }
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setState("busy");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const formats = new FormData(e.currentTarget).getAll("formats").join(", ");
    let partner_code = "", first = "";
    try { partner_code = sessionStorage.getItem("partner_code") || ""; first = sessionStorage.getItem("first_touch") || ""; } catch {}
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, formats, terms: data.terms === "on", kind, source: [first, location.pathname].filter(Boolean).join(" > ").slice(0, 240), partner_code }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || "Something went wrong. Please try again.");
      identify(String(data.email || ""), data.name ? String(data.name) : null);
      saveProfile({
        name: String(data.name || ""), email: String(data.email || ""), phone: String(data.phone || ""), business: String(data.business || ""),
        website: String(data.website || ""), industry: String(data.industry || ""), market: String(data.market || ""), goals: String(data.goals || ""),
        budget: data.budget ? String(data.budget) : "", formats,
        stage: kind === "market_check" ? "demo" : kind === "account" ? "signup" : "agency",
      });
      const event = kind === "market_check" ? "demo_opened" : kind === "account" ? "signup_started" : "agency_enquiry";
      track(event);
      trackLead(kind === "market_check" ? "demo" : kind === "account" ? "account" : "agency");
      if (out.pay) { location.assign(out.pay); return; }
      if (kind === "market_check") {
        try { sessionStorage.setItem("demo_ok", "1"); } catch {}
        const q = new URLSearchParams({ industry: String(data.industry || ""), market: String(data.market || "") });
        if (location.pathname === "/demo") {
          const cur = new URLSearchParams(location.search);
          if (cur.get("view")) q.set("view", cur.get("view")!);
          location.assign(`/demo?${q}`);
        }
        else location.assign(`/demo?${q}`);
        return;
      }
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("idle");
    }
  }

  if (state === "done") return <p className="note note-ok" role="status">{DONE[kind]}</p>;

  const full = kind !== "market_check";
  return (
    <form key={JSON.stringify(pre)} onSubmit={submit} className="stack g16">
      {full && (
        <>
          <div className="field">
            <label htmlFor={`${kind}-name`}>Your name</label>
            <input className="input" id={`${kind}-name`} name="name" required autoComplete="name" defaultValue={pre.name || ""} />
          </div>
          <div className="field">
            <label htmlFor={`${kind}-business`}>{kind === "agency" ? "Agency name" : "Business name"}</label>
            <input className="input" id={`${kind}-business`} name="business" required autoComplete="organization" defaultValue={pre.business || ""} />
          </div>
        </>
      )}
      <div className="field">
        <label htmlFor={`${kind}-email`}>Work email</label>
        <input className="input" id={`${kind}-email`} name="email" type="email" required autoComplete="email" placeholder="you@yourbusiness.com" defaultValue={pre.email || ""} />
      </div>
      {full && (
        <div className="field">
          <label htmlFor={`${kind}-phone`}>Phone</label>
          <input className="input" id={`${kind}-phone`} name="phone" type="tel" autoComplete="tel" defaultValue={pre.phone || ""} />
        </div>
      )}
      {kind !== "agency" && (
        <>
          <div className="field">
            <label htmlFor={`${kind}-industry`}>Your industry</label>
            <select className="input" id={`${kind}-industry`} name="industry" defaultValue={INDUSTRIES.includes(pre.industry) ? pre.industry : INDUSTRIES[0]}>
              {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor={`${kind}-market`}>Where your customers are</label>
            <input className="input" id={`${kind}-market`} name="market" required placeholder="City or state" defaultValue={pre.market || ""} />
          </div>
        </>
      )}
      {kind === "account" && (
        <>
          <div className="field">
            <label htmlFor="account-website">Website</label>
            <input className="input" id="account-website" name="website" placeholder="yourbusiness.com" defaultValue={pre.website || ""} />
          </div>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="label" style={{ marginBottom: 8 }}>Ad formats you want to run</legend>
            <div className="ticks">
              {["Video", "Banner", "Native"].map((f) => (
                <label key={f} style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44 }}>
                  <input type="checkbox" name="formats" value={f} defaultChecked={(pre.formats || "").split(", ").includes(f)} style={{ width: 20, height: 20 }} /> {f}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="account-budget">Starting ad budget (US dollars)</label>
            <input className="input mono" id="account-budget" name="budget" type="number" min={MIN_BUDGET} step={50} defaultValue={Number(pre.budget) >= MIN_BUDGET ? Number(pre.budget) : MIN_BUDGET} required />
            <span className="small">Minimum ${MIN_BUDGET}. Paid by card or bank transfer.</span>
          </div>
          <div className="field">
            <label htmlFor="account-goals">What do you want the ads to do?</label>
            <textarea className="input" id="account-goals" name="goals" defaultValue={pre.goals || ""} placeholder="More calls, bookings, store visits, online sales" />
          </div>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: "var(--body)", lineHeight: 1.5 }}>
            <input type="checkbox" name="terms" required style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0 }} />
            <span>I agree to the DSP Connect <a href="/terms" target="_blank">client terms</a> and <a href="/refunds" target="_blank">refund policy</a>.</span>
          </label>
        </>
      )}
      {kind === "agency" && (
        <div className="field">
          <label htmlFor="agency-spend">Ad spend you manage each month</label>
          <select className="input" id="agency-spend" name="monthly_spend" defaultValue="Under $10,000">
            {["Under $10,000", "$10,000 to $50,000", "$50,000 to $150,000", "$150,000 to $500,000", "Over $500,000"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      )}
      {error && <p className="note note-err" role="alert">{error}</p>}
      <button className="btn btn-ink" type="submit" disabled={state === "busy"}>
        {state === "busy" ? "Sending…" : cta}
      </button>
    </form>
  );
}
