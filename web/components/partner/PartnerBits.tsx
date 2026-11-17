"use client";
import { useState } from "react";

const post = async (url: string, body: unknown) => {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || "Something went wrong. Please try again.");
  return out;
};

/** Asks for a one-time sign-in link by email. */
export function LoginForm({ expired }: { expired?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [error, setError] = useState(expired ? "That sign-in link has expired or was already used. Ask for a new one below." : "");
  if (state === "sent") return <p className="note note-ok" role="status">Check your inbox. If {email} is on the Managing Partner list, a sign-in link is on its way. It works once, for 30 minutes.</p>;
  return (
    <form className="stack g16" onSubmit={async (e) => {
      e.preventDefault(); setError(""); setState("busy");
      try { await post("/api/partner/login", { email }); setState("sent"); } catch (err) { setError(err instanceof Error ? err.message : String(err)); setState("idle"); }
    }}>
      <div className="field"><label htmlFor="pe">Your email</label>
        <input id="pe" className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" /></div>
      {error && <p className="note note-err" role="alert">{error}</p>}
      <button className="btn btn-blue" disabled={state === "busy"}>{state === "busy" ? "Sending…" : "Email me a sign-in link"}</button>
    </form>
  );
}

/** Accept each admission document, type the full legal name, sign. */
export function SignDocs({ docs, defaultName }: { docs: { id: string; label: string }[]; defaultName: string }) {
  const [accepted, setAccepted] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const all = docs.every((d) => accepted.includes(d.id));
  const ready = all && name.trim().split(/\s+/).length >= 2;
  return (
    <form className="stack g16" onSubmit={async (e) => {
      e.preventDefault(); if (!ready) return; setBusy(true); setError("");
      try { await post("/api/partner/sign", { legal_name: name, accepted }); location.reload(); } catch (err) { setError(err instanceof Error ? err.message : String(err)); setBusy(false); }
    }}>
      <div className="stack g8">{docs.map((d) => (
        <label key={d.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 15 }}>
          <input type="checkbox" style={{ marginTop: 4 }} checked={accepted.includes(d.id)} onChange={(e) => setAccepted((a) => e.target.checked ? [...a, d.id] : a.filter((x) => x !== d.id))} />
          <span>I have read and accept the {d.label}.</span>
        </label>
      ))}</div>
      <div className="field"><label htmlFor="ln">Type your full legal name to sign</label>
        <input id="ln" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={defaultName} autoComplete="name" style={{ fontSize: 18 }} /></div>
      <p className="small">Typing your name and pressing Sign is your electronic signature. We record the time, your IP address and the version of the documents, and email you a signed copy.</p>
      {error && <p className="note note-err" role="alert">{error}</p>}
      <button className="btn btn-blue" disabled={!ready || busy} style={{ alignSelf: "flex-start" }}>{busy ? "Signing…" : "Sign admission documents"}</button>
    </form>
  );
}

/** Marks a training lesson done. */
export function LessonDone({ id, check, done }: { id: string; check: string; done: boolean }) {
  const [state, setState] = useState<"idle" | "busy" | "done">(done ? "done" : "idle");
  const [ticked, setTicked] = useState(done);
  const [error, setError] = useState("");
  if (state === "done") return <p className="note note-ok" style={{ margin: 0 }}>Done: {check}</p>;
  return (
    <div className="stack g8">
      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 15 }}>
        <input type="checkbox" style={{ marginTop: 4 }} checked={ticked} onChange={(e) => setTicked(e.target.checked)} /><span>{check}</span>
      </label>
      {error && <p className="note note-err" role="alert">{error}</p>}
      <button className="btn btn-line" style={{ alignSelf: "flex-start", minHeight: 38 }} disabled={!ticked || state === "busy"} onClick={async () => {
        setState("busy"); setError("");
        try { await post("/api/partner/training", { lesson: id }); setState("done"); location.reload(); } catch (err) { setError(err instanceof Error ? err.message : String(err)); setState("idle"); }
      }}>{state === "busy" ? "Saving…" : "Mark lesson complete"}</button>
    </div>
  );
}

/** A link with a copy button. */
export function CopyLink({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="stack g8">
      <div className="small" style={{ fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <code className="dm-code" style={{ margin: 0, wordBreak: "break-all" }}>{url}</code>
        <button className="btn btn-line" style={{ minHeight: 36 }} onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }}>{copied ? "Copied" : "Copy"}</button>
      </div>
    </div>
  );
}
