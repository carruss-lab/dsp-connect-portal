import { EXCHANGES, MIN_BUDGET, SETUP_DAYS, SHARE_PCT } from "./site";
import { COMPARISONS, CHECKED, compareFaq, compareMeta, type Comparison } from "./compare";

// The comparison pages in Spanish. Same slugs, facts and sources as compare.ts; only the words change.
export const CHECKED_ES = "noviembre de 2026";

const US = {
  setup: "Lo hacemos por usted",
  live: `En ${SETUP_DAYS} días, completamente configurado`,
  budget: `$${MIN_BUDGET}`,
  share: `${SHARE_PCT}% del gasto publicitario que administra`,
  where: `${EXCHANGES} intercambios publicitarios`,
  support: "Ayuda con IA en su cuenta, más personas",
  contract: "Sin contrato a largo plazo",
};
const F = {
  setup: "Quién configura la cuenta", live: "Tiempo para estar activo", budget: "Presupuesto para empezar", share: "Reparto de ingresos para agencias",
  where: "Dónde se muestran los anuncios", support: "Soporte", contract: "Contrato", fee: "Cuota mensual de plataforma",
};

type Es = Omit<Comparison, "slug" | "name" | "site">;
const ES: Record<string, Es> = {
  "dsp-connect-vs-stackadapt": {
    headline: "¿cuál lo configura por usted y cuál le devuelve ingresos?",
    intro: "Ambas plataformas le permiten comprar publicidad en apps y sitios web. La diferencia es quién hace la configuración y quién se queda con el margen.",
    tiles: [["Configuración hecha por nosotros", "Solo DSP Connect"], ["Reparto de ingresos para agencias", `Solo DSP Connect: ${SHARE_PCT}%`], ["Soporte humano + IA", "Ambas plataformas"], ["Estudio creativo", "Solo StackAdapt"]],
    rows: [
      [F.setup, US.setup, "Usted. Registro autoservicio en el nivel Basic"],
      [F.live, US.live, "Acceso rápido, y luego usted lo arma"],
      [F.budget, US.budget, "No se indica mínimo en el nivel Basic"],
      [F.share, US.share, "No"],
      [F.where, US.where, "Red seleccionada"],
      [F.support, US.support, "Representantes humanos dedicados"],
      ["Estudio creativo", "No", "Sí"],
      ["Compite por sus clientes", "Nunca", "No"],
    ],
    owner: `StackAdapt le permite registrarse y empezar rápido, pero armar todo le toca a usted. DSP Connect configura su cuenta, su seguimiento y su audiencia antes de que usted toque nada, y empieza desde $${MIN_BUDGET}.`,
    agency: `StackAdapt es un software excelente, pero no comparte ingresos con usted. DSP Connect le paga el ${SHARE_PCT}% del gasto publicitario que administra, además de lo que ya les cobra a sus clientes.`,
    whenText: "Elija StackAdapt si necesita crear anuncios dentro de la plataforma con su estudio creativo, si su sistema de pujas con IA Ivy es un requisito, o si tiene un equipo listo para armar campañas esta semana y no quiere que se las configuren.",
  },
  "dsp-connect-vs-google-dv360": {
    headline: "¿poder empresarial, o una plataforma a la que realmente puede entrar?",
    intro: "DV360 es la plataforma de publicidad empresarial de Google. Es potente, y se creó para marcas que invierten millones al mes. Esto es lo que enfrenta un anunciante o una agencia más pequeños.",
    tiles: [["Mínimo de DV360", "No publicado"], ["Mínimo de DSP Connect", US.budget], ["Acceso a DV360", "Normalmente a través de un socio de Google"], ["Configuración de DSP Connect", `Hecha por nosotros en ${SETUP_DAYS} días`]],
    rows: [
      [F.setup, US.setup, "Usted o su agencia"],
      [F.live, US.live, "Depende del socio con el que compre"],
      [F.budget, US.budget, "No publicado. Normalmente de nivel empresarial"],
      [F.share, US.share, "No"],
      [F.where, `${EXCHANGES} intercambios publicitarios de la web abierta`, "Intercambio de Google y socios limitados"],
      ["Inventario de YouTube", "No", "Sí"],
      ["Integración con el ecosistema de Google", "No", "Sí (SA360, CM360, GA4)"],
    ],
    owner: `DV360 no se vende a un negocio que invierte unos cuantos miles de dólares al mes. DSP Connect empieza en $${MIN_BUDGET}, y lo configuramos por usted.`,
    agency: `Google se queda con el margen de cada dólar que sus clientes invierten a través de DV360. DSP Connect le paga el ${SHARE_PCT}% del gasto publicitario que administra.`,
    whenText: "DV360 es la opción correcta si administra presupuestos muy grandes y necesita una integración profunda con todo el ecosistema publicitario de Google, incluidos YouTube, SA360, CM360 y GA4.",
  },
  "dsp-connect-vs-the-trade-desk": {
    headline: "el estándar de oro, si logra entrar.",
    intro: "The Trade Desk es la referencia para la compra programática a gran escala. El acceso empieza con una conversación de ventas y un contrato negociado. Esto es lo que enfrenta un anunciante o una agencia más pequeños.",
    tiles: [["Mínimo de Trade Desk", "No publicado"], ["Mínimo de DSP Connect", US.budget], ["Acceso a Trade Desk", "Conversación de ventas y contrato"], ["Configuración de DSP Connect", `Hecha por nosotros en ${SETUP_DAYS} días`]],
    rows: [
      [F.setup, US.setup, "Usted, después de una conversación de ventas y una demostración"],
      [F.live, US.live, "Después de negociar un contrato"],
      [F.budget, US.budget, "No publicado"],
      [F.contract, US.contract, "Sí, negociado para cada cuenta"],
      [F.share, US.share, "No"],
      [F.where, US.where, "Inventario premium seleccionado"],
      ["Pujas con IA", "Reglas de optimización automática", "Kokai AI, líder en la industria"],
      ["Identidad", "Segmentación estándar", "Unified ID 2.0"],
    ],
    owner: `The Trade Desk no tiene registro autoservicio. Cada cuenta empieza con una conversación de ventas y un contrato negociado. DSP Connect empieza en $${MIN_BUDGET} y nosotros hacemos la configuración.`,
    agency: `The Trade Desk no tiene reparto de ingresos para agencias. DSP Connect le paga el ${SHARE_PCT}% del gasto publicitario que administra.`,
    whenText: "The Trade Desk es la opción correcta para equipos que manejan $500 mil al mes o más, con clientes que necesitan la resolución de identidad, la segmentación en TV por streaming y la optimización con IA más avanzadas del mercado.",
  },
  "dsp-connect-vs-choozle": {
    headline: "lo simple es bueno. Configurado por nosotros, y con pago para usted, es mejor.",
    intro: "Choozle creó una plataforma amigable con la que es fácil empezar. DSP Connect configura todo por usted, no cobra cuota mensual y comparte ingresos con las agencias.",
    tiles: [["Cuota mensual de Choozle", "$99 al mes"], ["Cuota mensual de DSP Connect", "$0"], ["Reparto de ingresos para agencias", `Solo DSP Connect: ${SHARE_PCT}%`], ["Configuración hecha por nosotros", "Solo DSP Connect"]],
    rows: [
      [F.setup, US.setup, "Usted"],
      [F.live, US.live, "Acceso rápido, y luego usted lo arma"],
      [F.budget, US.budget, "No indicado"],
      [F.fee, "$0", "$99 al mes"],
      [F.share, US.share, "No"],
      [F.where, US.where, "Red seleccionada"],
      ["Facilidad de uso", "Configurado por nosotros, con guías y ayuda por chat", "Muy simple, ideal para principiantes"],
    ],
    owner: "Choozle es fácil de aprender, pero usted sigue armando todo y pagando una cuota mensual. DSP Connect no tiene cuota mensual, y su cuenta, su seguimiento y su audiencia se configuran por usted.",
    agency: `Con $50,000 al mes de gasto administrado, Choozle cuesta $1,188 al año en cuotas y no le devuelve nada. Con el mismo gasto, el ${SHARE_PCT}% de DSP Connect son $5,000 al mes.`,
    whenText: "Choozle es un buen punto de partida si es nuevo en este tipo de publicidad, quiere la interfaz más simple y quiere estar funcionando en un día o dos armándolo usted mismo.",
  },
  "dsp-connect-vs-amazon-dsp": {
    headline: "¿la web abierta, o una plataforma creada para vendedores de Amazon?",
    intro: "Amazon DSP es potente si vende en Amazon. Para la mayoría de los demás negocios, su enfoque en los compradores de Amazon y en las propiedades de Amazon hace que no sea la mejor opción.",
    tiles: [["Servicio administrado de Amazon", "Mínimo típico de $50,000"], ["Mínimo de DSP Connect", US.budget], ["Enfoque de Amazon DSP", "Vendedores de Amazon"], ["Enfoque de DSP Connect", "Cualquier negocio, cualquier industria"]],
    rows: [
      [F.setup, US.setup, "Usted, en autoservicio. El equipo de Amazon, en servicio administrado"],
      [F.live, US.live, "Depende de la opción que elija"],
      [F.budget, US.budget, "Servicio administrado: típico de $50,000. Autoservicio: no publicado"],
      [F.share, US.share, "No"],
      [F.where, `${EXCHANGES} intercambios publicitarios de la web abierta`, "Propiedades de Amazon y socios limitados"],
      ["Datos de compradores de Amazon", "No", "Sí, los mejores de su clase"],
      ["Prime Video y Twitch", "No", "Sí"],
    ],
    owner: `A menos que venda en Amazon, estaría aprendiendo una plataforma pensada para los compradores de Amazon. DSP Connect empieza en $${MIN_BUDGET} y funciona para cualquier industria.`,
    agency: `Amazon DSP no tiene reparto de ingresos para agencias. Con DSP Connect, la relación con el cliente es suya y gana el ${SHARE_PCT}% del gasto que administra.`,
    whenText: "Amazon DSP es la decisión correcta cuando sus clientes venden en Amazon y necesitan sus datos de compradores, o cuando el inventario de Prime Video y Twitch es central en el plan.",
  },
  "dsp-connect-vs-basis-technologies": {
    headline: "¿una herramienta para todo, o una que lo configura y le devuelve ingresos?",
    intro: "Basis combina publicidad en buscadores, redes sociales y programática en una sola interfaz. DSP Connect hace una sola cosa: publicidad en apps y sitios web, configurada por usted, con reparto de ingresos para agencias.",
    tiles: [["Reparto de ingresos para agencias", `Solo DSP Connect: ${SHARE_PCT}%`], ["Configuración hecha por nosotros", "Solo DSP Connect"], ["Buscadores y redes sociales en un solo lugar", "Solo Basis"], ["Presupuesto para empezar", `DSP Connect: ${US.budget}`]],
    rows: [
      [F.setup, US.setup, "Usted, después de una demostración y la incorporación"],
      [F.live, US.live, "Después de una demostración y la incorporación"],
      [F.budget, US.budget, "No publicado. Requiere demostración"],
      [F.share, US.share, "No"],
      [F.where, US.where, "Red seleccionada"],
      ["Gestión de buscadores y redes sociales", "No", "Sí, un solo flujo de trabajo"],
      [F.support, US.support, "Equipo de soporte dedicado"],
    ],
    owner: `Basis está hecho para equipos de marketing que manejan varios canales. Si quiere anuncios en apps y sitios web sin aprender una herramienta nueva, DSP Connect lo configura por usted desde $${MIN_BUDGET}.`,
    agency: `Basis se queda con el margen de la plataforma. DSP Connect le paga el ${SHARE_PCT}% del gasto publicitario que administra.`,
    whenText: "Basis es la opción indicada para equipos que necesitan manejar buscadores y redes sociales pagadas junto con la publicidad programática en un solo lugar, y valoran esa comodidad más que un reparto de ingresos.",
  },
  "dsp-connect-vs-simpli.fi": {
    headline: "¿especialista en segmentación local, o configurado por nosotros con reparto de ingresos?",
    intro: "Simpli.fi es una plataforma sólida para anunciantes locales y con varias ubicaciones. DSP Connect atiende a anunciantes locales, regionales y nacionales, hace la configuración por usted y comparte ingresos con las agencias.",
    tiles: [["Reparto de ingresos para agencias", `Solo DSP Connect: ${SHARE_PCT}%`], ["Configuración hecha por nosotros", "Solo DSP Connect"], ["Segmentación por dirección", "Fortaleza de Simpli.fi"], ["Presupuesto para empezar", `DSP Connect: ${US.budget}`]],
    rows: [
      [F.setup, US.setup, "Usted, después de una demostración y la incorporación"],
      [F.live, US.live, "Requiere demostración e incorporación"],
      [F.budget, US.budget, "No divulgado públicamente"],
      [F.share, US.share, "No"],
      [F.where, US.where, "Red seleccionada, enfocada en lo local"],
      ["Segmentación local", "Ciudad, estado y ubicaciones personalizadas", "La mejor de su clase: código postal, dirección, radio"],
      ["Marcas con varias ubicaciones", "Compatible", "Su principal fortaleza"],
    ],
    owner: `Simpli.fi no publica sus precios y empieza con una demostración. DSP Connect le muestra primero su mercado, empieza en $${MIN_BUDGET} y hace la configuración.`,
    agency: `Simpli.fi no tiene reparto de ingresos. DSP Connect le paga el ${SHARE_PCT}% del gasto publicitario que administra, con clientes locales, regionales y nacionales.`,
    whenText: "Simpli.fi es la opción correcta cuando la segmentación por dirección y por código postal para franquicias y marcas con varias ubicaciones es el centro de lo que hace.",
  },
};

export const comparisonFor = (c: Comparison, lang: "en" | "es"): Comparison => (lang === "es" && ES[c.slug] ? { ...c, ...ES[c.slug] } : c);
export const checkedFor = (lang: "en" | "es") => (lang === "es" ? CHECKED_ES : CHECKED);

export const compareMetaFor = (c: Comparison, lang: "en" | "es") =>
  lang === "es"
    ? `DSP Connect vs ${c.name}: quién configura la cuenta, presupuesto para empezar, cuotas, contratos y reparto de ingresos para agencias. Revisado en ${CHECKED_ES}.`
    : compareMeta(c);

/** The page's questions in the reader's language (c must already be in that language). */
export const compareFaqFor = (c: Comparison, lang: "en" | "es"): [string, string][] => {
  if (lang !== "es") return compareFaq(c);
  const row = (f: string) => c.rows.find((r) => r[0] === f);
  const budget = row(F.budget), setup = row(F.setup);
  return [
    [`¿Cuál es la diferencia entre DSP Connect y ${c.name}?`, `${c.intro} ${c.owner}`],
    ...(budget ? [[`¿Qué presupuesto necesita para empezar con DSP Connect o con ${c.name}?`, `DSP Connect: ${budget[1]}. ${c.name}: ${budget[2]}.`] as [string, string]] : []),
    ...(setup ? [[`¿Quién configura la cuenta en DSP Connect y en ${c.name}?`, `DSP Connect: ${setup[1]}. ${c.name}: ${setup[2]}.`] as [string, string]] : []),
    [`¿${c.name} comparte ingresos con las agencias?`, c.agency],
    [`¿Cuándo es mejor opción ${c.name}?`, c.whenText],
  ];
};
export { COMPARISONS };
