import type { MetadataRoute } from "next";
import { COMPARISONS } from "@/lib/compare";
import { INDUSTRY_PAGES } from "@/lib/industries";
import { SITE_URL } from "@/lib/seo";
import { localePath } from "@/lib/i18n";
import { LEGAL_UPDATED, SITE_UPDATED as UPDATED } from "@/lib/site";
import { VIDEOS, forLang, type Video } from "@/lib/videos";
import { SECTIONS, getLibrary, isLive } from "@/lib/videoLibrary";

// When the pages last changed (set in lib/site.ts); legal pages follow the date shown on them.
const SITE_UPDATED = new Date(UPDATED);
const LEGAL = new Date(LEGAL_UPDATED);

// The explainer video on a page, as a video sitemap entry (search engines can show the page as a video result).
const video = (src: Video, lang: "en" | "es" = "en"): NonNullable<MetadataRoute.Sitemap[number]["videos"]>[number] => {
  const v = forLang(src, lang);
  return { title: v.title, description: v.description, thumbnail_loc: SITE_URL + v.poster,
    player_loc: `https://www.youtube-nocookie.com/embed/${v.id}`, duration: v.seconds, publication_date: v.uploaded || "2026-11-17" };
};

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lib = await getLibrary();
  const live = SECTIONS.flatMap((s) => lib[s.id]).filter((v) => isLive(v));
  const newest = new Date(Math.max(...live.map((v) => +new Date(v.published))));
  // Every public page in English and in Spanish, each naming the other, so search engines show the right one.
  const page = (path: string, priority: number, extra: Partial<MetadataRoute.Sitemap[number]> = {}, esVideos?: MetadataRoute.Sitemap[number]["videos"]) => {
    const languages = { en: SITE_URL + localePath(path, "en"), es: SITE_URL + localePath(path, "es") };
    const base = { lastModified: SITE_UPDATED, changeFrequency: "monthly" as const, priority, alternates: { languages }, ...extra };
    // The Spanish page lists the Spanish recordings of its videos (passed as esVideos); the /videos library is English only.
    const { videos, ...rest } = base as typeof base & { videos?: unknown };
    void videos;
    return [{ url: languages.en, ...base }, { url: languages.es, ...rest, ...(esVideos ? { videos: esVideos } : {}) }];
  };
  return ([
    page("/", 1, { videos: [video(VIDEOS.owners), video(VIDEOS.plannerOwners)] }, [video(VIDEOS.owners, "es"), video(VIDEOS.plannerOwners, "es")]),
    page("/open-account", 0.9),
    page("/planner", 0.8, { videos: [video(VIDEOS.plannerOwners)] }, [video(VIDEOS.plannerOwners, "es")]),
    page("/about", 0.7),
    page("/agencies", 0.8, { videos: [video(VIDEOS.agencies), video(VIDEOS.plannerAgencies)] }, [video(VIDEOS.agencies, "es"), video(VIDEOS.plannerAgencies, "es")]),
    page("/partners", 0.6, { videos: [video(VIDEOS.partners), video(VIDEOS.plannerPartners)] }, [video(VIDEOS.partners, "es"), video(VIDEOS.plannerPartners, "es")]),
    page("/compare", 0.7),
    page("/videos", 0.8, { lastModified: newest, changeFrequency: "daily", videos: live.map((v) => ({
      title: v.title, description: (v.summary || v.title).slice(0, 2048), thumbnail_loc: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
      player_loc: `https://www.youtube-nocookie.com/embed/${v.id}`, ...(v.seconds ? { duration: v.seconds } : {}), publication_date: v.published,
    })) }),
    page("/industries", 0.8),
    ...INDUSTRY_PAGES.flatMap((i) => page("/industries/" + i.slug, 0.8)),
    ...COMPARISONS.flatMap((c) => page("/" + c.slug, 0.7)),
    page("/terms", 0.3, { lastModified: LEGAL }),
    page("/refunds", 0.3, { lastModified: LEGAL }),
    page("/privacy", 0.3, { lastModified: LEGAL }),
  ] as MetadataRoute.Sitemap[]).flat();
}
