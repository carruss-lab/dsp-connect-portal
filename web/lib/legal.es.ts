import type { Part } from "@/components/Legal";
import { LEGAL_ENTITY, MIN_BUDGET, SETUP_DAYS } from "./site";

// Spanish translations of the client terms, privacy policy and refund policy. The English versions
// control; each Spanish page says so at the top. Keep in step with the English pages.

export const LEGAL_NOTICE_ES = "Traducción para su conveniencia. La versión en inglés de este documento es la que rige y prevalece en caso de cualquier diferencia.";

export const TERMS_ES: Part[] = [
  ["Entre quiénes son estos términos", [
    `Estos términos son un acuerdo entre usted (el negocio que abre una cuenta) y ${LEGAL_ENTITY}, que presta el servicio DSP Connect ("nosotros"). Al marcar "Acepto" y pagar, usted los acepta.`,
  ]],
  ["Lo que ofrecemos", [
    "DSP Connect le permite mostrar anuncios de banner, video y nativos en apps y sitios web. Configuramos su cuenta por usted: creamos la cuenta y cargamos su presupuesto, colocamos el seguimiento en su sitio web, revisamos sus anuncios y armamos su primera audiencia. Después, usted maneja sus campañas en su cuenta, con nuestra ayuda cuando la pida.",
  ]],
  [`Configuración en ${SETUP_DAYS} días`, [
    `Tendremos sus anuncios listos para activarse en un plazo de ${SETUP_DAYS} días desde que recibamos su pago. Para lograrlo necesitamos dos cosas de usted en los 5 días siguientes al pago: sus anuncios (imágenes o video, su logotipo y la página web a la que deben llegar las personas) y acceso para el seguimiento (la persona que puede agregar un pequeño fragmento de código a su sitio web).`,
    `Si los recibimos después, los ${SETUP_DAYS} días cuentan desde el día en que tengamos ambas cosas. Si no cumplimos la fecha por razones bajo nuestro control, usted puede cancelar y recibir el reembolso completo de su presupuesto publicitario.`,
  ]],
  ["Su presupuesto publicitario y nuestra tarifa", [
    `Usted paga su presupuesto publicitario por adelantado. El presupuesto inicial mínimo es de $${MIN_BUDGET}. Sus anuncios se muestran hasta que se use el presupuesto; luego se pausan hasta que agregue más. Agregar presupuesto siempre es decisión suya.`,
    "No hay cuota mensual de plataforma. Nuestra tarifa está incluida en el precio de sus anuncios. Los precios que se muestran en su cuenta son los precios que usted paga.",
    "Los pagos los procesa Stripe. Nosotros no vemos ni guardamos los datos de su tarjeta ni de su banco.",
  ]],
  ["Cancelación y reembolsos", [
    "No hay contrato a largo plazo. Puede cancelar en cualquier momento. Lo que se reembolsa se explica en nuestra Política de reembolsos, que forma parte de estos términos.",
  ]],
  ["Sus anuncios y su sitio web", [
    "Usted es responsable de sus anuncios y de las páginas a las que llevan. Deben ser veraces, usted debe tener derecho a usarlos y deben cumplir la ley y las reglas de su industria (por ejemplo, las reglas sobre publicidad de salud, legal, financiera, de vivienda, de empleo, de crédito y política).",
    "Nosotros y los intercambios publicitarios que muestran sus anuncios podemos rechazar o retirar cualquier anuncio. No mostramos anuncios de productos o servicios ilegales, anuncios engañosos ni anuncios que se dirijan a personas de formas que la ley prohíbe.",
  ]],
  ["Resultados", [
    "Los resultados de la publicidad dependen de muchas cosas fuera de nuestro control, como su oferta, sus anuncios, su sitio web y su mercado. No prometemos ningún número de vistas, clics, clientes potenciales ni ventas. Las cifras de la cuenta de demostración son datos de ejemplo, no un pronóstico.",
  ]],
  ["Sus datos y los nuestros", [
    "Los datos de su cuenta y los resultados de sus campañas le pertenecen. Los usamos para prestar el servicio y, de forma combinada que no lo identifica, para mejorarlo. Cómo manejamos la información personal se explica en nuestra Política de privacidad.",
  ]],
  ["Límites de nuestra responsabilidad", [
    "En la medida en que la ley lo permita: el servicio se presta tal como está; no somos responsables por pérdidas indirectas ni por ganancias perdidas; y nuestra responsabilidad total ante usted por cualquier reclamo se limita a la cantidad que nos pagó en los tres meses anteriores a que surgiera el reclamo.",
  ]],
  ["Cambios y terminación del acuerdo", [
    "Podemos actualizar estos términos. Si un cambio lo afecta de manera importante, le enviaremos un correo al menos 14 días antes de que se aplique. Podemos suspender o cerrar una cuenta que incumpla estos términos; si lo hacemos, cualquier presupuesto publicitario no invertido se reembolsa según la Política de reembolsos.",
    `Estos términos se rigen por las leyes del estado en el que ${LEGAL_ENTITY} está constituida. Si hay alguna diferencia entre esta traducción y la versión en inglés, prevalece la versión en inglés.`,
  ]],
];

export const PRIVACY_ES: Part[] = [
  ["Quiénes somos", [`DSP Connect es un servicio de ${LEGAL_ENTITY}. Esta política cubre este sitio web y el servicio DSP Connect.`]],
  ["Qué recopilamos", [
    "Lo que usted nos da: su nombre, nombre del negocio, correo, teléfono, sitio web, industria, zona, presupuesto y objetivos, cuando abre la demostración, abre una cuenta, pregunta por un acuerdo para agencias o nos escribe.",
    "Datos de pago: su pago lo recibe Stripe. Nosotros recibimos la confirmación y el monto. Nunca vemos ni guardamos los datos completos de su tarjeta o de su banco.",
    "Cómo se usa el sitio: páginas visitadas, la página o campaña que lo trajo aquí, e información general del dispositivo y del navegador. La usamos de forma combinada para ver qué páginas son útiles. No usamos cookies publicitarias en este sitio web.",
    "Los datos que escribe en nuestros formularios (como su nombre, negocio, industria y zona) también se recuerdan en su propio navegador, para que el sitio pueda saludarlo, llenar formularios por usted y llevarlo de vuelta a su demostración o a su página de configuración. Se quedan en su dispositivo; use \"¿No es usted?\" en la parte superior de cualquier página para borrarlos.",
    "Mensajes: lo que nos envía por chat o correo, para poder responder y llevar un registro.",
  ]],
  ["Para qué lo usamos", [
    "Para abrir la demostración y su cuenta, configurar su publicidad, recibir pagos, enviarle avances de la configuración y resúmenes de su cuenta, responder sus preguntas, mantener el servicio seguro y cumplir nuestras obligaciones legales.",
    "Si empieza a abrir una cuenta y no termina, podemos enviarle un recordatorio. Cada recordatorio tiene un enlace para cancelar la suscripción, y lo respetamos.",
  ]],
  ["Con quién lo compartimos", [
    "Con empresas que nos ayudan a operar el servicio, solo en la medida en que lo necesitan: nuestro proveedor de pagos (Stripe), nuestro proveedor de mensajería y atención al cliente (Intercom), nuestro proveedor de envío de correos, nuestros proveedores de alojamiento del sitio y de la base de datos, y los socios de tecnología publicitaria que entregan sus anuncios.",
    "No vendemos su información personal. La divulgamos si la ley lo exige, o como parte de una venta o fusión del negocio, con las mismas protecciones.",
  ]],
  ["Información sobre las personas que ven los anuncios", [
    "Los anuncios se entregan usando señales como la ubicación general, el tipo de dispositivo y el tipo de app o sitio web que se está viendo. Si coloca nuestro código de seguimiento en su sitio web, este registra visitas y acciones para que vea lo que produjeron sus anuncios. Usted es responsable de informar de esto a los visitantes de su propio sitio web en su política de privacidad.",
  ]],
  ["Cuánto tiempo lo guardamos", [
    "Los registros de cuenta y de pagos se guardan mientras sea cliente y durante siete años después, por razones fiscales y legales. Las consultas que no se convierten en cuentas se eliminan después de 24 meses.",
  ]],
  ["Sus opciones", [
    "Puede pedirnos una copia de su información, pedirnos que la corrijamos o la eliminemos, o decirnos que dejemos de enviarle correos. Escríbanos y responderemos en un plazo de 30 días. Según dónde viva, puede tener otros derechos bajo la ley de privacidad de su estado; atendemos esas solicitudes de cualquier persona, viva donde viva.",
  ]],
  ["Seguridad y menores", [
    "Limitamos el acceso a las personas que lo necesitan, ciframos los datos en tránsito y usamos proveedores con certificaciones de seguridad reconocidas. Ningún sistema es perfectamente seguro; si una filtración lo afecta, se lo informaremos como lo exige la ley.",
    "El servicio es para negocios. No está dirigido a menores, y no recopilamos a sabiendas información de nadie menor de 16 años.",
  ]],
  ["Cambios", ["Si cambiamos esta política de una manera que importe, publicaremos la nueva versión aquí y enviaremos un correo a los clientes antes de que se aplique."]],
];

export const REFUNDS_ES: Part[] = [
  ["En pocas palabras", [
    "No hay contrato a largo plazo. Puede cancelar en cualquier momento enviándonos un correo. El presupuesto publicitario que no se haya invertido se reembolsa. El presupuesto ya invertido en anuncios que se mostraron, no.",
  ]],
  ["Si cancela antes de que sus anuncios estén activos", [
    "Reembolsamos su presupuesto publicitario completo, menos la comisión de procesamiento de tarjeta o banco que nuestro proveedor de pagos retiene sobre el pago original.",
    `Si no cumplimos la fecha de configuración de ${SETUP_DAYS} días por razones bajo nuestro control, reembolsamos su presupuesto publicitario completo, sin descontar nada.`,
  ]],
  ["Si cancela después de que sus anuncios estén activos", [
    "Detenemos sus anuncios en un plazo de 2 días hábiles desde su solicitud. Reembolsamos la parte no invertida de su presupuesto publicitario, menos la comisión de procesamiento sobre ese monto. El dinero ya invertido en anuncios que se mostraron no se puede reembolsar.",
  ]],
  ["Cómo y cuándo se le devuelve", [
    "Los reembolsos se hacen a la tarjeta o cuenta bancaria con la que pagó, en un plazo de 10 días hábiles desde su solicitud. Su banco puede tardar unos días más en reflejarlo.",
  ]],
  ["Anuncios que no se mostraron como debían", [
    "Si cree que sus anuncios se mostraron de una forma que no coincide con la configuración de su campaña, avísenos en un plazo de 30 días. Lo investigaremos y, cuando la falla sea nuestra o del intercambio publicitario, le acreditaremos el monto afectado a su presupuesto publicitario.",
  ]],
];
