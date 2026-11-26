import Link from "next/link";
import VideoEmbed from "./VideoEmbed";
import type { Video } from "@/lib/videos";

/** A section that shows one of the ad planner videos beside what it covers, with a link to the planner. */
export default function PlannerVideo({ v, id, eyebrow, title, points, cta = "Try the free ad planner", href = "/planner", band = false }: {
  v: Video; id: string; eyebrow: string; title: string; points: string[]; cta?: string; href?: string; band?: boolean;
}) {
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
          <VideoEmbed id={v.id} title={v.title} poster={v.poster} />
        </div>
      </div>
    </section>
  );
}
