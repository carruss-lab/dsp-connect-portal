import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// Reads a prospect's public website so the ad planner can base its plan on what the business actually sells.
// Only public http(s) pages on the normal ports are fetched; private, internal and cloud-metadata addresses are
// refused at every hop (including redirects), each page is capped in size and time, and nothing is executed.

const MAX_BYTES = 700_000;
const TIMEOUT_MS = 8000;
const UA = "Mozilla/5.0 (compatible; DSPConnectPlanner/1.0; +https://getdspconnect.com/planner)";

export type Signals = {
  url: string; host: string; reachable: boolean; title: string; description: string; headings: string[]; text: string;
  pages: { url: string; title: string }[]; platform: string | null; ecommerce: boolean; prices: string[];
  phone: boolean; forms: boolean; booking: boolean; video: boolean; app: boolean;
  tags: { googleTag: boolean; tagManager: boolean; metaPixel: boolean; tiktokPixel: boolean; linkedin: boolean };
  locations: string[]; schemaTypes: string[]; socials: string[];
};

/** Normalises what a visitor typed ("acme.com", "www.acme.com/shop") into a URL, or null. */
export function normaliseUrl(input: string): URL | null {
  let s = input.trim();
  if (!s || s.length > 300) return null;
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    if (!/^https?:$/.test(u.protocol) || u.username || u.password) return null;
    if (u.port && u.port !== "80" && u.port !== "443") return null;
    if (!u.hostname.includes(".") || /\.(local|internal|localhost|lan|home|corp|arpa)$/i.test(u.hostname)) return null;
    u.hash = "";
    return u;
  } catch {
    return null;
  }
}

function privateIp(ip: string): boolean {
  if (isIP(ip) === 6) {
    const v = ip.toLowerCase();
    if (v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80")) return true;
    const m = v.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    return m ? privateIp(m[1]) : false;
  }
  const [a, b] = ip.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)
    || (a === 100 && b >= 64 && b <= 127) || a >= 224 || (a === 198 && (b === 18 || b === 19));
}

async function safeHost(host: string): Promise<boolean> {
  if (isIP(host)) return !privateIp(host);
  try {
    const all = await lookup(host, { all: true });
    return all.length > 0 && all.every((r) => !privateIp(r.address));
  } catch {
    return false;
  }
}

/** One page, following up to 4 redirects and checking every address it lands on. */
async function get(url: URL): Promise<{ url: URL; html: string } | null> {
  let cur = url;
  for (let hop = 0; hop < 5; hop++) {
    if (!(await safeHost(cur.hostname))) return null;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(cur, { redirect: "manual", signal: ctrl.signal, headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" }, cache: "no-store" });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        const next = loc ? normaliseUrl(new URL(loc, cur).toString()) : null;
        if (!next) return null;
        cur = next;
        continue;
      }
      if (!res.ok || !(res.headers.get("content-type") || "").includes("html") || !res.body) return null;
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (size < MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        size += value.length;
      }
      reader.cancel().catch(() => {});
      return { url: cur, html: new TextDecoder().decode(Buffer.concat(chunks)) };
    } catch {
      return null;
    } finally {
      clearTimeout(t);
    }
  }
  return null;
}

const decode = (s: string) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .replace(/&#39;|&rsquo;|&lsquo;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&[a-z]+;/g, " ");
const strip = (s: string) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const meta = (html: string, name: string) =>
  decode((html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)`, "i")) ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`, "i")) || [])[1] || "").trim();

function bodyText(html: string) {
  return strip(html.replace(/<(script|style|noscript|svg|template|iframe)[\s\S]*?<\/\1>/gi, " ").replace(/<(nav|footer)[\s\S]*?<\/\1>/gi, " "));
}

const KEY_PAGE = /\/(about|about-us|services?|products?|shop|store|collections|pricing|plans|menu|locations?|contact|book|appointments?|what-we-do|solutions|treatments|practice-areas)(\/|$)/i;

export async function scanSite(input: string): Promise<Signals | null> {
  const start = normaliseUrl(input);
  if (!start) return null;
  const home = await get(start);
  const base: Signals = {
    url: start.toString(), host: start.hostname.replace(/^www\./, ""), reachable: false, title: "", description: "", headings: [], text: "", pages: [],
    platform: null, ecommerce: false, prices: [], phone: false, forms: false, booking: false, video: false, app: false,
    tags: { googleTag: false, tagManager: false, metaPixel: false, tiktokPixel: false, linkedin: false }, locations: [], schemaTypes: [], socials: [],
  };
  if (!home) return base;

  // A few key pages (about, services, products, pricing, contact) say much more than a homepage alone.
  const links = [...home.html.matchAll(/<a[^>]+href=["']([^"'#]+)["']/gi)].map((m) => { try { return new URL(m[1], home.url); } catch { return null; } })
    .filter((u): u is URL => !!u && u.hostname === home.url.hostname && KEY_PAGE.test(u.pathname));
  const seen = new Set<string>([home.url.pathname]);
  const picks: URL[] = [];
  for (const u of links) {
    const key = u.pathname.replace(/\/$/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    picks.push(u);
    if (picks.length >= 4) break;
  }
  const extra = (await Promise.all(picks.map(get))).filter((p): p is { url: URL; html: string } => !!p);
  const all = [home, ...extra];
  const raw = all.map((p) => p.html).join("\n");

  const s = base;
  s.url = home.url.toString();
  s.reachable = true;
  s.title = strip((home.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").slice(0, 160);
  s.description = (meta(home.html, "description") || meta(home.html, "og:description")).slice(0, 300);
  s.headings = [...new Set(all.flatMap((p) => [...p.html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)].map((m) => strip(m[1]))))]
    .filter((h) => h.length > 2 && h.length < 140).slice(0, 30);
  s.text = all.map((p) => bodyText(p.html).slice(0, p === home ? 4000 : 2000)).join("\n---\n").slice(0, 9000);
  s.pages = extra.map((p) => ({ url: p.url.pathname, title: strip((p.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").slice(0, 100) }));

  const has = (re: RegExp) => re.test(raw);
  s.platform = has(/cdn\.shopify\.com|Shopify\.theme/) ? "Shopify" : has(/wp-content|wp-includes/) ? "WordPress" : has(/static\.wixstatic\.com|wix\.com/) ? "Wix"
    : has(/squarespace\.com|static1\.squarespace/) ? "Squarespace" : has(/webflow\.(com|io)|data-wf-site/) ? "Webflow" : has(/bigcommerce/i) ? "BigCommerce"
    : has(/godaddy|img1\.wsimg\.com/) ? "GoDaddy" : null;
  s.ecommerce = s.platform === "Shopify" || s.platform === "BigCommerce" || has(/add[ -]to[ -](cart|bag)|woocommerce|\/cart\b|checkout/i);
  s.prices = [...new Set((s.text.match(/\$\s?\d[\d,]*(?:\.\d{2})?/g) || []))].slice(0, 8);
  s.phone = has(/href=["']tel:/i);
  s.forms = has(/<form[\s>]/i);
  s.booking = has(/calendly|acuityscheduling|squareup\.com\/appointments|booksy|vagaro|mindbody|opentable|resy\.com|zocdoc|setmore|schedul(e|ing) (an|a|your) (appointment|consult)|book (now|online|an appointment)/i);
  s.video = has(/youtube\.com\/embed|player\.vimeo|<video[\s>]|wistia/i);
  s.app = has(/apps\.apple\.com|play\.google\.com\/store/i);
  s.tags = {
    googleTag: has(/googletagmanager\.com\/gtag|gtag\(/), tagManager: has(/googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]+/),
    metaPixel: has(/connect\.facebook\.net\/[^"']*fbevents|fbq\(/), tiktokPixel: has(/analytics\.tiktok\.com|ttq\.load/), linkedin: has(/snap\.licdn\.com|_linkedin_partner_id/),
  };
  s.socials = [...new Set([...raw.matchAll(/https?:\/\/(?:www\.)?(facebook|instagram|tiktok|youtube|linkedin|x|twitter)\.com\//gi)].map((m) => m[1].toLowerCase()))];

  // Structured data the site publishes about itself: business type and where it is.
  for (const m of raw.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const walk = (n: unknown): void => {
        if (Array.isArray(n)) { n.forEach(walk); return; }
        if (!n || typeof n !== "object") return;
        const o = n as Record<string, unknown>;
        const t = o["@type"];
        for (const x of Array.isArray(t) ? t : t ? [t] : []) if (typeof x === "string" && s.schemaTypes.length < 10 && !s.schemaTypes.includes(x)) s.schemaTypes.push(x);
        const a = o.address as Record<string, string> | undefined;
        if (a && typeof a === "object" && (a.addressLocality || a.addressRegion)) {
          const loc = [a.addressLocality, a.addressRegion].filter(Boolean).join(", ");
          if (loc && !s.locations.includes(loc) && s.locations.length < 6) s.locations.push(loc);
        }
        if (o["@graph"]) walk(o["@graph"]);
      };
      walk(JSON.parse(m[1]));
    } catch {}
  }
  return s;
}
