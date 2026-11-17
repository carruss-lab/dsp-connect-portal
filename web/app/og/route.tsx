import { ImageResponse } from "next/og";

const size = { width: 1200, height: 630 };

// The default picture shown when a page is shared in a message, on LinkedIn or in search.
// A plain route (not an opengraph-image file) so every page can name it explicitly in its metadata.
export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0B1220", color: "#fff", padding: 72 }}>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>DSP Connect</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 980 }}>Enterprise programmatic advertising. Without the enterprise contract.</div>
          <div style={{ display: "flex", fontSize: 32, color: "#9DB4E8", marginTop: 28 }}>Streaming TV, apps and websites. From $750. Live in 14 days.</div>
        </div>
        <div style={{ display: "flex", height: 10, width: 220, background: "#0A4FD6" }} />
      </div>
    ),
    size,
  );
}
