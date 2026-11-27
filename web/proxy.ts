import { NextResponse, type NextRequest } from "next/server";

// English pages keep their plain addresses; internally every page lives under app/[lang].
// /es/... is served as is; anything else is rewritten to /en/...
export function proxy(req: NextRequest) {
  const p = req.nextUrl.pathname;
  if (p === "/es" || p.startsWith("/es/") || p === "/en" || p.startsWith("/en/")) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = p === "/" ? "/en" : `/en${p}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|admin|og|_next|_vercel|robots\\.txt|sitemap\\.xml|llms|favicon|icon|apple-icon|video/|brand/|.*\\.[a-zA-Z0-9]{2,5}$).*)"],
};
