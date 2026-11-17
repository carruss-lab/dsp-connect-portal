import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/partners/join", "/partner$", "/demo", "/open-account/thanks", "/welcome", "/unsubscribe"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
