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
  if (state === "sent") return <p className="note note-ok" role="status">Check your inbox. If {email} is on the Sales Partner list, a sign-in link is on its way. It works once, for 30 minutes.</p>;
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

/** Choose person or company, accept each document, type the full legal name, sign. */
export function SignDocs({ docs, defaultName, entity: e0 = "individual", company: c0 = "" }: { docs: { id: string; label: string }[]; defaultName: string; entity?: "individual" | "company"; company?: string }) {
  const [accepted, setAccepted] = useState<string[]>([]);
  const [entity, setEntity] = useState<"individual" | "company">(e0);
  const [company, setCompany] = useState(c0);
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const all = docs.every((d) => accepted.includes(d.id));
  const ready = all && name.trim().split(/\s+/).length >= 2 && (entity === "individual" || (company.trim().length >= 2 && title.trim().length >= 2));
  return (
    <form className="stack g16" onSubmit={async (e) => {
      e.preventDefault(); if (!ready) return; setBusy(true); setError("");
      try { await post("/api/partner/sign", { legal_name: name, accepted, entity, company, title }); location.reload(); } catch (err) { setError(err instanceof Error ? err.message : String(err)); setBusy(false); }
    }}>
      <fieldset className="stack g8" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="small" style={{ fontWeight: 600, marginBottom: 6 }}>Who is the Sales Partner?</legend>
        <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 15 }}><input type="radio" name="entity" checked={entity === "individual"} onChange={() => setEntity("individual")} /> Me, as an individual</label>
        <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 15 }}><input type="radio" name="entity" checked={entity === "company"} onChange={() => setEntity("company")} /> My company (I am authorized to sign for it)</label>
      </fieldset>
      {entity === "company" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <div className="field" style={{ flex: "2 1 260px" }}><label htmlFor="co">Company&apos;s full legal name</label>
            <input id="co" className="input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Desert Sales Group LLC" autoComplete="organization" /></div>
          <div className="field" style={{ flex: "1 1 180px" }}><label htmlFor="ti">Your title</label>
            <input id="ti" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Owner, President" autoComplete="organization-title" /></div>
        </div>
      )}
      <div className="stack g8">{docs.map((d) => (
        <label key={d.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 15 }}>
          <input type="checkbox" style={{ marginTop: 4 }} checked={accepted.includes(d.id)} onChange={(e) => setAccepted((a) => e.target.checked ? [...a, d.id] : a.filter((x) => x !== d.id))} />
          <span>I have read and accept the {d.label}{entity === "company" ? " on behalf of my company" : ""}.</span>
        </label>
      ))}</div>
      <div className="field"><label htmlFor="ln">Type your full legal name to sign</label>
        <input id="ln" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={defaultName} autoComplete="name" style={{ fontSize: 18 }} /></div>
      <p className="small">Typing your name and pressing Sign is your electronic signature{entity === "company" ? ", given for your company" : ""}. We record the time, your IP address and the version of the documents, and email you a signed copy.</p>
      {error && <p className="note note-err" role="alert">{error}</p>}
      <button className="btn btn-blue" disabled={!ready || busy} style={{ alignSelf: "flex-start" }}>{busy ? "Signing…" : "Sign the agreement"}</button>
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

/** An email template with its subject and body, ready to copy. */
export function CopyTemplate({ title, when, subject, body }: { title: string; when: string; subject: string; body: string }) {
  const [copied, setCopied] = useState("");
  const copy = (what: string, text: string) => { navigator.clipboard?.writeText(text); setCopied(what); setTimeout(() => setCopied(""), 1800); };
  return (
    <details className="card stack g8">
      <summary style={{ cursor: "pointer", fontWeight: 600 }}>{title} <span className="small" style={{ fontWeight: 400 }}>· {when}</span></summary>
      <div className="stack g8" style={{ marginTop: 8 }}>
        <div className="small"><b>Subject:</b> {subject}</div>
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 14, background: "var(--ground)", padding: 12, borderRadius: 8, margin: 0 }}>{body}</pre>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-line" style={{ minHeight: 36 }} onClick={() => copy("subject", subject)}>{copied === "subject" ? "Copied" : "Copy subject"}</button>
          <button className="btn btn-line" style={{ minHeight: 36 }} onClick={() => copy("body", body)}>{copied === "body" ? "Copied" : "Copy email"}</button>
        </div>
      </div>
    </details>
  );
}

/** The partner adds a rep by name and email. The rep is emailed their own sign-in link. */
export function TeamInvite() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy">("idle");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  return (
    <form className="stack g12" onSubmit={async (e) => {
      e.preventDefault(); setError(""); setDone(""); setState("busy");
      try { await post("/api/partner/team", { action: "invite", name, email }); setDone(`${name} is on your team. We emailed them a link to their portal.`); setName(""); setEmail(""); setTimeout(() => location.reload(), 1200); }
      catch (err) { setError(err instanceof Error ? err.message : String(err)); }
      setState("idle");
    }}>
      <div className="grid cols-2" style={{ gap: 12 }}>
        <div className="field"><label htmlFor="tm-name">Rep&apos;s full name</label>
          <input id="tm-name" className="input" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" /></div>
        <div className="field"><label htmlFor="tm-email">Rep&apos;s email</label>
          <input id="tm-email" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" placeholder="rep@yourcompany.com" /></div>
      </div>
      {error && <p className="note note-err" role="alert">{error}</p>}
      {done && <p className="note note-ok" role="status">{done}</p>}
      <button className="btn btn-blue" style={{ alignSelf: "flex-start" }} disabled={state === "busy"}>{state === "busy" ? "Adding…" : "Add to your team"}</button>
    </form>
  );
}

/** Removes a rep: their sign-in and links stop working. Clients they already brought stay credited to you. */
export function RemoveRep({ id, name }: { id: string; name: string }) {
  const [state, setState] = useState<"idle" | "confirm" | "busy">("idle");
  const [error, setError] = useState("");
  if (state === "confirm" || state === "busy") return (
    <span style={{ display: "inline-flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <span className="small">Remove {name}?</span>
      <button className="btn btn-line" style={{ minHeight: 32 }} disabled={state === "busy"} onClick={async () => {
        setState("busy"); setError("");
        try { await post("/api/partner/team", { action: "remove", id }); location.reload(); } catch (err) { setError(err instanceof Error ? err.message : String(err)); setState("confirm"); }
      }}>{state === "busy" ? "Removing…" : "Yes, remove"}</button>
      <button className="btn btn-line" style={{ minHeight: 32 }} onClick={() => setState("idle")}>Cancel</button>
      {error && <span className="small" style={{ color: "#8A1C0E" }}>{error}</span>}
    </span>
  );
  return <button className="btn btn-line" style={{ minHeight: 32 }} onClick={() => setState("confirm")}>Remove</button>;
}
