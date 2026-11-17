"use client";
import { useState } from "react";

/** Where a new client sends what we need to start: their ads, landing page and website contact. */
export default function IntakeForm({ lead, website }: { lead: string; website?: string | null }) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setState("busy");
    const d = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/client/intake", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lead, ...d, need_ads: d.need_ads === "on" }) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || "Something went wrong. Please try again.");
      setState("done");
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong. Please try again."); setState("idle"); }
  }

  if (state === "done") return <p className="note note-ok" role="status">Thank you. We have your details and will start on your ads and tracking. You can come back to this page at any time to see progress.</p>;
  return (
    <form onSubmit={submit} className="stack g16">
      <div className="field">
        <label htmlFor="in-landing">The web page people should land on</label>
        <input id="in-landing" name="landing_page" className="input" required placeholder="yourbusiness.com/offer" defaultValue={website || ""} />
      </div>
      <div className="field">
        <label htmlFor="in-ads">Link to your ads and logo</label>
        <input id="in-ads" name="ads_link" className="input" placeholder="A shared folder link (Google Drive, Dropbox, OneDrive)" />
        <span className="small">Images or video, plus your logo. No folder? Leave this empty and reply to our email with the files attached.</span>
      </div>
      <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "var(--body)", minHeight: 44 }}>
        <input type="checkbox" name="need_ads" style={{ width: 20, height: 20, flexShrink: 0 }} /> I do not have ads yet and would like to talk about options.
      </label>
      <div className="grid cols-2" style={{ gap: 16 }}>
        <div className="field">
          <label htmlFor="in-wname">Who manages your website?</label>
          <input id="in-wname" name="web_contact_name" className="input" required placeholder="Name" />
        </div>
        <div className="field">
          <label htmlFor="in-wemail">Their email</label>
          <input id="in-wemail" name="web_contact_email" type="email" className="input" required placeholder="name@example.com" />
        </div>
      </div>
      <span className="small">We ask them to add one small piece of tracking code. If that is you, enter your own details.</span>
      <div className="field">
        <label htmlFor="in-notes">Anything else we should know?</label>
        <textarea id="in-notes" name="notes" className="input" placeholder="Offers, dates, areas to focus on or avoid" />
      </div>
      {error && <p className="note note-err" role="alert">{error}</p>}
      <button className="btn btn-ink" disabled={state === "busy"}>{state === "busy" ? "Sending…" : "Send to the DSP Connect team"}</button>
    </form>
  );
}
