import { ImageResponse } from "next/og";

export const alt = "DSP Connect. Done-for-you setup. Live in 14 days.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The picture shown when a page is shared in a message, on LinkedIn or in search.
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0B1220", color: "#fff", padding: 72 }}>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>DSP Connect</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 980 }}>See exactly what you get before you spend a dollar.</div>
          <div style={{ display: "flex", fontSize: 32, color: "#9DB4E8", marginTop: 28 }}>Done-for-you setup. Live in 14 days. From $750.</div>
        </div>
        <div style={{ display: "flex", height: 10, width: 220, background: "#0A4FD6" }} />
      </div>
    ),
    size,
  );
}
