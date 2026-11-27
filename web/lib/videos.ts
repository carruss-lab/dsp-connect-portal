import { ID, SITE_URL } from "./seo";

// The explainer videos on YouTube (channel @getdspconnect). Each appears on its page and in that page's
// structured data, so search engines can show it as a video result.
export type Video = { id: string; title: string; description: string; seconds: number; poster: string; uploaded?: string; es?: Partial<Omit<Video, "es">> };
/** The version of a video for a language: the Spanish recording once there is one, otherwise the English. */
export const forLang = (v: Video, lang: "en" | "es"): Video => (lang === "es" && v.es ? { ...v, ...v.es } : v);

export const VIDEOS = {
  owners: { id: "YxMDlMvTWf4", seconds: 125, poster: "/video/vsl-owners.jpg", title: "Enterprise programmatic advertising, without the enterprise contract",
    description: "How DSP Connect gives any business the same kind of buying big brands do: streaming TV, apps and websites, from a $750 ad budget, set up for you and live within 14 days.",
    es: { id: "4nVHFXrzFR8", seconds: 150, poster: "/video/vsl-owners-es.jpg", uploaded: "2026-11-27", title: "Publicidad programática empresarial, sin el contrato empresarial",
      description: "Cómo DSP Connect le da a cualquier negocio el mismo tipo de compra de medios que usan las grandes marcas: TV por streaming, apps y sitios web, desde un presupuesto de $750, configurado por nosotros y activo en 14 días." } },
  agencies: { id: "NXtGfd19rnw", seconds: 94, poster: "/video/vsl-agencies.jpg", title: "Keep your clients. Earn 10% of what they spend.",
    description: "How agencies run their clients' streaming TV and programmatic advertising on DSP Connect and earn 10% of the ad spend they manage.",
    es: { id: "_0D7XEiKXMM", seconds: 115, poster: "/video/vsl-agencies-es.jpg", uploaded: "2026-11-27", title: "Conserve a sus clientes. Gane el 10% de lo que invierten.",
      description: "Cómo las agencias manejan la publicidad en TV por streaming y programática de sus clientes en DSP Connect y ganan el 10% de la inversión publicitaria que administran." } },
  partners: { id: "36otYEzW9Ts", seconds: 103, poster: "/video/vsl-partners.jpg", title: "Become a DSP Connect Authorized Sales Partner",
    description: "How ISOs and local sales pros introduce DSP Connect to the business owners they already call on, and earn 7% of their clients' ad spend for life.",
    es: { id: "V52F0XZgIs8", seconds: 118, poster: "/video/vsl-partners-es.jpg", uploaded: "2026-11-27", title: "Hágase Socio de Ventas Autorizado de DSP Connect",
      description: "Cómo los ISO y profesionales de ventas locales presentan DSP Connect a los dueños de negocios que ya visitan, y ganan el 7% de la inversión publicitaria de sus clientes de por vida." } },
  // How to use the free ad planner (/planner), for each audience.
  plannerOwners: { id: "xgLxVnZ55c0", seconds: 80, poster: "/video/plan-owners.jpg", uploaded: "2026-11-25", title: "Get a free streaming TV ad plan for your business in 30 seconds",
    description: "Enter your website and get a free ad plan for streaming TV, online video, display, native and retargeting ads, split for the budget you choose, then build the campaign in your demo account.",
    es: { id: "0GoHR6bVzpA", seconds: 92, poster: "/video/plan-owners-es.jpg", uploaded: "2026-11-27", title: "Obtenga un plan gratis de anuncios en TV por streaming en 30 segundos",
      description: "Ingrese su sitio web y obtenga un plan de anuncios gratis para TV por streaming, video en línea, display, nativos y retargeting, repartido según el presupuesto que elija, y luego cree la campaña en su cuenta demo." } },
  plannerAgencies: { id: "N5mNVCRGbr8", seconds: 94, poster: "/video/plan-agencies.jpg", uploaded: "2026-11-25", title: "Walk into every pitch with a plan",
    description: "How agencies turn any prospect's website into a streaming TV and programmatic plan in about 30 seconds, build the campaign live in the meeting, and find room to grow with existing clients.",
    es: { id: "o1jkKitsipE", seconds: 108, poster: "/video/plan-agencies-es.jpg", uploaded: "2026-11-27", title: "Llegue a cada presentación con un plan",
      description: "Cómo las agencias convierten el sitio web de cualquier prospecto en un plan de TV por streaming y programática en unos 30 segundos, crean la campaña en vivo en la reunión y encuentran espacio para crecer con sus clientes actuales." } },
  plannerPartners: { id: "omsXf5SJqpE", seconds: 84, poster: "/video/plan-partners.jpg", uploaded: "2026-11-25", title: "Hand any business owner an ad plan in 30 seconds",
    description: "How Authorized Sales Partners use their planner link to give a business owner a streaming TV and programmatic ad plan built from their own website, credited to the partner.",
    es: { id: "W6RMIyUEolc", seconds: 97, poster: "/video/plan-partners-es.jpg", uploaded: "2026-11-27", title: "Entréguele a cualquier dueño de negocio un plan de anuncios en 30 segundos",
      description: "Cómo los Socios de Ventas Autorizados usan su enlace del planificador para darle a un dueño de negocio un plan de anuncios creado a partir de su propio sitio web, acreditado al socio." } },
  teamOwners: { id: "5_wFTJKWq9k", seconds: 97, poster: "/video/team-owners.jpg", uploaded: "2026-11-26", title: "Build your sales team",
    description: "For Authorized Sales Partners: add reps in your partner portal. Each gets their own sign-in and links, every client is credited to you, and all commission is paid to you.",
    es: { id: "gf9pEbHhXH4", seconds: 113, poster: "/video/team-owners-es.jpg", uploaded: "2026-11-27", title: "Forme su equipo de ventas",
      description: "Para Socios de Ventas Autorizados: agregue representantes en su portal de socio. Cada uno tiene su propio acceso y enlaces, cada cliente se le acredita a usted y toda la comisión se le paga a usted." } },
  teamAgencies: { id: "au5qCF-bXws", seconds: 87, poster: "/video/team-agencies.jpg", uploaded: "2026-11-26", title: "Add your sales team in PartnerStack",
    description: "For agency partners, step by step in PartnerStack: open Members & Invites, invite each rep by email as a Member, and see what each role can do. Every customer is credited to your agency.",
    es: { id: "bJeYQWhbDOY", seconds: 108, poster: "/video/team-agencies-es.jpg", uploaded: "2026-11-27", title: "Agregue a su equipo de ventas en PartnerStack",
      description: "Para agencias socias, paso a paso en PartnerStack: abra Members & Invites, invite a cada representante por correo como Member y vea qué puede hacer cada rol. Cada cliente se acredita a su agencia." } },
  teamReps: { id: "hdKgI_vLSpQ", seconds: 90, poster: "/video/team-reps.jpg", uploaded: "2026-11-26", title: "Welcome to the team",
    description: "For reps on a Sales Partner's team: your portal, your own links, the free ad planner, and how credit and pay work.",
    es: { id: "46xVvcF2UTs", seconds: 100, poster: "/video/team-reps-es.jpg", uploaded: "2026-11-27", title: "Bienvenido al equipo",
      description: "Para representantes en el equipo de un Socio de Ventas: su portal, sus propios enlaces, el planificador de anuncios gratis y cómo funcionan el crédito y el pago." } },
} satisfies Record<string, Video>;

/** schema.org VideoObject for a page's structured data. */
export const videoNode = (video: Video, page: string, anchor = "video", lang: "en" | "es" = "en") => {
  const v = forLang(video, lang);
  const url = SITE_URL + (lang === "es" ? (page === "/" ? "/es" : `/es${page}`) : page);
  return {
    "@type": "VideoObject", "@id": `${url}#${anchor}`, name: v.title, description: v.description,
    thumbnailUrl: [`${SITE_URL}${v.poster}`, `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`], uploadDate: v.uploaded || "2026-11-17",
    duration: `PT${Math.floor(v.seconds / 60)}M${v.seconds % 60}S`, contentUrl: `https://www.youtube.com/watch?v=${v.id}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`, publisher: { "@id": ID.org }, inLanguage: lang === "es" && video.es ? "es-US" : "en-US",
    isPartOf: { "@id": `${url}#webpage` }, isFamilyFriendly: true, potentialAction: { "@type": "WatchAction", target: `https://www.youtube.com/watch?v=${v.id}` },
  };
};
