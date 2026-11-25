"use client";
import { useState } from "react";
import { trackLead } from "@/lib/analytics";
import { INDUSTRIES, PARTNER_COUNTRIES } from "@/lib/site";

/** Public application to become an Authorized Sales Partner. */
export default function ApplyForm() {
  const [entity, setEntity] = useState<"individual" | "company">("individual");
  const [state, setState] = useState<"idle" | "busy" | "done" | "existing">("idle");
  const [error, setError] = useState("");
  if (state === "done" || state === "existing") {
    return (
      <div className="note note-ok stack g8" role="status">
        <b>{state === "done" ? "Thank you. Your application is in." : "We already have your application."}</b>
        <span>We review every application and reply by email, usually within two business days. {state === "done" ? "A confirmation is on its way to your inbox." : ""}</span>
      </div>
    );
  }
  return (
    <form className="stack g16" onSubmit={async (e) => {
      e.preventDefault(); setState("busy"); setError("");
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      try {
        const r = await fetch("/api/partner/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, entity, agree: !!data.agree }) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || "Something went wrong. Please try again.");
        if (!j.existing) trackLead("sales_partner");
        setState(j.existing ? "existing" : "done");
      } catch (err) { setError(err instanceof Error ? err.message : String(err)); setState("idle"); }
    }}>
      <fieldset className="stack g8" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="small" style={{ fontWeight: 600, marginBottom: 6 }}>You are applying as</legend>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="radio" name="entity_choice" checked={entity === "individual"} onChange={() => setEntity("individual")} /> An individual</label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="radio" name="entity_choice" checked={entity === "company"} onChange={() => setEntity("company")} /> A company (ISO, agency or sales firm)</label>
        </div>
      </fieldset>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <div className="field" style={{ flex: "1 1 220px" }}><label htmlFor="ap-name">Your full name</label><input id="ap-name" name="name" className="input" required autoComplete="name" /></div>
        {entity === "company" && <div className="field" style={{ flex: "1 1 220px" }}><label htmlFor="ap-company">Company name</label><input id="ap-company" name="company" className="input" required autoComplete="organization" /></div>}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <div className="field" style={{ flex: "1 1 220px" }}><label htmlFor="ap-email">Email</label><input id="ap-email" name="email" type="email" className="input" required autoComplete="email" /></div>
        <div className="field" style={{ flex: "1 1 160px" }}><label htmlFor="ap-phone">Phone</label><input id="ap-phone" name="phone" type="tel" className="input" autoComplete="tel" /></div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <div className="field" style={{ flex: "1 1 200px" }}><label htmlFor="ap-country">Country you live in</label>
          <select id="ap-country" name="country" className="input" required defaultValue=""><option value="" disabled>Choose your country</option>{PARTNER_COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}</select></div>
        <div className="field" style={{ flex: "1 1 200px" }}><label htmlFor="ap-loc">Where you sell (city and state or region)</label><input id="ap-loc" name="location" className="input" placeholder="e.g. Phoenix, AZ" /></div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <div className="field" style={{ flex: "1 1 200px" }}><label htmlFor="ap-vert">Main industry you sell into</label>
          <select id="ap-vert" name="vertical" className="input">{INDUSTRIES.map((i) => <option key={i}>{i}</option>)}</select></div>
      </div>
      <div className="field"><label htmlFor="ap-exp">What do you sell today, and to whom?</label>
        <textarea id="ap-exp" name="experience" className="input" rows={3} placeholder="e.g. Merchant services to restaurants and retail for 6 years" /></div>
      <div className="field"><label htmlFor="ap-net">How many local businesses do you talk to in a typical month? (optional)</label>
        <textarea id="ap-net" name="network" className="input" rows={2} /></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <div className="field" style={{ flex: "1 1 220px" }}><label htmlFor="ap-web">Website (optional)</label><input id="ap-web" name="website" className="input" /></div>
        <div className="field" style={{ flex: "1 1 220px" }}><label htmlFor="ap-li">LinkedIn (optional)</label><input id="ap-li" name="linkedin" className="input" /></div>
      </div>
      <input name="company_fax" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1 }} />
      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14 }}>
        <input type="checkbox" name="agree" required style={{ marginTop: 3 }} />
        <span>DSP Connect may contact me about this application. Applying does not create any agreement; if approved, I will review and sign the Sales Partner Agreement before I start.</span>
      </label>
      {error && <p className="note note-err" role="alert">{error}</p>}
      <button className="btn btn-blue" disabled={state === "busy"} style={{ alignSelf: "flex-start" }}>{state === "busy" ? "Sending…" : "Apply to become a Sales Partner"}</button>
    </form>
  );
}
