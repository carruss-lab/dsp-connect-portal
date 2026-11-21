// IndexNow tells Bing (which powers ChatGPT search and Copilot), Yandex, Seznam and Naver that pages changed,
// so they recrawl within hours instead of weeks. The key is public by design: it is served at /<key>.txt.
import sitemap from "@/app/sitemap";
import { SITE_URL } from "./seo";
import { SECTIONS, getLibrary } from "./videoLibrary";
import { SITE_UPDATED, businessToday } from "./site";

export const INDEXNOW_KEY = "6a42565617ce75783b3304f8d67b14df";

/** Submits every page in the sitemap. Runs from the daily job, but only in the two days after SITE_UPDATED changes. */
export async function indexNowIfChanged(): Promise<string | null> {
  const days = (Date.parse(businessToday()) - Date.parse(SITE_UPDATED)) / 86400000;
  // A video that premiered in the last day also counts as a change to /videos.
  const lib = await getLibrary();
  const fresh = SECTIONS.flatMap((s) => lib[s.id]).some((v) => { const age = Date.now() - +new Date(v.published); return age >= 0 && age < 26 * 3600000; });
  const siteChanged = days >= 0 && days <= 1;
  if (!siteChanged && !fresh) return null;
  const urls = siteChanged
    ? [...(await sitemap()).map((p) => p.url), `${SITE_URL}/llms.txt`, `${SITE_URL}/llms-full.txt`]
    : [`${SITE_URL}/videos`, `${SITE_URL}/sitemap.xml`];
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(SITE_URL).host, key: INDEXNOW_KEY, keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`, urlList: urls }),
  });
  return `IndexNow: ${urls.length} pages submitted (HTTP ${res.status})`;
}
