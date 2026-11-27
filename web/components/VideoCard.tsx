"use client";
import { useState } from "react";
import { useT, useLang } from "@/lib/useLang";

type Props = {
  n: number; id: string; anchorId: string; title: string; summary: string; points: string[];
  chapters: [number, string][]; transcript?: string; length?: string; premiere?: string; next?: { anchorId: string; title: string };
};

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * One video in the library: the YouTube player embedded on the page (loaded as the visitor scrolls to it),
 * with its key points, chapters that jump the player to that moment, and the full transcript.
 */
export default function VideoCard(p: Props) {
  const [start, setStart] = useState<number | null>(null);
  const t = useT(); const lang = useLang();
  // Spanish readers get YouTube's player in Spanish, with Spanish captions turned on where YouTube has them.
  const src = `https://www.youtube-nocookie.com/embed/${p.id}?rel=0&modestbranding=1&playsinline=1${lang === "es" ? "&hl=es&cc_lang_pref=es&cc_load_policy=1" : ""}${start !== null ? `&start=${start}&autoplay=1` : ""}`;
  return (
    <article id={p.anchorId} className="vl-card" aria-labelledby={`${p.anchorId}-t`}>
      <div className="vl-player">
        <iframe key={start ?? "base"} src={src} title={p.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      </div>
      <div className="vl-body">
        <div className="vl-meta">
          <span className="vl-n">{p.n}</span>
          {p.length && <span>{p.length}</span>}
          {p.premiere && <span className="vl-badge">{t("Premieres", "Se estrena")} {p.premiere}</span>}
        </div>
        <h3 id={`${p.anchorId}-t`} className="vl-title">{p.title}</h3>
        {p.summary && <p className="vl-sum">{p.summary}</p>}
        {p.points.length > 0 && (
          <div>
            <div className="vl-label">{t("Key points", "Puntos clave")}</div>
            <ul className="vl-points">{p.points.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        )}
        {p.chapters.length > 1 && (
          <div>
            <div className="vl-label">{t("Chapters", "Capítulos")}</div>
            <ol className="vl-chapters">
              {p.chapters.map(([sec, name]) => (
                <li key={sec}>
                  <button type="button" onClick={() => setStart(sec)} aria-label={`${t("Play from", "Reproducir desde")} ${clock(sec)}: ${name}`}>
                    <span className="vl-time">{clock(sec)}</span> {name}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
        {p.transcript && (
          <details className="vl-transcript">
            <summary>{t("Read the transcript", "Leer la transcripción")}{lang === "es" ? " (en inglés)" : ""}</summary>
            <p>{p.transcript}</p>
          </details>
        )}
        <div className="vl-links">
          <a href={`https://www.youtube.com/watch?v=${p.id}`} target="_blank" rel="noopener">{t("Watch on YouTube", "Ver en YouTube")}</a>
          {p.next && <a href={`#${p.next.anchorId}`}>{t("Next", "Siguiente")}: {p.next.title}</a>}
        </div>
      </div>
    </article>
  );
}
