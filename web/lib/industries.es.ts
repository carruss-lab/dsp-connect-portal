import { MIN_BUDGET, SETUP_DAYS } from "./site";
import { INDUSTRY_PAGES, type Industry } from "./industries";

// The industry pages in Spanish. Same slugs and the same English `name` (it opens the demo set up for
// that industry); `label` is the Spanish name shown on the page. No results, client names or statistics.
export type IndustryEs = Omit<Industry, "slug" | "name"> & { label: string };

const startFaq = (who: string): [string, string] => [
  `¿Cuánto necesita ${who} para empezar?`,
  `El presupuesto publicitario inicial mínimo es de $${MIN_BUDGET}. Sin cuota mensual de plataforma; nuestra tarifa está incluida en el precio de sus anuncios.`,
];
const liveFaq: [string, string] = [
  "¿En cuánto tiempo están activos los anuncios?",
  `En ${SETUP_DAYS} días desde el pago. Creamos su cuenta, colocamos el seguimiento en su sitio web, revisamos sus anuncios y armamos su audiencia por usted.`,
];

const ES: Record<string, IndustryEs> = {
  healthcare: {
    label: "Salud", who: "consultorio o clínica",
    headline: "Llegue a pacientes de su zona en las apps y sitios web que usan todos los días.",
    intro: "Para consultorios médicos, dentales, de visión y de bienestar que quieren solicitudes de pacientes nuevos de su propia zona, más allá de los buscadores y las redes sociales.",
    counts: ["Solicitudes de cita y formularios de reservación", "Llamadas desde su sitio web", "Visitas a sus páginas de pacientes nuevos y de seguros"],
    campaigns: [
      ["Pacientes nuevos cerca de cada ubicación", "Anuncios en video y banners mostrados dentro de la distancia que la gente está dispuesta a recorrer hasta su consultorio, con un presupuesto separado para cada ubicación."],
      ["Un servicio o médico nuevo", "Presente un servicio, un médico nuevo o un horario extendido a las personas de su zona antes de que lo necesiten."],
      ["Personas que visitaron y no reservaron", "Muestre un recordatorio a quienes vieron su página de citas y se fueron."],
    ],
    rules: [
      ["Sin segmentar por condición de salud", "No armamos audiencias a partir de las condiciones médicas o tratamientos de una persona. Las audiencias usan ubicación, contexto e intereses generales."],
      ["Seguimiento fuera de las páginas de pacientes", "Colocamos el seguimiento solo en páginas públicas, nunca dentro de portales de pacientes ni en páginas que revelen una condición, para que no capture información de salud protegida."],
      ["Afirmaciones que puede respaldar", "Los anuncios de tratamientos deben ser precisos y no pueden prometer resultados. Algunos tratamientos requieren una revisión adicional de los intercambios publicitarios."],
    ],
    faq: [startFaq("un consultorio"), liveFaq, ["¿Esto es adecuado bajo HIPAA?", "Configuramos el seguimiento para evitar portales de pacientes y páginas sobre condiciones específicas, y no segmentamos por condición de salud. Usted sigue siendo responsable de su propio cumplimiento, así que revise nuestra configuración con su responsable de cumplimiento antes del lanzamiento."]],
  },
  legal: {
    label: "Legal", who: "despacho de abogados",
    headline: "Manténgase presente ante las personas de su zona antes de que elijan abogado.",
    intro: "Para despachos de abogados que quieren más consultas de casos en ciudades o condados específicos, en áreas de práctica donde la gente se toma su tiempo para decidir.",
    counts: ["Solicitudes de consulta y formularios de contacto", "Llamadas desde su sitio web", "Visitas a cada página de área de práctica"],
    campaigns: [
      ["Un área de práctica, un condado", "Maneje cada área de práctica como su propia campaña para ver cuánto cuesta una consulta en cada una."],
      ["Personas que leyeron y se fueron", "Muestre su despacho de nuevo a quienes leyeron una página de área de práctica y no se comunicaron."],
      ["Reconocimiento antes de la necesidad", "Video corto en apps locales de noticias y deportes, para que su despacho sea el nombre que la gente recuerde."],
    ],
    rules: [
      ["Las reglas de publicidad de su colegio de abogados", "Los anuncios deben seguir las reglas de publicidad para abogados del colegio de su estado, incluidos los avisos obligatorios y los límites en palabras como especialista o experto. Incluimos su texto de aviso en cada anuncio."],
      ["Sin promesas de resultados", "Los anuncios no pueden garantizar un resultado ni insinuarlo a partir de resultados anteriores sin la redacción que exige su colegio de abogados."],
      ["Circunstancias sensibles", "No armamos audiencias a partir de los antecedentes penales, la situación migratoria o las dificultades económicas de una persona."],
    ],
    faq: [startFaq("un despacho de abogados"), liveFaq, ["¿Podemos limitar los anuncios a los condados que atendemos?", "Sí. Usted elige estados, ciudades, códigos postales o una distancia alrededor de una dirección, y los anuncios se muestran solo ahí."]],
  },
  "financial-services": {
    label: "Servicios financieros", who: "empresa financiera",
    headline: "Llegue a los hogares correctos de su mercado, dentro de las reglas.",
    intro: "Para asesores, prestamistas, aseguradoras, cooperativas de crédito y contadores que quieren consultas calificadas de una zona definida.",
    counts: ["Solicitudes de consulta y de cotización", "Solicitudes iniciadas", "Llamadas desde su sitio web"],
    campaigns: [
      ["Un producto en un lugar", "Una campaña por producto y mercado, para que cada uno tenga su propio presupuesto y costo por consulta."],
      ["Demanda de temporada", "Temporada de impuestos, inscripción abierta, cambios de tasas: active la campaña en las semanas que importan y páusela después."],
      ["Personas que empezaron y se detuvieron", "Recuérdeles a quienes empezaron una cotización o solicitud y no la terminaron."],
    ],
    rules: [
      ["Ofertas de crédito, vivienda y empleo", "Los anuncios de crédito, préstamos, seguros o vivienda no pueden segmentarse por edad, género, código postal ni otras características protegidas. Configuramos estas campañas con la segmentación más amplia que exigen las reglas."],
      ["Divulgaciones obligatorias", "Las tasas, comisiones y condiciones deben mostrarse como lo exigen los reguladores, y su equipo de cumplimiento debe aprobar los anuncios antes del lanzamiento. Incluimos esa aprobación en la configuración."],
      ["Sin rendimientos garantizados", "Los anuncios no pueden prometer rendimientos de inversión."],
    ],
    faq: [startFaq("una empresa financiera"), liveFaq, ["¿Puede nuestro equipo de cumplimiento revisar los anuncios primero?", "Sí. Envíenos los anuncios aprobados, o le enviamos borradores para su aprobación. Nada se publica hasta que confirme que está aprobado."]],
  },
  automotive: {
    label: "Automotriz", who: "concesionario",
    headline: "Que los compradores locales lo vean mientras todavía están decidiendo.",
    intro: "Para concesionarios, grupos de concesionarios y centros de servicio que quieren visitas a la sala de exhibición, citas de servicio y consultas de su propia zona de mercado.",
    counts: ["Vistas de páginas de detalle de vehículos", "Formularios de prueba de manejo y de intercambio", "Citas de servicio y llamadas"],
    campaigns: [
      ["Su zona de mercado, por ubicación", "Cada sucursal tiene su propia zona y presupuesto, para que las tiendas de un mismo grupo no compitan entre sí."],
      ["Inventario que necesita mover", "Destaque modelos específicos o inventario con antigüedad ante personas cercanas."],
      ["Servicio y refacciones", "Llegue a los dueños de vehículos de su zona con ofertas de servicio entre una compra y otra."],
    ],
    rules: [
      ["Ofertas mostradas con precisión", "Los precios, pagos e incentivos deben incluir las condiciones y avisos que exigen su estado y el fabricante."],
      ["Reglas de publicidad del fabricante", "Si usa fondos cooperativos, envíenos las pautas de publicidad de la marca y trabajamos con base en ellas."],
      ["Ofertas de financiamiento", "Los anuncios que promueven financiamiento siguen los mismos límites de segmentación de préstamo justo que cualquier oferta de crédito."],
    ],
    faq: [startFaq("un concesionario"), liveFaq, ["¿Puede cada ubicación tener su propio presupuesto?", "Sí. Cada ubicación funciona como su propia campaña con su propia zona, presupuesto y resultados."]],
  },
  "real-estate": {
    label: "Bienes raíces", who: "corretaje o agente",
    headline: "Mantenga sus propiedades y su nombre frente a compradores y vendedores locales.",
    intro: "Para corretajes, equipos, constructoras y administradores de propiedades que quieren consultas de vecindarios y rangos de precio específicos.",
    counts: ["Vistas de páginas de propiedades y comunidades", "Solicitudes de visita y de valuación", "Llamadas y formularios de contacto"],
    campaigns: [
      ["Una propiedad o una comunidad", "Anuncios en video y banners para una propiedad o desarrollo, mostrados en las zonas de donde se mudan los compradores."],
      ["Consultas de vendedores", "Ofertas de valuación de vivienda mostradas en los vecindarios donde quiere conseguir propiedades."],
      ["Personas que vieron una propiedad", "Muestre la propiedad de nuevo a quienes la vieron y no preguntaron."],
    ],
    rules: [
      ["Vivienda justa", "Los anuncios de vivienda no pueden segmentarse por edad, género, situación familiar, código postal ni otras características protegidas. Configuramos las campañas de vivienda con la segmentación por zona más amplia que exigen las reglas."],
      ["Datos de licencia", "Los anuncios llevan el nombre del corretaje y los datos de licencia que exige su estado."],
      ["Propiedades precisas", "Los precios y la disponibilidad en los anuncios deben coincidir con la publicación vigente."],
    ],
    faq: [startFaq("un corretaje"), liveFaq, ["¿Podemos anunciar una sola propiedad?", "Sí. Una propiedad puede funcionar como su propia campaña corta y detenerse cuando se venda."]],
  },
  "home-services": {
    label: "Servicios para el hogar", who: "negocio de servicios para el hogar",
    headline: "Sea el nombre que los dueños de casa de su zona de servicio ya conocen.",
    intro: "Para empresas de climatización, plomería, techos, electricidad, energía solar, jardinería y remodelación que quieren trabajos agendados en las zonas que atienden.",
    counts: ["Solicitudes de cotización y de cita", "Llamadas desde su sitio web", "Visitas a cada página de servicio"],
    campaigns: [
      ["Solo su zona de servicio", "Anuncios mostrados en los códigos postales o el radio que cubren sus equipos, y en ningún otro lugar."],
      ["Trabajo de temporada", "Calefacción antes del invierno, aire acondicionado antes del verano, techos después de las tormentas: active la campaña cuando hay demanda."],
      ["Personas que pidieron cotización y ya no respondieron", "Recuérdeles a quienes visitaron su página de cotización y no terminaron."],
    ],
    rules: [
      ["Licencias y ofertas", "Los anuncios muestran los números de licencia donde su estado lo exige, y las ofertas incluyen sus condiciones reales y fechas de vencimiento."],
      ["Financiamiento", "Si anuncia financiamiento, se aplican los mismos límites de préstamo justo que a cualquier oferta de crédito."],
    ],
    faq: [startFaq("un negocio de servicios para el hogar"), liveFaq, ["¿Podemos pausar cuando tengamos la agenda llena?", "Sí. Puede pausar y reiniciar las campañas en su cuenta en cualquier momento."]],
  },
  franchise: {
    label: "Franquicias", who: "franquicia",
    headline: "Una marca, todas las ubicaciones, cada una con su propia zona y presupuesto.",
    intro: "Para franquiciantes y dueños de varias unidades que quieren publicidad de marca uniforme con resultados reportados ubicación por ubicación.",
    counts: ["Vistas de páginas de ubicación y solicitudes de indicaciones", "Pedidos, reservaciones o consultas por ubicación", "Formularios de consulta de franquicia"],
    campaigns: [
      ["Cada ubicación, su propia zona", "Cada unidad tiene una campaña alrededor de su propia dirección, para que las unidades vecinas no se traslapen."],
      ["Una nueva apertura", "Genere reconocimiento alrededor de una nueva ubicación en las semanas antes y después de que abra."],
      ["Desarrollo de franquicias", "Una campaña separada dirigida a posibles franquiciatarios en los mercados donde quiere crecer."],
    ],
    rules: [
      ["Estándares de marca", "Envíenos sus pautas de marca una sola vez y los anuncios de todas las ubicaciones se crean con base en ellas."],
      ["Publicidad para venta de franquicias", "Los anuncios que ofrecen una franquicia deben seguir las reglas de venta de franquicias y los requisitos de registro estatales. Su abogado de franquicias debe aprobarlos."],
    ],
    faq: [startFaq("una ubicación de franquicia"), liveFaq, ["¿Pueden los franquiciatarios ver solo su propia ubicación?", "Sí. Cada ubicación puede tener su propio acceso que muestra solo sus campañas y resultados."]],
  },
  hospitality: {
    label: "Hotelería y restaurantes", who: "negocio de hotelería o restaurantes",
    headline: "Llene habitaciones y mesas con personas que ya están planeando una visita.",
    intro: "Para hoteles, resorts, restaurantes, salones de eventos y atracciones que quieren reservaciones directas de los lugares de donde vienen sus huéspedes.",
    counts: ["Visitas al motor de reservaciones y reservaciones completadas", "Consultas de reservación y de eventos", "Vistas de páginas de menú y de ofertas"],
    campaigns: [
      ["Sus mercados de origen", "Muestre anuncios en las ciudades desde donde viajan sus huéspedes, no solo alrededor de su dirección."],
      ["Temporadas bajas", "Promueva disponibilidad entre semana, en temporada intermedia o de último minuto cuando la necesite."],
      ["Personas que vieron fechas y se fueron", "Recuérdeles a quienes revisaron disponibilidad y no reservaron."],
    ],
    rules: [
      ["Precios y cargos mostrados con honestidad", "Las tarifas anunciadas deben incluir los cargos obligatorios, como lo exigen las reglas de exhibición de precios."],
      ["Alcohol y juegos de azar", "Los anuncios que muestran alcohol o juegos de azar se muestran solo a adultos y requieren una revisión adicional de los intercambios publicitarios."],
    ],
    faq: [startFaq("un negocio de hotelería o restaurantes"), liveFaq, ["¿Podemos medir las reservaciones hechas en nuestro motor de reservaciones?", "Por lo general, sí. Colocamos el seguimiento en su página de confirmación de reservación, con ayuda de su proveedor de reservaciones si está en su sistema."]],
  },
  political: {
    label: "Política", who: "campaña o causa",
    headline: "Llegue a los votantes de su distrito en las pantallas que usan todos los días.",
    intro: "Para campañas de candidatos, comités y grupos de defensa que necesitan llegar a los votantes de un distrito definido antes de una fecha fija.",
    counts: ["Visitas a sus páginas de temas y del candidato", "Registros de voluntarios y de eventos", "Videos vistos hasta el final"],
    campaigns: [
      ["Solo su distrito", "Anuncios mostrados dentro de los límites que nos indique, por estado, condado, ciudad o código postal."],
      ["Presentar y luego recordar", "Video más largo al principio para presentar al candidato o el tema, y recordatorios más cortos al acercarse la votación."],
      ["Movilización del voto", "Un último impulso en los días antes del voto anticipado y del día de la elección."],
    ],
    rules: [
      ["Verificación de identidad y avisos", "Los anunciantes políticos se verifican antes de que se publiquen los anuncios, y cada anuncio lleva el aviso de quién lo pagó, como exige la ley electoral. Considere días adicionales para esto."],
      ["Algunos lugares e intercambios restringen los anuncios políticos", "Ciertos estados e intercambios publicitarios limitan o no aceptan publicidad política. Le decimos dónde pueden publicarse sus anuncios antes de que pague."],
      ["Fechas límite", `La configuración toma hasta ${SETUP_DAYS} días, más la verificación. Empiece pronto: no podemos acortar la revisión de un intercambio antes de una elección.`],
    ],
    faq: [startFaq("una campaña"), liveFaq, ["¿Se pueden limitar los anuncios a un solo distrito?", "Sí, por estado, condado, ciudad o código postal. Cuando un distrito atraviesa códigos postales, usamos la coincidencia más cercana y le decimos dónde quedan los bordes."]],
  },
};

/** An industry page in the reader's language. `name` stays English (it opens the demo); `label` is what to show. */
export function industryFor(i: Industry, lang: "en" | "es"): Industry & { label: string } {
  if (lang !== "es") return { ...i, label: i.name };
  return { ...i, ...ES[i.slug] };
}
export const industryPagesFor = (lang: "en" | "es") => INDUSTRY_PAGES.map((i) => industryFor(i, lang));
