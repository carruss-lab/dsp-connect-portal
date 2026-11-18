// Audits every public page's search and AI-answer setup against a running copy of the site.
// Usage: node scripts/audit-seo.mjs http://localhost:3000
// Checks: one JSON-LD graph per page, valid JSON, no dangling @id references, every FAQ answer visible on
// the page, canonical address, title/description lengths, Open Graph image, breadcrumb, and the org entity.
const BASE = process.argv[2] || "http://localhost:3000";
const SITE = "https://getdspconnect.com";

const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, "") || "/");

const text = (html) => html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&").replace(/&#x27;|&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
const norm = (s) => s.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();

let problems = 0;
const report = [];
for (const p of paths) {
  const res = await fetch(BASE + p);
  const html = await res.text();
  const issues = [];
  if (res.status !== 200) issues.push(`HTTP ${res.status}`);
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (blocks.length !== 1) issues.push(`${blocks.length} JSON-LD blocks (want 1)`);
  let graph = [];
  for (const b of blocks) { try { const j = JSON.parse(b); graph.push(...(j["@graph"] || [j])); } catch { issues.push("JSON-LD does not parse"); } }
  const ids = new Set();
  const collect = (v) => { if (Array.isArray(v)) v.forEach(collect); else if (v && typeof v === "object") { if (v["@id"] && Object.keys(v).length > 1) ids.add(v["@id"]); Object.values(v).forEach(collect); } };
  graph.forEach(collect);
  const refs = new Set();
  const walk = (v, top) => { if (Array.isArray(v)) v.forEach((x) => walk(x)); else if (v && typeof v === "object") { if (!top && v["@id"] && Object.keys(v).length === 1) refs.add(v["@id"]); Object.values(v).forEach((x) => walk(x)); } };
  graph.forEach((n) => walk(n, true));
  for (const r of refs) if (!ids.has(r)) issues.push(`dangling @id ${r}`);
  const types = graph.map((n) => [].concat(n["@type"]).join("/"));
  for (const need of ["Organization", "WebSite"]) if (!types.includes(need)) issues.push(`no ${need}`);
  const page = graph.find((n) => /Page$/.test([].concat(n["@type"])[0]) && n["@type"] !== "FAQPage");
  if (!page) issues.push("no WebPage node");
  else {
    if (page.url !== SITE + (p === "/" ? "/" : p)) issues.push(`WebPage url ${page.url}`);
    if (p !== "/" && !graph.some((n) => n["@type"] === "BreadcrumbList")) issues.push("no breadcrumb");
    if (!page.dateModified) issues.push("no dateModified");
  }
  const org = graph.find((n) => n["@type"] === "Organization");
  if (org && !(org.sameAs || []).length) issues.push("org has no sameAs");
  const body = norm(text(html));
  for (const f of graph.filter((n) => n["@type"] === "FAQPage")) for (const q of f.mainEntity || []) {
    if (!body.includes(norm(q.name))) issues.push(`FAQ question not visible: ${q.name.slice(0, 50)}`);
    if (!body.includes(norm(q.acceptedAnswer.text).slice(0, 80))) issues.push(`FAQ answer not visible: ${q.name.slice(0, 50)}`);
  }
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
  const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || "";
  if (!title) issues.push("no title"); else if (title.length > 70 && p !== "/") issues.push(`title ${title.length} chars`);
  if (!desc) issues.push("no description"); else if (desc.length < 70 || desc.length > 165) issues.push(`description ${desc.length} chars`);
  if (canon !== SITE + (p === "/" ? "" : p) && canon !== SITE + p) issues.push(`canonical ${canon}`);
  if (!/property="og:image"/.test(html)) issues.push("no og:image");
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) issues.push(`${(html.match(/<h1[\s>]/g) || []).length} h1`);
  problems += issues.length;
  report.push(`${issues.length ? "✗" : "✓"} ${p}  [${types.join(", ")}]${issues.length ? "\n    - " + issues.join("\n    - ") : ""}`);
}
console.log(report.join("\n"));
console.log(`\n${paths.length} pages, ${problems} issues`);
process.exit(problems ? 1 : 0);
