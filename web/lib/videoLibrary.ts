import LIBRARY from "./video-library.json";
import { ID, SITE_URL } from "./seo";

// ─── The video library at /videos ────────────────────────────────────────────────────────────────
// Every public video on the DSP Connect YouTube channel (@getdspconnect), embedded on the page.
// Videos we made carry their transcript, key points and chapters (lib/video-library.json, generated
// from the video scripts). New uploads appear by themselves: the page reads the channel's and each
// playlist's public YouTube feed about once an hour, and adds any video it does not know yet.

export const CHANNEL_ID = "UCYuwOdcS5rS17WtQZRqBFug";
export const CHANNEL_URL = "https://www.youtube.com/@getdspconnect";
export const SUBSCRIBE_URL = `${CHANNEL_URL}?sub_confirmation=1`;
/** Videos published before this are the channel's older archive, which is not listed on the page. */
const LIBRARY_START = "2026-11-17";

export type SectionId = "new" | "start" | "howto" | "music" | "books" | "ecommerce" | "creators" | "events";
export type Section = { id: SectionId; title: string; intro: string; playlist?: string; ordered?: boolean };

export const SECTIONS: Section[] = [
  { id: "new", title: "Newest videos", intro: "The latest uploads to the channel." },
  { id: "start", title: "Start here", intro: "Watch these first, in this order: what DSP Connect is, and who it is for.", playlist: "PLPOEmT7ASyJI", ordered: true },
  { id: "howto", title: "How to use DSP Connect", intro: "A tour of the account, then how a campaign is planned, built, tracked and improved. Watch in order.", playlist: "PL1VGtxjDfdjG2NzKvuak3G2BPEcJtCPG3", ordered: true },
  { id: "music", title: "Music marketing for independent artists", intro: "Promote releases, shows, streams and merch to real listeners on streaming TV, apps and websites.", playlist: "PLYgUzEv4yf4I" },
  { id: "books", title: "Book marketing for authors", intro: "Reach readers by genre and interest beyond Amazon search and social feeds.", playlist: "PLCQIAo03_Cy0" },
  { id: "ecommerce", title: "Shopify and ecommerce ads", intro: "Sell beyond Meta and TikTok: streaming TV, apps, websites and retargeting, with sales tracked by source.", playlist: "PLRIkKjWV3Fqc" },
  { id: "creators", title: "Creator and UGC growth", intro: "Grow a channel or audience you own, and help brands run UGC where it reaches people.", playlist: "PLGf2IaX7sOkM" },
  { id: "events", title: "Events and podcasts", intro: "Fill rooms and grow listeners in the places your audience actually is.", playlist: "PLUmbH2AnK24w" },
];

export type LibraryVideo = {
  key: string; id: string; title: string; section: SectionId; published: string; seconds?: number;
  summary: string; points: string[]; chapters: [number, string][]; transcript?: string;
};

const CURATED = LIBRARY as LibraryVideo[];

// ─── YouTube's public feeds (no key needed; the newest 15 videos of a channel or playlist) ─────────
type FeedItem = { id: string; title: string; published: string; description: string };

const unescape = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

async function feed(param: string): Promise<FeedItem[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?${param}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const xml = await res.text();
    return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
      id: (e.match(/<yt:videoId>([^<]+)/) || [])[1] || "",
      title: unescape((e.match(/<title>([^<]*)/) || [])[1] || ""),
      published: (e.match(/<published>([^<]+)/) || [])[1] || "",
      description: unescape((e.match(/<media:description>([\s\S]*?)<\/media:description>/) || [])[1] || ""),
    })).filter((x) => x.id && x.title);
  } catch {
    return []; // YouTube unreachable: the page still shows every video it already knows
  }
}

/** Chapters and a one-paragraph summary from a YouTube description. */
function fromDescription(d: string) {
  const summary = d.split(/\n\s*\n/)[0].replace(/\s+/g, " ").trim().slice(0, 320);
  const chapters: [number, string][] = [];
  for (const m of d.matchAll(/^(?:(\d+):)?(\d{1,2}):(\d\d)\s+(.+)$/gm)) {
    chapters.push([(+(m[1] || 0)) * 3600 + +m[2] * 60 + +m[3], m[4].trim()]);
  }
  return { summary, chapters: chapters.length >= 2 && chapters[0][0] === 0 ? chapters : [] };
}

/** The whole library: our curated videos, plus anything new the channel has published since. */
export async function getLibrary(): Promise<Record<SectionId, LibraryVideo[]>> {
  const known = new Set(CURATED.map((v) => v.id));
  const lists = await Promise.all([
    feed(`channel_id=${CHANNEL_ID}`),
    ...SECTIONS.filter((s) => s.playlist).map((s) => feed(`playlist_id=${s.playlist}`).then((items) => ({ s, items }))),
  ]);
  const [channel, ...playlists] = lists as [FeedItem[], ...{ s: Section; items: FeedItem[] }[]];
  const added = new Map<string, LibraryVideo>();
  const add = (it: FeedItem, section: SectionId) => {
    if (known.has(it.id) || it.published.slice(0, 10) < LIBRARY_START) return;
    const prev = added.get(it.id);
    if (prev && prev.section !== "new") return; // a playlist placement wins over "newest"
    added.set(it.id, { key: it.id, id: it.id, title: it.title, section, published: it.published, ...fromDescription(it.description), points: [] });
  };
  for (const { s, items } of playlists) for (const it of items) add(it, s.id);
  for (const it of channel) add(it, "new");

  const out = Object.fromEntries(SECTIONS.map((s) => [s.id, [] as LibraryVideo[]])) as Record<SectionId, LibraryVideo[]>;
  for (const v of [...CURATED, ...added.values()]) out[v.section].push(v);
  for (const s of SECTIONS) {
    if (!s.ordered) out[s.id].sort((a, b) => (s.id === "new" ? b.published.localeCompare(a.published) : a.published.localeCompare(b.published)));
  }
  return out;
}

/** The library plus the moment it was read, so a page decides once which premieres have gone live. */
export async function librarySnapshot() {
  const lib = await getLibrary();
  return { lib, now: Date.now() };
}

// ─── Formatting and structured data ──────────────────────────────────────────────────────────────
export const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
export const isoDuration = (s: number) => `PT${Math.floor(s / 60)}M${Math.round(s % 60)}S`;
export const isLive = (v: LibraryVideo, now = Date.now()) => +new Date(v.published) <= now;
export const premiereLabel = (v: LibraryVideo, lang: "en" | "es" = "en") =>
  new Date(v.published).toLocaleString(lang === "es" ? "es-US" : "en-US", { timeZone: "America/Phoenix", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) + (lang === "es" ? ", hora de Arizona" : " Arizona time");

/** Section titles and intros in Spanish (the videos themselves are in English until the Spanish versions are out). */
export const SECTIONS_ES: Record<SectionId, { title: string; intro: string }> = {
  new: { title: "Videos más recientes", intro: "Lo último que subimos al canal." },
  start: { title: "Empiece aquí", intro: "Vea estos primero, en este orden: qué es DSP Connect y para quién es." },
  howto: { title: "Cómo usar DSP Connect", intro: "Un recorrido por la cuenta y luego cómo se planea, se crea, se mide y se mejora una campaña. Véalos en orden." },
  music: { title: "Marketing musical para artistas independientes", intro: "Promueva lanzamientos, conciertos, reproducciones y mercancía ante oyentes reales en TV por streaming, apps y sitios web." },
  books: { title: "Marketing de libros para autores", intro: "Llegue a lectores por género e interés, más allá de la búsqueda de Amazon y las redes sociales." },
  ecommerce: { title: "Anuncios para Shopify y tiendas en línea", intro: "Venda más allá de Meta y TikTok: TV por streaming, apps, sitios web y retargeting, con las ventas medidas por fuente." },
  creators: { title: "Crecimiento para creadores y UGC", intro: "Haga crecer un canal o una audiencia propia, y ayude a las marcas a mostrar UGC donde llega a la gente." },
  events: { title: "Eventos y podcasts", intro: "Llene salones y gane oyentes en los lugares donde realmente está su audiencia." },
};
export const watchUrl = (id: string, t = 0) => `https://www.youtube.com/watch?v=${id}${t ? `&t=${t}s` : ""}`;
export const anchor = (v: LibraryVideo) => `v-${v.key}`;

/** schema.org VideoObject for one video in the library, with chapters as Clips and the transcript. */
export function libraryVideoNode(v: LibraryVideo, page = "/videos") {
  const node: Record<string, unknown> = {
    "@type": "VideoObject", "@id": `${SITE_URL}${page}#${anchor(v)}`, name: v.title, description: v.summary || v.title,
    thumbnailUrl: [`https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`, `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`],
    uploadDate: v.published, contentUrl: watchUrl(v.id), embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
    url: `${SITE_URL}${page}#${anchor(v)}`, inLanguage: "en-US", isFamilyFriendly: true,
    publisher: { "@id": ID.org }, creator: { "@id": ID.org }, isPartOf: { "@id": `${SITE_URL}${page}#webpage` },
    potentialAction: { "@type": "WatchAction", target: watchUrl(v.id) },
  };
  if (v.seconds) node.duration = isoDuration(v.seconds);
  if (v.transcript) node.transcript = v.transcript;
  if (v.points.length) node.abstract = v.points.join(". ") + ".";
  if (v.chapters.length > 1) {
    node.hasPart = v.chapters.map(([t, name], i) => {
      const end = v.chapters[i + 1]?.[0] ?? v.seconds;
      return { "@type": "Clip", name, startOffset: t, ...(end ? { endOffset: end } : {}), url: watchUrl(v.id, t) };
    });
  }
  return node;
}
