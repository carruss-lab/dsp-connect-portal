"use client";
import { useState } from "react";
import { BRIEF, type Field } from "@/lib/brief";

type Saved = Record<string, string> | null;

/** The campaign brief: what we need to know before building a client's first campaign. */
export default function IntakeForm({ lead, saved, defaults }: { lead: string; saved: Saved; defaults: Record<string, string> }) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");
  const start = { ...defaults, ...(saved || {}) };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setState("busy");
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = { lead };
    for (const s of BRIEF) for (const f of s.fields) body[f.key] = f.type === "checks" ? fd.getAll(f.key) : fd.get(f.key) || "";
    try {
      const res = await fetch("/api/client/intake", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || "Something went wrong. Please try again.");
      setState("done"); window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong. Please try again."); setState("idle"); }
  }

  if (state === "done")
    return <p className="note note-ok" role="status">Thank you. We have your campaign brief. Next, we review it and email you your campaign plan to approve. You can come back to this page at any time to see progress or update your answers.</p>;

  const input = (f: Field) => {
    const id = `b-${f.key}`, v = start[f.key] || "";
    if (f.type === "area") return <textarea id={id} name={f.key} className="input" required={f.required} placeholder={f.placeholder} defaultValue={v} />;
    if (f.type === "select")
      return <select id={id} name={f.key} className="input" required={f.required} defaultValue={v}><option value="" disabled={f.required}>Choose one</option>{f.options.map((o) => <option key={o}>{o}</option>)}</select>;
    if (f.type === "checks")
      return (
        <div className="ticks" role="group" aria-labelledby={`${id}-l`}>
          {f.options.map((o) => (
            <label key={o} style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44 }}>
              <input type="checkbox" name={f.key} value={o} defaultChecked={v.split(", ").includes(o)} style={{ width: 20, height: 20, flexShrink: 0 }} /> {o}
            </label>
          ))}
        </div>
      );
    return <input id={id} name={f.key} className={`input${f.type === "money" ? " mono" : ""}`} type={f.type === "money" ? "text" : f.type} inputMode={f.type === "money" ? "decimal" : undefined} required={f.required} placeholder={f.placeholder} defaultValue={v} />;
  };

  return (
    <form onSubmit={submit} className="stack g32">
      {BRIEF.map((s, i) => (
        <fieldset key={s.id} className="stack g16" style={{ border: 0, padding: 0, margin: 0, borderTop: i ? "1px solid var(--line)" : 0, paddingTop: i ? 28 : 0 }}>
          <legend className="h3" style={{ fontSize: 18, padding: 0, marginBottom: 6 }}><span className="num" style={{ marginRight: 10 }}>{String(i + 1).padStart(2, "0")}</span>{s.title}</legend>
          <p className="small">{s.why}</p>
          {s.fields.map((f) => (
            <div className="field" key={f.key}>
              {f.type === "checks" ? <span className="label" id={`b-${f.key}-l`}>{f.label}</span> : <label htmlFor={`b-${f.key}`}>{f.label}{"required" in f && f.required ? "" : <span className="small"> (optional)</span>}</label>}
              {input(f)}
              {f.help && <span className="small">{f.help}</span>}
            </div>
          ))}
        </fieldset>
      ))}
      {error && <p className="note note-err" role="alert">{error}</p>}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn btn-ink" disabled={state === "busy"}>{state === "busy" ? "Sending…" : saved ? "Update my campaign brief" : "Send my campaign brief"}</button>
        <span className="small">You can come back and change any answer later.</span>
      </div>
    </form>
  );
}
