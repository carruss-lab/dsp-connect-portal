import { ImageResponse } from "next/og";
import { SETUP_DAYS, SHARE_PCT } from "@/lib/site";

export const alt = `DSP Connect for agencies. Keep your clients and earn ${SHARE_PCT}% of the ad spend you manage.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The picture shown when the agency page is shared.
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0B1220", color: "#fff", padding: 72 }}>
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: -0.5, color: "#9DB4E8" }}>DSP Connect · For agencies</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1040 }}>Keep your clients. Earn {SHARE_PCT}% of what they spend.</div>
          <div style={{ display: "flex", fontSize: 32, color: "#9DB4E8", marginTop: 28 }}>Each client set up for you within {SETUP_DAYS} days.</div>
        </div>
        <div style={{ display: "flex", height: 10, width: 220, background: "#0A4FD6" }} />
      </div>
    ),
    size,
  );
}
