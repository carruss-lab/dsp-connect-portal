"use client";
import { useState } from "react";

export default function ConnectButton({ token, label }: { token: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="stack g8">
      <button className="btn btn-blue" style={{ alignSelf: "flex-start" }} disabled={busy} onClick={async () => {
        setBusy(true); setError("");
        try {
          const res = await fetch("/api/partner/connect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
          const out = await res.json().catch(() => ({}));
          if (!res.ok || !out.url) throw new Error(out.error || "Something went wrong. Please try again.");
          location.assign(out.url);
        } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong. Please try again."); setBusy(false); }
      }}>{busy ? "Opening Stripe…" : label}</button>
      {error && <p className="note note-err" role="alert">{error}</p>}
    </div>
  );
}
