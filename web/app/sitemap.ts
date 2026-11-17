import type { MetadataRoute } from "next";
import { COMPARISONS } from "@/lib/compare";
import { INDUSTRY_PAGES } from "@/lib/industries";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number) => ({ url: SITE_URL + path, changeFrequency: "monthly" as const, priority });
  return [page("/", 1), page("/open-account", 0.9), page("/agencies", 0.8), page("/partners", 0.6), page("/compare", 0.7), page("/industries", 0.8), ...INDUSTRY_PAGES.map((i) => page("/industries/" + i.slug, 0.8)), page("/terms", 0.3), page("/refunds", 0.3), page("/privacy", 0.3), ...COMPARISONS.map((c) => page("/" + c.slug, 0.7))];
}
