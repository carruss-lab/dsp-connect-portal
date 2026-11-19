"use client";
import { useState } from "react";

/** A line chart with value axis, date labels and a hover tooltip, in the platform's style. */
export default function Chart({ points, label, fmt }: { points: { x: string; y: number }[]; label: string; fmt: (v: number) => string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 900, H = 260, L = 64, R = 16, T = 16, B = 34;
  const max = Math.max(...points.map((p) => p.y), 1);
  const nice = (() => { const m = Math.pow(10, Math.floor(Math.log10(max))); return Math.ceil(max / m / 2) * 2 * m || 1; })();
  const x = (i: number) => L + (i * (W - L - R)) / Math.max(points.length - 1, 1);
  const y = (v: number) => T + (1 - v / nice) * (H - T - B);
  const line = points.map((p, i) => `${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join(" ");
  const area = `${x(0)},${y(0)} ${line} ${x(points.length - 1)},${y(0)}`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * nice);
  const every = Math.ceil(points.length / 7);
  return (
    <div className="dm-chart" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label} by day`}>
        {ticks.map((t) => (
          <g key={t}><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#E3E5EC" /><text x={L - 8} y={y(t) + 4} textAnchor="end">{fmt(t)}</text></g>
        ))}
        {points.map((p, i) => (i % every === 0 || i === points.length - 1) && <text key={i} x={x(i)} y={H - 10} textAnchor="middle">{p.x.slice(0, 5)}</text>)}
        <polygon points={area} fill="#1A1C1E" opacity="0.06" />
        <polyline points={line} fill="none" stroke="#1A1C1E" strokeWidth="2.2" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.y)} r={hover === i ? 5 : 3} fill="#fff" stroke="#1A1C1E" strokeWidth="2" />
            <rect x={x(i) - (W - L - R) / points.length / 2} y={T} width={(W - L - R) / points.length} height={H - T - B} fill="transparent" onMouseEnter={() => setHover(i)} />
          </g>
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} stroke="#9AA0AC" strokeDasharray="3 3" />}
      </svg>
      {hover !== null && (
        <div className="dm-tip" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(points[hover].y) / H) * 100}%` }}>
          {points[hover].x}<br /><b>{label}: {fmt(points[hover].y)}</b>
        </div>
      )}
    </div>
  );
}
