import type { MetadataRoute } from "next";
import { COMPARISONS } from "@/lib/compare";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number) => ({ url: SITE_URL + path, changeFrequency: "monthly" as const, priority });
  return [page("/", 1), page("/open-account", 0.9), page("/agencies", 0.8), page("/compare", 0.7), ...COMPARISONS.map((c) => page("/" + c.slug, 0.7))];
}
