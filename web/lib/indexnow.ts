// IndexNow tells Bing (which powers ChatGPT search and Copilot), Yandex, Seznam and Naver that pages changed,
// so they recrawl within hours instead of weeks. The key is public by design: it is served at /<key>.txt.
import sitemap from "@/app/sitemap";
import { SITE_URL } from "./seo";
import { SITE_UPDATED, businessToday } from "./site";

export const INDEXNOW_KEY = "6a42565617ce75783b3304f8d67b14df";

/** Submits every page in the sitemap. Runs from the daily job, but only in the two days after SITE_UPDATED changes. */
export async function indexNowIfChanged(): Promise<string | null> {
  const days = (Date.parse(businessToday()) - Date.parse(SITE_UPDATED)) / 86400000;
  if (days < 0 || days > 1) return null;
  const urls = [...sitemap().map((p) => p.url), `${SITE_URL}/llms.txt`, `${SITE_URL}/llms-full.txt`];
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(SITE_URL).host, key: INDEXNOW_KEY, keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`, urlList: urls }),
  });
  return `IndexNow: ${urls.length} pages submitted (HTTP ${res.status})`;
}
