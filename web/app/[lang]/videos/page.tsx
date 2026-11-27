import type { Metadata } from "next";
import Link from "@/components/Link";
import { Footer, Header } from "@/components/Chrome";
import VideoCard from "@/components/VideoCard";
import { ID, JsonLd, SITE_URL, pageGraph, pageMeta } from "@/lib/seo";
import { MIN_BUDGET, SETUP_DAYS } from "@/lib/site";
import { VIDEO_FAQ } from "@/lib/videoFaq";
import { getLang } from "@/lib/lang";
import { localePath, tr } from "@/lib/i18n";
import { industryPagesFor } from "@/lib/industries.es";
import {
  CHANNEL_URL, SECTIONS, SECTIONS_ES, SUBSCRIBE_URL, anchor, clock, isLive, librarySnapshot, libraryVideoNode, premiereLabel, type LibraryVideo,
} from "@/lib/videoLibrary";

// Re-read YouTube's feeds about once an hour, so new uploads and premieres that have gone live show up by themselves.
export const revalidate = 3600;

const DESC = {
  en: "Free video lessons on programmatic advertising: streaming TV, apps and websites, with transcripts and chapters. For businesses, agencies and creators.",
  es: "Lecciones gratis en video sobre publicidad programática: TV por streaming, apps y sitios web, con capítulos y transcripciones. Para negocios, agencias y creadores.",
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    ...pageMeta({ title: tr(lang)("Programmatic Advertising Videos and Lessons", "Videos y lecciones de publicidad programática"), description: DESC[lang], path: "/videos", lang }),
    robots: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large" },
  };
}

export default async function Videos() {
  const lang = await getLang(); const t = tr(lang); const es = lang === "es";
  const PATH = localePath("/videos", lang); const DESCRIPTION = DESC[lang];
  const sec = (s: (typeof SECTIONS)[number]) => (es ? { ...s, ...SECTIONS_ES[s.id] } : s);
  const { lib, now } = await librarySnapshot();
  const all = SECTIONS.flatMap((s) => lib[s.id]);
  const live = all.filter((v) => isLive(v, now));
  const minutes = Math.round(all.reduce((t, v) => t + (v.seconds || 0), 0) / 60);
  const byKey = new Map(all.map((v) => [v.key, v]));
  const sections = SECTIONS.filter((s) => lib[s.id].length).map(sec);

  // Structured data: the page as a collection of videos, each a full VideoObject (only once it has premiered),
  // the playlists as ordered lists, the questions as an FAQ, and the channel as part of the organization.
  const videoNodes = live.map((v) => libraryVideoNode(v, PATH));
  const lists = sections.map((s) => ({
    "@type": "ItemList", "@id": `${SITE_URL}${PATH}#${s.id}`, name: s.title, description: s.intro,
    itemListOrder: s.ordered ? "https://schema.org/ItemListOrderAscending" : "https://schema.org/ItemListUnordered",
    numberOfItems: lib[s.id].length,
    itemListElement: lib[s.id].map((v, i) => ({
      "@type": "ListItem", position: i + 1, name: v.title, url: `${SITE_URL}${PATH}#${anchor(v)}`,
      ...(isLive(v, now) ? { item: { "@id": `${SITE_URL}${PATH}#${anchor(v)}` } } : {}),
    })),
  }));
  const graph = pageGraph({
    lang, path: "/videos", type: "CollectionPage", name: t("DSP Connect videos", "Videos de DSP Connect"), description: DESCRIPTION,
    trail: [[t("Home", "Inicio"), "/"], ["Videos", "/videos"]], about: [ID.ads, ID.org],
    // The questions are written in English, so only the English page carries them.
    faq: es ? undefined : VIDEO_FAQ.map(([q, a]) => [q, a]),
    image: live[0] ? `https://i.ytimg.com/vi/${live[0].id}/maxresdefault.jpg` : undefined,
    modified: new Date(Math.max(...live.map((v) => +new Date(v.published)))),
    nodes: [
      ...lists,
      ...videoNodes,
      { "@type": "ItemList", "@id": `${SITE_URL}${PATH}#topics`, name: t("Topics", "Temas"), numberOfItems: lists.length,
        itemListElement: sections.map((s, i) => ({ "@type": "ListItem", position: i + 1, item: { "@id": `${SITE_URL}${PATH}#${s.id}` } })) },
    ],
  });
  // Tie the page to its parts, so assistants read it as one library.
  const page = (graph["@graph"] as Record<string, unknown>[]).find((n) => n["@type"] === "CollectionPage");
  if (page) {
    page.mainEntity = { "@id": `${SITE_URL}${PATH}#topics` };
    page.hasPart = [...((page.hasPart as unknown[]) || []), ...lists.map((l) => ({ "@id": l["@id"] })), ...videoNodes.map((n) => ({ "@id": n["@id"] }))];
    page.significantLink = [CHANNEL_URL, `${SITE_URL}${localePath("/demo", lang)}`, `${SITE_URL}${localePath("/open-account", lang)}`];
    page.speakable = { "@type": "SpeakableSpecification", cssSelector: [".vl-hero-lead", ".faq-a"] };
  }

  const card = (v: LibraryVideo, i: number, list: LibraryVideo[], ordered?: boolean) => {
    const next = ordered ? list[i + 1] : undefined;
    return (
      <VideoCard key={v.key} n={i + 1} id={v.id} anchorId={anchor(v)} title={v.title} summary={v.summary} points={v.points}
        chapters={v.chapters} transcript={v.transcript} length={v.seconds ? clock(v.seconds) : undefined}
        premiere={isLive(v, now) ? undefined : premiereLabel(v, lang)} next={next ? { anchorId: anchor(next), title: next.title } : undefined} />
    );
  };

  return (
    <>
      <JsonLd data={graph} />
      <Header />
      <main>
        <section className="hero" style={{ paddingBottom: 40 }}>
          <div className="wrap stack g24" style={{ alignItems: "flex-start" }}>
            <div className="eyebrow">{t("DSP Connect videos", "Videos de DSP Connect")}</div>
            <h1 className="h1" style={{ maxWidth: 940 }}>{t("Programmatic advertising, one short lesson at a time.", "Publicidad programática, una lección corta a la vez.")}</h1>
            {es ? (
              <p className="lead vl-hero-lead" style={{ maxWidth: 780 }}>
                Videos gratis sobre cómo funciona la publicidad en TV por streaming, apps y sitios web, y cómo usarla: para dueños de
                negocio, agencias, artistas, autores, creadores y tiendas en línea. Cada video tiene capítulos y transcripción. La
                mayoría está en inglés por ahora, con subtítulos en español de YouTube activados; las versiones en español irán
                apareciendo aquí.
              </p>
            ) : (
              <p className="lead vl-hero-lead" style={{ maxWidth: 780 }}>
                Free videos on how streaming TV, app and website advertising works, and how to use it: for business owners,
                agencies, artists, authors, creators and online stores. Every video has chapters and a transcript, and new
                videos appear here as soon as they are on our YouTube channel.
              </p>
            )}
            <div className="vl-stat" aria-label={t("Library at a glance", "La videoteca de un vistazo")}>
              <span><b>{all.length}</b>videos</span>
              <span><b>{minutes}</b>{t("minutes in total", "minutos en total")}</span>
              <span><b>{sections.length}</b>{t("topics", "temas")}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <a className="btn btn-blue" href={SUBSCRIBE_URL} target="_blank" rel="noopener">{t("Subscribe on YouTube", "Suscríbase en YouTube")}</a>
              <Link className="btn btn-line" href="/#market">{t("See the demo", "Ver la demostración")}</Link>
            </div>
          </div>
        </section>

        <nav className="wrap stack g12" aria-labelledby="topics-h" style={{ paddingBottom: 48 }}>
          <h2 id="topics-h" className="eyebrow">{t("Topics", "Temas")}</h2>
          <div className="vl-toc">
            {sections.map((s) => <a key={s.id} href={`#${s.id}`}>{s.title}<span>{lib[s.id].length}</span></a>)}
            {!es && <a href="#questions">Questions these videos answer</a>}
          </div>
        </nav>

        {sections.map((s, si) => (
          <section key={s.id} id={s.id} className={`vl-section section${si % 2 ? " band" : ""}`} aria-labelledby={`${s.id}-h`}>
            <div className="wrap stack g32">
              <header className="stack g8" style={{ maxWidth: 760 }}>
                <h2 id={`${s.id}-h`} className="h2">{s.title}</h2>
                <p className="p">{s.intro}</p>
              </header>
              <div className="vl-list">{lib[s.id].map((v, i, list) => card(v, i, list, s.ordered))}</div>
            </div>
          </section>
        ))}

        {!es && <section id="questions" className="vl-section section" aria-labelledby="q-h">
          <div className="wrap narrow stack g24">
            <h2 id="q-h" className="h2">Questions these videos answer</h2>
            <div>
              {VIDEO_FAQ.map(([q, a, key]) => {
                const v = byKey.get(key);
                return (
                  <div key={q} className="faq stack g8">
                    <h3 className="h3">{q}</h3>
                    <p className="p faq-a">{a}</p>
                    {v && <a className="small" href={`#${anchor(v)}`}>From the video: {v.title}</a>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>}

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="cta dark">
              <div className="stack g8" style={{ maxWidth: 640 }}>
                <h2 className="h2" style={{ color: "#fff" }}>{t("See it for your business.", "Véalo para su negocio.")}</h2>
                <p className="p">{es
                  ? `Abra una cuenta de ejemplo configurada para un negocio como el suyo, y luego abra su cuenta cuando esté listo. Desde un presupuesto publicitario de $${MIN_BUDGET}, activo en ${SETUP_DAYS} días. Sin cuota mensual de plataforma. Nuestra tarifa está incluida en el precio de sus anuncios. ¿Preguntas? Escríbanos en el chat, a cualquier hora, en español.`
                  : `Open a sample account set up for a business like yours, then open your account when you are ready. From a $${MIN_BUDGET} ad budget, live within ${SETUP_DAYS} days. No monthly platform fee. Our fee is included in the price of your ads. Questions? Ask in the chat, any hour.`}</p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <Link className="btn btn-white" href="/#market">{t("See the demo", "Ver la demostración")}</Link>
                <Link className="btn btn-line" style={{ borderColor: "#fff", color: "#fff" }} href="/open-account">{t("Open your account", "Abra su cuenta")}</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section band" aria-label={t("More from DSP Connect", "Más de DSP Connect")}>
          <div className="wrap grid cols-2" style={{ gap: 40 }}>
            <div className="stack g12">
              <h2 className="h3">{t("Industries", "Industrias")}</h2>
              <ul className="list">
                {industryPagesFor(lang).map((i) => <li key={i.slug}><Link href={`/industries/${i.slug}`}>{i.label}</Link></li>)}
              </ul>
            </div>
            <div className="stack g12">
              <h2 className="h3">DSP Connect</h2>
              <ul className="list">
                <li><Link href="/open-account">{t("Open your account", "Abra su cuenta")}</Link></li>
                <li><Link href="/agencies">{t("For agencies", "Para agencias")}</Link></li>
                <li><Link href="/partners">{t("Authorized Sales Partners", "Socios de Ventas Autorizados")}</Link></li>
                <li><Link href="/compare">{t("How we compare", "Cómo nos comparamos")}</Link></li>
                <li><Link href="/about">{t("About DSP Connect", "Acerca de DSP Connect")}</Link></li>
                <li><a href={CHANNEL_URL} target="_blank" rel="noopener">{t("DSP Connect on YouTube", "DSP Connect en YouTube")}</a></li>
              </ul>
              <p className="small">{t("Advertising can’t guarantee results. Demo screens in the videos show sample data.", "La publicidad no puede garantizar resultados. Las pantallas de demostración en los videos muestran datos de ejemplo.")}</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
