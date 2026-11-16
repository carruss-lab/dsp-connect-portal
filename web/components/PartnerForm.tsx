"use client";
import { useState } from "react";
import { INDUSTRIES } from "@/lib/site";

function F({ id, label, ...p }: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <div className="field"><label htmlFor={`p-${id}`}>{label}</label><input className="input" id={`p-${id}`} name={id} {...p} /></div>;
}

export default function PartnerForm() {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setState("busy");
    const d = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/partner-apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...d, independent: d.independent === "on" }) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || "Something went wrong. Please try again.");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again."); setState("idle");
    }
  }
  if (state === "done") return <p className="note note-ok" role="status">Thank you. We have your application and will reply within five business days.</p>;
  return (
    <form onSubmit={submit} className="stack g16">
      <F id="name" label="Full name" required autoComplete="name" />
      <F id="email" label="Email" type="email" required autoComplete="email" />
      <F id="phone" label="Phone" type="tel" autoComplete="tel" />
      <F id="location" label="City and state" required />
      <div className="field"><label htmlFor="p-vertical">Industry you know best</label>
        <select className="input" id="p-vertical" name="vertical" defaultValue={INDUSTRIES[0]}>{INDUSTRIES.map((i) => <option key={i}>{i}</option>)}</select></div>
      <F id="linkedin" label="LinkedIn profile (optional)" placeholder="linkedin.com/in/…" />
      <div className="field"><label htmlFor="p-experience">Your sales or industry background</label><textarea className="input" id="p-experience" name="experience" required /></div>
      <div className="field"><label htmlFor="p-network">Who would you bring DSP Connect to first?</label><textarea className="input" id="p-network" name="network" placeholder="The kinds of businesses you already have relationships with" /></div>
      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: "var(--body)", lineHeight: 1.5 }}>
        <input type="checkbox" name="independent" required style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0 }} />
        <span>I understand this is an independent, commission-only role with no salary or guaranteed income.</span>
      </label>
      {error && <p className="note note-err" role="alert">{error}</p>}
      <button className="btn btn-ink" disabled={state === "busy"}>{state === "busy" ? "Sending…" : "Submit application"}</button>
    </form>
  );
}
