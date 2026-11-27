"use client";
import { useState } from "react";
import { useLang } from "@/lib/useLang";

export default function ConnectButton({ token, label }: { token: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lang = useLang(); const es = lang === "es";
  const oops = es ? "Algo salió mal. Inténtelo de nuevo." : "Something went wrong. Please try again.";
  return (
    <div className="stack g8">
      <button className="btn btn-blue" style={{ alignSelf: "flex-start" }} disabled={busy} onClick={async () => {
        setBusy(true); setError("");
        try {
          const res = await fetch("/api/partner/connect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, lang }) });
          const out = await res.json().catch(() => ({}));
          if (!res.ok || !out.url) throw new Error(out.error || oops);
          location.assign(out.url);
        } catch (err) { setError(err instanceof Error ? err.message : oops); setBusy(false); }
      }}>{busy ? (es ? "Abriendo Stripe…" : "Opening Stripe…") : label}</button>
      {error && <p className="note note-err" role="alert">{error}</p>}
    </div>
  );
}
