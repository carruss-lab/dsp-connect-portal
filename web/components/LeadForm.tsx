"use client";
import { useState } from "react";
import { INDUSTRIES, MIN_BUDGET, SETUP_DAYS } from "@/lib/site";

type Kind = "market_check" | "account" | "agency";
const DONE: Record<Kind, string> = {
  market_check: "Thank you. Your market report is on its way to your inbox.",
  account: `Thank you. We have your details. We will email you the payment link, and your ${SETUP_DAYS}-day setup starts when payment is received.`,
  agency: "Thank you. We will be in touch about an agency agreement within one business day.",
};

export default function LeadForm({ kind, cta }: { kind: Kind; cta: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setState("busy");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const formats = new FormData(e.currentTarget).getAll("formats").join(", ");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, formats, terms: data.terms === "on", kind, source: location.pathname }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || "Something went wrong. Please try again.");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("idle");
    }
  }

  if (state === "done") return <p className="note note-ok" role="status">{DONE[kind]}</p>;

  const full = kind !== "market_check";
  return (
    <form onSubmit={submit} className="stack g16" noValidate={false}>
      {full && (
        <>
          <div className="field">
            <label htmlFor={`${kind}-name`}>Your name</label>
            <input className="input" id={`${kind}-name`} name="name" required autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor={`${kind}-business`}>{kind === "agency" ? "Agency name" : "Business name"}</label>
            <input className="input" id={`${kind}-business`} name="business" required autoComplete="organization" />
          </div>
        </>
      )}
      <div className="field">
        <label htmlFor={`${kind}-email`}>Work email</label>
        <input className="input" id={`${kind}-email`} name="email" type="email" required autoComplete="email" placeholder="you@yourbusiness.com" />
      </div>
      {full && (
        <div className="field">
          <label htmlFor={`${kind}-phone`}>Phone</label>
          <input className="input" id={`${kind}-phone`} name="phone" type="tel" autoComplete="tel" />
        </div>
      )}
      {kind !== "agency" && (
        <>
          <div className="field">
            <label htmlFor={`${kind}-industry`}>Your industry</label>
            <select className="input" id={`${kind}-industry`} name="industry" defaultValue={INDUSTRIES[0]}>
              {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor={`${kind}-market`}>Where your customers are</label>
            <input className="input" id={`${kind}-market`} name="market" required placeholder="City or state" />
          </div>
        </>
      )}
      {kind === "account" && (
        <>
          <div className="field">
            <label htmlFor="account-website">Website</label>
            <input className="input" id="account-website" name="website" placeholder="yourbusiness.com" />
          </div>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="label" style={{ marginBottom: 8 }}>Ad formats you want to run</legend>
            <div className="ticks">
              {["Video", "Banner", "Native"].map((f) => (
                <label key={f} style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44 }}>
                  <input type="checkbox" name="formats" value={f} style={{ width: 20, height: 20 }} /> {f}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="account-budget">Starting ad budget (US dollars)</label>
            <input className="input mono" id="account-budget" name="budget" type="number" min={MIN_BUDGET} step={50} defaultValue={MIN_BUDGET} required />
            <span className="small">Minimum ${MIN_BUDGET}. Paid by card or bank transfer.</span>
          </div>
          <div className="field">
            <label htmlFor="account-goals">What do you want the ads to do?</label>
            <textarea className="input" id="account-goals" name="goals" placeholder="More calls, bookings, store visits, online sales" />
          </div>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: "var(--body)", lineHeight: 1.5 }}>
            <input type="checkbox" name="terms" required style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0 }} />
            <span>I agree to the DSP Connect client terms.</span>
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
