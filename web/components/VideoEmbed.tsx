"use client";
import { useState } from "react";
import { useLang } from "@/lib/useLang";

/**
 * A YouTube video that loads only when played: a still image and play button until the visitor clicks,
 * then the privacy-enhanced player. Keeps pages fast and sets no YouTube cookies until then.
 */
export default function VideoEmbed({ id, title, poster }: { id: string; title: string; poster?: string }) {
  const [on, setOn] = useState(false);
  const es = useLang() === "es";
  const img = poster || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: 14, overflow: "hidden", background: "#0B1220", boxShadow: "0 24px 60px rgba(10,18,32,.18)" }}>
      {on ? (
        <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1${es ? "&hl=es" : ""}`} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
      ) : (
        <button type="button" onClick={() => setOn(true)} aria-label={`${es ? "Reproducir video" : "Play video"}: ${title}`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, padding: 0, cursor: "pointer", background: `#0B1220 center / cover no-repeat url(${img})` }}>
          <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", translate: "-50% -50%", width: 84, height: 84, borderRadius: 42, background: "#1A14D4", boxShadow: "0 12px 36px rgba(26,20,212,.5)", display: "grid", placeItems: "center" }}>
            <svg width="30" height="30" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff" /></svg>
          </span>
        </button>
      )}
    </div>
  );
}
