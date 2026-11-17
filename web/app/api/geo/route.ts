import { NextResponse } from "next/server";

// The visitor's approximate city and state from Vercel's network edge, used only to suggest
// "Where your customers are" on our forms when the visitor has not told us yet. Nothing is stored.
export async function GET(req: Request) {
  const h = req.headers;
  const dec = (v: string | null) => { try { return v ? decodeURIComponent(v) : ""; } catch { return ""; } };
  const city = dec(h.get("x-vercel-ip-city")), region = h.get("x-vercel-ip-country-region") || "", country = h.get("x-vercel-ip-country") || "";
  const market = country === "US" && city ? `${city}${region ? ", " + region : ""}` : "";
  return NextResponse.json({ market }, { headers: { "Cache-Control": "private, no-store" } });
}
