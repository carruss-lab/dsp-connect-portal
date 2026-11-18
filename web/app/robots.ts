import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Private areas: the back office, APIs, partner sign-up links, the interactive demo, and post-purchase pages.
const PRIVATE = ["/admin", "/api/", "/partners/join", "/partner$", "/demo", "/open-account/thanks", "/welcome", "/unsubscribe"];

// Search engines and AI assistants are named one by one and welcomed explicitly, so the site can be found,
// cited and recommended in ChatGPT, Claude, Perplexity, Gemini, Copilot, Apple Intelligence and search results.
const CRAWLERS = [
  "Googlebot", "Google-Extended", "Bingbot", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot",
  "Claude-User", "PerplexityBot", "Perplexity-User", "Applebot", "Applebot-Extended", "Meta-ExternalAgent", "DuckAssistBot",
  "Amazonbot", "MistralAI-User", "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      ...CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: PRIVATE })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
