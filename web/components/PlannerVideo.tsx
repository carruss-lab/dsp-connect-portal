"use client";
import Link from "@/components/Link";
import VideoEmbed from "./VideoEmbed";
import { forLang, type Video } from "@/lib/videos";
import { useLang } from "@/lib/useLang";

/** A section that shows one of the ad planner videos beside what it covers, with a link to the planner. */
export default function PlannerVideo({ v, id, eyebrow, title, points, cta, href = "/planner", band = false }: {
  v: Video; id: string; eyebrow: string; title: string; points: string[]; cta?: string; href?: string; band?: boolean;
}) {
  const lang = useLang();
  const vv = forLang(v, lang);
  cta = cta || (lang === "es" ? "Pruebe el planificador gratis" : "Try the free ad planner");
  return (
    <section id={id} className={`section${band ? " band" : ""}`} aria-labelledby={`${id}-h`}>
      <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: 48, alignItems: "center" }}>
        <div className="stack g16" style={{ flex: "1 1 340px", minWidth: 0 }}>
          <div className="eyebrow">{eyebrow}</div>
          <h2 id={`${id}-h`} className="h2">{title}</h2>
          <ul className="list" style={{ fontSize: 15 }}>{points.map((p) => <li key={p}>{p}</li>)}</ul>
          <Link className="btn btn-blue" href={href} style={{ alignSelf: "flex-start" }}>{cta}</Link>
        </div>
        <div style={{ flex: "1 1 520px", minWidth: 0 }}>
          <VideoEmbed id={vv.id} title={vv.title} poster={vv.poster} />
        </div>
      </div>
    </section>
  );
}
