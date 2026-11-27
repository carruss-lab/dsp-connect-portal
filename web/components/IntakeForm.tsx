"use client";
import { useState } from "react";
import { BRIEF, type Field } from "@/lib/brief";
import { FIELD_ES, OPTION_ES, SECTION_ES } from "@/lib/brief.es";
import { useLang } from "@/lib/useLang";
import { tr } from "@/lib/i18n";

type Saved = Record<string, string> | null;

/** The campaign brief: what we need to know before building a client's first campaign. */
export default function IntakeForm({ lead, saved, defaults }: { lead: string; saved: Saved; defaults: Record<string, string> }) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");
  const start = { ...defaults, ...(saved || {}) };
  const lang = useLang(); const t = tr(lang); const es = lang === "es";
  const L = (f: Field) => (es && FIELD_ES[f.key]) || { label: f.label, placeholder: "placeholder" in f ? f.placeholder : undefined, help: f.help };
  const O = (o: string) => (es ? OPTION_ES[o] || o : o);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setState("busy");
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = { lead };
    for (const s of BRIEF) for (const f of s.fields) body[f.key] = f.type === "checks" ? fd.getAll(f.key) : fd.get(f.key) || "";
    try {
      const res = await fetch("/api/client/intake", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, lang }) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || t("Something went wrong. Please try again.", "Algo salió mal. Inténtelo de nuevo."));
      setState("done"); window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) { setError(err instanceof Error ? err.message : t("Something went wrong. Please try again.", "Algo salió mal. Inténtelo de nuevo.")); setState("idle"); }
  }

  if (state === "done")
    return <p className="note note-ok" role="status">{t("Thank you. We have your campaign brief. Next, we review it and email you your campaign plan to approve. You can come back to this page at any time to see progress or update your answers.", "Gracias. Tenemos el resumen de su campaña. Ahora lo revisamos y le enviamos por correo el plan de su campaña para que lo apruebe. Puede volver a esta página cuando quiera para ver el avance o actualizar sus respuestas.")}</p>;

  const input = (f: Field) => {
    const id = `b-${f.key}`, v = start[f.key] || "";
    if (f.type === "area") return <textarea id={id} name={f.key} className="input" required={f.required} placeholder={L(f).placeholder} defaultValue={v} />;
    if (f.type === "select")
      return <select id={id} name={f.key} className="input" required={f.required} defaultValue={v}><option value="" disabled={f.required}>{t("Choose one", "Elija una opción")}</option>{f.options.map((o) => <option key={o} value={o}>{O(o)}</option>)}</select>;
    if (f.type === "checks")
      return (
        <div className="ticks" role="group" aria-labelledby={`${id}-l`}>
          {f.options.map((o) => (
            <label key={o} style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44 }}>
              <input type="checkbox" name={f.key} value={o} defaultChecked={v.split(", ").includes(o)} style={{ width: 20, height: 20, flexShrink: 0 }} /> {O(o)}
            </label>
          ))}
        </div>
      );
    return <input id={id} name={f.key} className={`input${f.type === "money" ? " mono" : ""}`} type={f.type === "money" ? "text" : f.type} inputMode={f.type === "money" ? "decimal" : undefined} required={f.required} placeholder={L(f).placeholder} defaultValue={v} />;
  };

  return (
    <form onSubmit={submit} className="stack g32">
      {BRIEF.map((s, i) => (
        <fieldset key={s.id} className="stack g16" style={{ border: 0, padding: 0, margin: 0, borderTop: i ? "1px solid var(--line)" : 0, paddingTop: i ? 28 : 0 }}>
          <legend className="h3" style={{ fontSize: 18, padding: 0, marginBottom: 6 }}><span className="num" style={{ marginRight: 10 }}>{String(i + 1).padStart(2, "0")}</span>{es ? SECTION_ES[s.id]?.title || s.title : s.title}</legend>
          <p className="small">{es ? SECTION_ES[s.id]?.why || s.why : s.why}</p>
          {s.fields.map((f) => (
            <div className="field" key={f.key}>
              {f.type === "checks" ? <span className="label" id={`b-${f.key}-l`}>{L(f).label}</span> : <label htmlFor={`b-${f.key}`}>{L(f).label}{"required" in f && f.required ? "" : <span className="small"> {t("(optional)", "(opcional)")}</span>}</label>}
              {input(f)}
              {L(f).help && <span className="small">{L(f).help}</span>}
            </div>
          ))}
        </fieldset>
      ))}
      {error && <p className="note note-err" role="alert">{error}</p>}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn btn-ink" disabled={state === "busy"}>{state === "busy" ? t("Sending…", "Enviando…") : saved ? t("Update my campaign brief", "Actualizar el resumen de mi campaña") : t("Send my campaign brief", "Enviar el resumen de mi campaña")}</button>
        <span className="small">{t("You can come back and change any answer later.", "Puede volver y cambiar cualquier respuesta más tarde.")}</span>
      </div>
    </form>
  );
}
