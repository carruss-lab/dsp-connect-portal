// Sample data for the demo account. Everything here is invented and fixed per industry and area, so a visitor
// sees the same numbers each time. Labels, columns and options follow the client platform exactly.

/** SSP endpoints offered on the campaign builder's Traffic source step, in the platform's order. Test and placeholder
 *  endpoints from the platform's sandbox are left out. Labels match the platform's label filter. */
export const SSP_ENDPOINTS: { name: string; labels: ("Native" | "CPM")[] }[] = [
  { name: "AdColony", labels: ["CPM"] },
  { name: "AdKernel", labels: ["CPM"] },
  { name: "AdMixer", labels: ["CPM"] },
  { name: "Adinmo Banner", labels: [] },
  { name: "Adinmo Video", labels: [] },
  { name: "AdsTerra", labels: [] },
  { name: "Appnexus", labels: ["CPM"] },
  { name: "ContentIgnite", labels: ["Native"] },
  { name: "Dochase", labels: [] },
  { name: "DoubleClick", labels: ["CPM"] },
  { name: "Google", labels: ["CPM"] },
  { name: "Intellectscoop Media", labels: [] },
  { name: "JeengDisplay", labels: ["Native"] },
  { name: "OpenX", labels: ["CPM"] },
  { name: "PropellerAds", labels: [] },
  { name: "Pubmatic", labels: ["CPM"] },
  { name: "Rain Pop", labels: [] },
  { name: "SmartyAds", labels: ["CPM"] },
  { name: "Verve_Display_Inapp", labels: [] },
  { name: "Verve_Video_Inapp", labels: [] },
];
export const SSP_LABELS = ["Native", "CPM"] as const;

export const GROUP_BY = [
  "Date", "Campaign", "Creative", "Media type", "Audience", "SSP", "SSP Endpoint", "App Bundle", "Site URL", "Site ID", "Country",
  "Language", "Size", "Browser", "OS", "OS version", "Device type", "Device make", "Device model", "Device HWV", "Rewarded",
  "Interstitial", "Placement ID", "Publisher ID", "Carrier", "Ad Format", "Timezone", "Connection type", "Budget", "Partner Ref",
] as const;
export type Dim = (typeof GROUP_BY)[number];

export const DATE_PRESETS = ["Today", "Yesterday", "Last 7 days", "Last 30 days", "This month", "Last month", "Custom range"] as const;

// ---------- deterministic randomness ----------
function seedOf(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
function rng(seed: number) {
  let a = seed || 1;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- formatting, as the platform shows it ----------
export const n = (v: number) => Math.round(v).toLocaleString("en-US");
export const usd = (v: number) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const pct = (v: number) => (Number.isFinite(v) ? (v * 100).toFixed(2) : "0.00") + "%";
export const dmy = (d: Date) => `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;

export type Row = { imp: number; clicks: number; conv: number; spend: number; bids: number; wins: number; q1: number; q2: number; q3: number; q4: number; video: boolean };
export const blank = (video = false): Row => ({ imp: 0, clicks: 0, conv: 0, spend: 0, bids: 0, wins: 0, q1: 0, q2: 0, q3: 0, q4: 0, video });
export const add = (a: Row, b: Row): Row => ({
  imp: a.imp + b.imp, clicks: a.clicks + b.clicks, conv: a.conv + b.conv, spend: a.spend + b.spend, bids: a.bids + b.bids, wins: a.wins + b.wins,
  q1: a.q1 + b.q1, q2: a.q2 + b.q2, q3: a.q3 + b.q3, q4: a.q4 + b.q4, video: a.video || b.video,
});

export type Campaign = {
  id: number; name: string; status: "Active" | "Inactive"; format: "Banner" | "Video" | "Native"; goal: string; budget: number; folder: string;
  device: string; ctr: number; cpm: number; cvr: number; share: number; days: Row[]; tot: Row; audience: string; created: Date;
};

export function account(industry: string, market: string, today = new Date()) {
  const r = rng(seedOf(`${industry}|${market}`));
  const jitter = (spread: number) => 1 + (r() - 0.5) * 2 * spread;
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1); // data runs to yesterday
  const LEN = 62; // two months of history, so every date preset has data
  const dates = Array.from({ length: LEN }, (_, i) => new Date(end.getFullYear(), end.getMonth(), end.getDate() - (LEN - 1) + i));
  const short = industry === "Local" ? "Local" : industry;
  const city = market === "your area" ? "Local area" : market;

  const plan: Omit<Campaign, "days" | "tot" | "created" | "budget">[] = [
    { id: 10412, name: `${short} | ${city} | CTV Video | Prospecting`, status: "Active", format: "Video", goal: "Awareness", folder: short, device: "Connected TV", ctr: 0.0019, cpm: 21.4, cvr: 0.05, share: 0.21, audience: `${city} · Adults 25-64` },
    { id: 10413, name: `${short} | ${city} | Banner | Retargeting`, status: "Active", format: "Banner", goal: "Conversions", folder: short, device: "Mobile", ctr: 0.0071, cpm: 3.9, cvr: 0.083, share: 0.27, audience: "Website visitors · 30 days" },
    { id: 10414, name: `${short} | ${city} | Native | Prospecting`, status: "Active", format: "Native", goal: "Website visits", folder: short, device: "Mobile", ctr: 0.0042, cpm: 2.8, cvr: 0.041, share: 0.31, audience: `${short} intent · ${city}` },
    { id: 10409, name: `${short} | ${city} | Video | Mobile`, status: "Inactive", format: "Video", goal: "Website visits", folder: short, device: "Mobile", ctr: 0.0034, cpm: 9.6, cvr: 0.036, share: 0.21, audience: `${city} · Adults 25-64` },
  ];
  // Daily impressions for the whole account: a rising trend with a weekend dip.
  const base = 52000 * jitter(0.15);
  const curve = dates.map((d, i) => base * (0.78 + i * 0.0065) * (d.getDay() === 0 || d.getDay() === 6 ? 0.86 : 1) * jitter(0.06));

  const campaigns: Campaign[] = plan.map((c, ci) => {
    const off = c.status === "Inactive" ? LEN - 5 : 0; // the paused campaign stopped five days ago
    const days = curve.map((dayImp, i) => {
      if (c.status === "Inactive" && i >= off) return blank(c.format === "Video");
      const imp = Math.round(dayImp * c.share * jitter(0.08));
      const clicks = Math.round(imp * c.ctr * jitter(0.18));
      const conv = Math.round(clicks * c.cvr * jitter(0.35) + (r() < 0.3 ? 1 : 0));
      const spend = (imp / 1000) * c.cpm * jitter(0.05);
      const wins = imp * jitter(0.01) * 1.04;
      const bids = wins / (0.18 + r() * 0.12);
      const video = c.format === "Video";
      const vcr = c.device === "Connected TV" ? 0.94 : 0.71;
      return {
        imp, clicks, conv, spend, bids, wins, video,
        q1: video ? imp * (0.97 - (1 - vcr) * 0.25) : 0, q2: video ? imp * (0.97 - (1 - vcr) * 0.55) : 0,
        q3: video ? imp * (0.97 - (1 - vcr) * 0.8) : 0, q4: video ? imp * vcr * jitter(0.02) : 0,
      };
    });
    const created = new Date(dates[0].getFullYear(), dates[0].getMonth(), dates[0].getDate() - 3 - ci);
    const tot = days.reduce(add, blank(c.format === "Video"));
    return { ...c, days, tot, created, budget: Math.ceil((tot.spend * (1.25 + r() * 0.3)) / 500) * 500 };
  });

  const daily = dates.map((d, i) => ({ date: d, row: campaigns.reduce((a, c) => add(a, c.days[i]), blank()) }));
  const tot = campaigns.reduce((a, c) => add(a, c.tot), blank());
  const funded = Math.ceil((tot.spend + 1600 + r() * 400) / 250) * 250; // deposits so far; the rest is the balance

  /** Splits a campaign-level total across sample values for any Group by dimension. */
  const VALUES: Partial<Record<Dim, (c: Campaign) => [string, number][]>> = {
    "SSP": (c) => (c.format === "Video" ? [["Pubmatic", 0.31], ["OpenX", 0.24], ["Google", 0.19], ["Verve", 0.14], ["AdColony", 0.12]] : [["Google", 0.28], ["Pubmatic", 0.22], ["Appnexus", 0.17], ["OpenX", 0.14], ["SmartyAds", 0.1], ["AdKernel", 0.09]]),
    "SSP Endpoint": (c) => (c.format === "Video" ? [["Pubmatic", 0.31], ["OpenX", 0.24], ["Google", 0.19], ["Verve_Video_Inapp", 0.14], ["Adinmo Video", 0.12]] : c.format === "Native" ? [["ContentIgnite", 0.26], ["JeengDisplay", 0.21], ["Google", 0.2], ["Pubmatic", 0.18], ["AdMixer", 0.15]] : [["Google", 0.27], ["DoubleClick", 0.18], ["Appnexus", 0.17], ["Pubmatic", 0.15], ["Verve_Display_Inapp", 0.13], ["SmartyAds", 0.1]]),
    "App Bundle": (c) => (c.device === "Connected TV" ? [["tv.streamhub.live", 0.24], ["com.freecast.tvapp", 0.21], ["tv.localnews24.ctv", 0.19], ["com.cinemaplus.stream", 0.2], ["tv.sportsreplay.app", 0.16]] : [["com.dailyforecast.radar", 0.22], ["com.citynews.reader", 0.19], ["com.puzzlequest.free", 0.17], ["com.recipebox.cook", 0.15], ["com.wordstack.game", 0.14], ["com.fitstep.tracker", 0.13]]),
    "Site URL": () => [["localnewsdaily.com", 0.23], ["weatherwatchnow.com", 0.19], ["homeandgardenhub.com", 0.16], ["cityguideonline.com", 0.15], ["dailyrecipes.net", 0.14], ["sportsscoreboard.net", 0.13]],
    "Site ID": () => [["4412087", 0.27], ["3390154", 0.24], ["5120773", 0.2], ["2875519", 0.16], ["6043298", 0.13]],
    "Publisher ID": () => [["pub-48812", 0.29], ["pub-30177", 0.23], ["pub-55109", 0.19], ["pub-21964", 0.16], ["pub-60413", 0.13]],
    "Placement ID": () => [["pl_hero_top", 0.31], ["pl_article_mid", 0.27], ["pl_feed_3", 0.23], ["pl_footer", 0.19]],
    "Country": () => [["USA", 1]],
    "Language": () => [["en", 0.93], ["es", 0.07]],
    "Size": (c) => (c.format === "Banner" ? [["300x250", 0.46], ["320x50", 0.31], ["728x90", 0.15], ["160x600", 0.08]] : c.format === "Video" ? [["1920x1080", 0.62], ["1280x720", 0.38]] : [["1200x627", 0.71], ["600x600", 0.29]]),
    "Browser": (c) => (c.device === "Connected TV" ? [["Other", 1]] : [["Chrome", 0.48], ["Safari", 0.39], ["Samsung Internet", 0.08], ["Firefox", 0.05]]),
    "OS": (c) => (c.device === "Connected TV" ? [["Roku OS", 0.41], ["Tizen", 0.24], ["Fire OS", 0.21], ["webOS", 0.14]] : [["iOS", 0.55], ["Android", 0.45]]),
    "OS version": (c) => (c.device === "Connected TV" ? [["13.0", 0.42], ["12.5", 0.33], ["11.5", 0.25]] : [["18.1", 0.31], ["17.6", 0.24], ["15", 0.25], ["14", 0.2]]),
    "Device type": (c) => [[c.device === "Connected TV" ? "Connected TV" : "Mobile", c.device === "Connected TV" ? 1 : 0.86], ...(c.device === "Connected TV" ? [] : [["Tablet", 0.09], ["Desktop", 0.05]] as [string, number][])],
    "Device make": (c) => (c.device === "Connected TV" ? [["Roku", 0.41], ["Samsung", 0.24], ["Amazon", 0.21], ["LG", 0.14]] : [["Apple", 0.55], ["Samsung", 0.29], ["Google", 0.09], ["Motorola", 0.07]]),
    "Device model": (c) => (c.device === "Connected TV" ? [["Roku Ultra", 0.23], ["Roku Express", 0.18], ["Samsung Smart TV", 0.24], ["Fire TV Stick 4K", 0.21], ["LG Smart TV", 0.14]] : [["iPhone", 0.49], ["Galaxy S24", 0.14], ["Galaxy A15", 0.15], ["Pixel 8", 0.09], ["iPad", 0.13]]),
    "Device HWV": () => [["Unknown", 1]],
    "Rewarded": () => [["False", 1]],
    "Interstitial": (c) => [["False", c.format === "Banner" ? 0.88 : 1], ...(c.format === "Banner" ? [["True", 0.12]] as [string, number][] : [])],
    "Carrier": (c) => (c.device === "Connected TV" ? [["Unknown", 1]] : [["Verizon", 0.34], ["T-Mobile", 0.31], ["AT&T", 0.27], ["Unknown", 0.08]]),
    "Ad Format": (c) => [[c.format, 1]],
    "Media type": (c) => [[c.format, 1]],
    "Timezone": () => [["America/Phoenix", 0.71], ["America/Denver", 0.18], ["America/Los_Angeles", 0.11]],
    "Connection type": (c) => (c.device === "Connected TV" ? [["Wifi", 0.81], ["Ethernet", 0.19]] : [["Wifi", 0.57], ["Cellular_nw_5g", 0.24], ["Cellular_nw_4g", 0.19]]),
    "Budget": (c) => [[`${c.name.split(" | ").slice(2).join(" ")} · Total`, 1]],
    "Partner Ref": () => [["-", 1]],
    "Audience": (c) => [[c.audience, 1]],
    "Creative": (c) => (c.format === "Video" ? [[`${short.toLowerCase()}-spot-30s.mp4`, 0.58], [`${short.toLowerCase()}-spot-15s.mp4`, 0.42]] : c.format === "Native" ? [[`${short.toLowerCase()}-native-a`, 0.53], [`${short.toLowerCase()}-native-b`, 0.47]] : [[`${short.toLowerCase()}-300x250`, 0.46], [`${short.toLowerCase()}-320x50`, 0.31], [`${short.toLowerCase()}-728x90`, 0.23]]),
  };

  /** Totals for a campaign over days a..b (inclusive indexes into dates). */
  const sumDays = (c: Campaign, a: number, b: number) => c.days.slice(a, b + 1).reduce(add, blank(c.format === "Video"));

  function breakdown(dim: Dim, a = 0, b = LEN - 1): { name: string; row: Row }[] {
    if (dim === "Date") return daily.slice(a, b + 1).map((d) => ({ name: dmy(d.date), row: d.row }));
    if (dim === "Campaign") return campaigns.map((c) => ({ name: c.name, row: sumDays(c, a, b) })).filter((x) => x.row.imp > 0);
    const fn = VALUES[dim];
    const out = new Map<string, Row>();
    for (const c of campaigns) {
      const parts = fn ? fn(c) : [["-", 1] as [string, number]];
      for (const [name, s] of parts) {
        const k = Object.fromEntries(Object.entries(sumDays(c, a, b)).map(([key, v]) => [key, typeof v === "number" ? v * s : v])) as Row;
        out.set(name, out.has(name) ? add(out.get(name)!, k) : k);
      }
    }
    return [...out.entries()].map(([name, row]) => ({ name, row })).filter((x) => x.row.imp > 0).sort((x, y) => y.row.imp - x.row.imp);
  }

  /** Index range for a date preset, as the platform's picker offers them. Data runs to yesterday. */
  function presetRange(p: string): [number, number] {
    const last = LEN - 1, y = dates[last];
    if (p === "Today") return [LEN, LEN - 1]; // nothing reported yet today
    if (p === "Yesterday") return [last, last];
    if (p === "Last 7 days") return [last - 6, last];
    if (p === "Last 30 days") return [last - 29, last];
    if (p === "This month") return [dates.findIndex((d) => d.getMonth() === y.getMonth() && d.getFullYear() === y.getFullYear()), last];
    if (p === "Last month") {
      const m = new Date(y.getFullYear(), y.getMonth() - 1, 1);
      const a = dates.findIndex((d) => d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear());
      let b = a; dates.forEach((d, i) => { if (d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear()) b = i; });
      return [Math.max(a, 0), b];
    }
    return [last - 13, last]; // Custom range defaults to the last 14 days
  }

  const totals = (a: number, b: number) => daily.slice(a, b + 1).reduce((x, d) => add(x, d.row), blank());
  return { dates, daily, campaigns, tot, funded, balance: funded - tot.spend, breakdown, presetRange, sumDays, totals, city, short, LEN };
}
export type Account = ReturnType<typeof account>;
