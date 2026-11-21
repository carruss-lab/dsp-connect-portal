"use client";
import { useState } from "react";

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
  const src = `https://www.youtube-nocookie.com/embed/${p.id}?rel=0&modestbranding=1&playsinline=1${start !== null ? `&start=${start}&autoplay=1` : ""}`;
  return (
    <article id={p.anchorId} className="vl-card" aria-labelledby={`${p.anchorId}-t`}>
      <div className="vl-player">
        <iframe key={start ?? "base"} src={src} title={p.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      </div>
      <div className="vl-body">
        <div className="vl-meta">
          <span className="vl-n">{p.n}</span>
          {p.length && <span>{p.length}</span>}
          {p.premiere && <span className="vl-badge">Premieres {p.premiere}</span>}
        </div>
        <h3 id={`${p.anchorId}-t`} className="vl-title">{p.title}</h3>
        {p.summary && <p className="vl-sum">{p.summary}</p>}
        {p.points.length > 0 && (
          <div>
            <div className="vl-label">Key points</div>
            <ul className="vl-points">{p.points.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        )}
        {p.chapters.length > 1 && (
          <div>
            <div className="vl-label">Chapters</div>
            <ol className="vl-chapters">
              {p.chapters.map(([t, name]) => (
                <li key={t}>
                  <button type="button" onClick={() => setStart(t)} aria-label={`Play from ${clock(t)}: ${name}`}>
                    <span className="vl-time">{clock(t)}</span> {name}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
        {p.transcript && (
          <details className="vl-transcript">
            <summary>Read the transcript</summary>
            <p>{p.transcript}</p>
          </details>
        )}
        <div className="vl-links">
          <a href={`https://www.youtube.com/watch?v=${p.id}`} target="_blank" rel="noopener">Watch on YouTube</a>
          {p.next && <a href={`#${p.next.anchorId}`}>Next: {p.next.title}</a>}
        </div>
      </div>
    </article>
  );
}
