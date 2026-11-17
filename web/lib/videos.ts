import { ID, SITE_URL } from "./seo";

// The explainer videos on YouTube (channel @getdspconnect). Each appears on its page and in that page's
// structured data, so search engines can show it as a video result.
export type Video = { id: string; title: string; description: string; seconds: number; poster: string };

export const VIDEOS = {
  owners: { id: "YxMDlMvTWf4", seconds: 125, poster: "/video/vsl-owners.jpg", title: "Enterprise programmatic advertising, without the enterprise contract",
    description: "How DSP Connect gives any business the same kind of buying big brands do: streaming TV, apps and websites, from a $750 ad budget, set up for you and live within 14 days." },
  agencies: { id: "NXtGfd19rnw", seconds: 94, poster: "/video/vsl-agencies.jpg", title: "Keep your clients. Earn 10% of what they spend.",
    description: "How agencies run their clients' streaming TV and programmatic advertising on DSP Connect and earn 10% of the ad spend they manage." },
  partners: { id: "R7fH73uYp6o", seconds: 104, poster: "/video/vsl-partners.jpg", title: "Become a DSP Connect Authorized Sales Partner",
    description: "How ISOs and local sales pros introduce DSP Connect to the business owners they already call on, and earn 10% of their clients' ad spend for life." },
} satisfies Record<string, Video>;

/** schema.org VideoObject for a page's structured data. */
export const videoNode = (v: Video, page: string) => ({
  "@type": "VideoObject", "@id": `${SITE_URL}${page}#video`, name: v.title, description: v.description,
  thumbnailUrl: [`${SITE_URL}${v.poster}`, `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`], uploadDate: "2026-11-17",
  duration: `PT${Math.floor(v.seconds / 60)}M${v.seconds % 60}S`, contentUrl: `https://www.youtube.com/watch?v=${v.id}`,
  embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`, publisher: { "@id": ID.org }, inLanguage: "en-US",
});
