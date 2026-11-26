import type { MetadataRoute } from "next";
import { COMPARISONS } from "@/lib/compare";
import { INDUSTRY_PAGES } from "@/lib/industries";
import { SITE_URL } from "@/lib/seo";
import { LEGAL_UPDATED, SITE_UPDATED as UPDATED } from "@/lib/site";
import { VIDEOS, type Video } from "@/lib/videos";
import { SECTIONS, getLibrary, isLive } from "@/lib/videoLibrary";

// When the pages last changed (set in lib/site.ts); legal pages follow the date shown on them.
const SITE_UPDATED = new Date(UPDATED);
const LEGAL = new Date(LEGAL_UPDATED);

// The explainer video on a page, as a video sitemap entry (search engines can show the page as a video result).
const video = (v: Video): NonNullable<MetadataRoute.Sitemap[number]["videos"]>[number] => ({
  title: v.title, description: v.description, thumbnail_loc: SITE_URL + v.poster,
  player_loc: `https://www.youtube-nocookie.com/embed/${v.id}`, duration: v.seconds, publication_date: "2026-11-17",
});

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lib = await getLibrary();
  const live = SECTIONS.flatMap((s) => lib[s.id]).filter((v) => isLive(v));
  const newest = new Date(Math.max(...live.map((v) => +new Date(v.published))));
  const page = (path: string, priority: number, extra: Partial<MetadataRoute.Sitemap[number]> = {}) =>
    ({ url: SITE_URL + path, lastModified: SITE_UPDATED, changeFrequency: "monthly" as const, priority, ...extra });
  return [
    page("/", 1, { videos: [video(VIDEOS.owners)] }),
    page("/open-account", 0.9),
    page("/planner", 0.8),
    page("/about", 0.7),
    page("/agencies", 0.8, { videos: [video(VIDEOS.agencies)] }),
    page("/partners", 0.6, { videos: [video(VIDEOS.partners)] }),
    page("/compare", 0.7),
    page("/videos", 0.8, { lastModified: newest, changeFrequency: "daily", videos: live.map((v) => ({
      title: v.title, description: (v.summary || v.title).slice(0, 2048), thumbnail_loc: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
      player_loc: `https://www.youtube-nocookie.com/embed/${v.id}`, ...(v.seconds ? { duration: v.seconds } : {}), publication_date: v.published,
    })) }),
    page("/industries", 0.8),
    ...INDUSTRY_PAGES.map((i) => page("/industries/" + i.slug, 0.8)),
    ...COMPARISONS.map((c) => page("/" + c.slug, 0.7)),
    page("/terms", 0.3, { lastModified: LEGAL }),
    page("/refunds", 0.3, { lastModified: LEGAL }),
    page("/privacy", 0.3, { lastModified: LEGAL }),
  ];
}
