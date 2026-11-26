import { ID, SITE_URL } from "./seo";

// The explainer videos on YouTube (channel @getdspconnect). Each appears on its page and in that page's
// structured data, so search engines can show it as a video result.
export type Video = { id: string; title: string; description: string; seconds: number; poster: string; uploaded?: string };

export const VIDEOS = {
  owners: { id: "YxMDlMvTWf4", seconds: 125, poster: "/video/vsl-owners.jpg", title: "Enterprise programmatic advertising, without the enterprise contract",
    description: "How DSP Connect gives any business the same kind of buying big brands do: streaming TV, apps and websites, from a $750 ad budget, set up for you and live within 14 days." },
  agencies: { id: "NXtGfd19rnw", seconds: 94, poster: "/video/vsl-agencies.jpg", title: "Keep your clients. Earn 10% of what they spend.",
    description: "How agencies run their clients' streaming TV and programmatic advertising on DSP Connect and earn 10% of the ad spend they manage." },
  partners: { id: "R7fH73uYp6o", seconds: 104, poster: "/video/vsl-partners.jpg", title: "Become a DSP Connect Authorized Sales Partner",
    description: "How ISOs and local sales pros introduce DSP Connect to the business owners they already call on, and earn 10% of their clients' ad spend for life." },
  // How to use the free ad planner (/planner), for each audience.
  plannerOwners: { id: "r-Oz_PGezZ0", seconds: 80, poster: "/video/plan-owners.jpg", uploaded: "2026-11-25", title: "Get a free streaming TV ad plan for your business in 30 seconds",
    description: "Enter your website and get a free ad plan for streaming TV, online video, display, native and retargeting ads, split for the budget you choose, then build the campaign in your demo account." },
  plannerAgencies: { id: "N5mNVCRGbr8", seconds: 94, poster: "/video/plan-agencies.jpg", uploaded: "2026-11-25", title: "Walk into every pitch with a plan",
    description: "How agencies turn any prospect's website into a streaming TV and programmatic plan in about 30 seconds, build the campaign live in the meeting, and find room to grow with existing clients." },
  plannerPartners: { id: "7ROx5q_a6dw", seconds: 84, poster: "/video/plan-partners.jpg", uploaded: "2026-11-25", title: "Hand any business owner an ad plan in 30 seconds",
    description: "How Authorized Sales Partners use their planner link to give a business owner a streaming TV and programmatic ad plan built from their own website, credited to the partner." },
} satisfies Record<string, Video>;

/** schema.org VideoObject for a page's structured data. */
export const videoNode = (v: Video, page: string, anchor = "video") => ({
  "@type": "VideoObject", "@id": `${SITE_URL}${page}#${anchor}`, name: v.title, description: v.description,
  thumbnailUrl: [`${SITE_URL}${v.poster}`, `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`], uploadDate: v.uploaded || "2026-11-17",
  duration: `PT${Math.floor(v.seconds / 60)}M${v.seconds % 60}S`, contentUrl: `https://www.youtube.com/watch?v=${v.id}`,
  embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`, publisher: { "@id": ID.org }, inLanguage: "en-US",
  isPartOf: { "@id": `${SITE_URL}${page}#webpage` }, isFamilyFriendly: true, potentialAction: { "@type": "WatchAction", target: `https://www.youtube.com/watch?v=${v.id}` },
});
