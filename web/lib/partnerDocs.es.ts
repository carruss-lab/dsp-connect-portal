import type { Doc } from "./partnerDocs";
import { LEGAL_ENTITY, MIN_BUDGET, PARTNER_PCT } from "./site";

// Spanish translation of the Authorized Sales Partner documents, for partners who prefer Spanish.
// The English version controls (see the notice and section 12). Keep this in step with partnerDocs.ts:
// any change to the English wording must be made here too, and VERSION raised once for both.
// Prepared for review by counsel before it is offered for signature.

const CO = LEGAL_ENTITY;

export const ES_NOTICE = "Traducción para su conveniencia. Esta versión en español se ofrece solo como ayuda. La versión en inglés es la que rige y prevalece en caso de cualquier diferencia o conflicto de interpretación.";

export const DOCS_ES: Doc[] = [
  {
    id: "agreement",
    tag: "Acuerdo",
    title: "Acuerdo de Socio de Ventas Autorizado",
    sections: [
      { p: [ES_NOTICE] },
      { p: [
        `Este Acuerdo lo nombra Socio de Ventas Autorizado de DSP Connect, un servicio de ${CO} ("DSP Connect", "nosotros"). "Usted" significa la persona, o la empresa, cuyo nombre aparece donde se firma este Acuerdo. Entra en vigor cuando usted lo firma abajo. Junto con la Política de Compensación (Anexo A) y las Reglas de Operación (Anexo B), es el acuerdo completo entre usted y nosotros sobre el programa.`,
      ] },
      { h: "1. Su papel", p: [
        "Usted presenta negocios (\"clientes\") a DSP Connect y les ayuda a tener éxito en la plataforma. Usted actúa como contratista independiente. No es empleado, agente, socio en sentido legal, miembro ni funcionario de DSP Connect ni de " + CO + ", y no puede firmar nada ni hacer ninguna promesa en nuestro nombre.",
        "Usted decide su propio horario y sus métodos, aporta sus propias herramientas y paga sus propios gastos, impuestos y seguros. Nada en este Acuerdo crea una relación laboral, una franquicia ni una empresa conjunta.",
      ] },
      { h: "2. Firma en nombre de una empresa", p: [
        "Si usted firma en nombre de una empresa, la empresa es el Socio de Ventas Autorizado y la persona que firma confirma que está autorizada para obligarla. La empresa es responsable de todas las personas de la empresa que venden con su enlace de socio, y de asegurarse de que sigan las Reglas de Operación.",
      ] },
      { h: "3. Aprobación y prohibición de subagentes", p: [
        "Usted queda aprobado como Socio de Ventas Autorizado una vez que firma este Acuerdo y Stripe verifica su cuenta de pagos. Podemos rechazar una solicitud, y cualquiera de las partes puede terminar este Acuerdo conforme a la sección 6. Su nombramiento es personal (o de su empresa); no puede transferirlo. No puede nombrar subagentes, revendedores ni socios de referidos, ni permitir que nadie fuera de su empresa venda con su enlace de socio, salvo que lo aceptemos por escrito.",
      ] },
      { h: "4. Pago", p: [
        `Usted gana únicamente comisión en efectivo, según el Anexo A: el ${PARTNER_PCT}% del gasto publicitario calificado de los clientes acreditados a usted, mientras esos clientes sigan invirtiendo (comisiones recurrentes). No hay salario, anticipo, participación accionaria ni ingreso garantizado de ningún tipo. Cualquier descripción anterior de participación accionaria, propiedad o reparto de utilidades en DSP Connect o en ${CO} no se aplica a usted.`,
      ] },
      { h: "5. Los clientes pertenecen a DSP Connect", p: [
        "Toda cuenta, contrato, acceso, campaña y registro de cliente pertenece a DSP Connect. Los clientes contratan con DSP Connect y le pagan directamente. Usted no puede recibir pagos de un cliente, guardar dinero de un cliente ni fijar el precio de un cliente.",
      ] },
      { h: "6. Vigencia y terminación", p: [
        "Este Acuerdo sigue vigente hasta que alguna de las partes lo termine. Cualquiera de las partes puede terminarlo en cualquier momento con 30 días de aviso por escrito enviado por correo electrónico. Podemos terminarlo de inmediato por causa justificada: si usted incumple las Reglas de Operación o este Acuerdo, actúa de forma deshonesta o perjudica a un cliente o a DSP Connect.",
        "Las comisiones recurrentes continúan después de que termine este Acuerdo. Si termina por cualquier motivo que no sea causa justificada, usted sigue ganando comisión sobre el gasto publicitario calificado de los clientes acreditados a usted antes de la fecha de terminación, mientras sigan invirtiendo, conforme al Anexo A, siempre que mantenga una cuenta de pagos activa y cumpla las secciones 7 y 8. Ningún cliente puede acreditarse a usted después de la fecha de terminación.",
        "Si terminamos este Acuerdo por causa justificada, o usted incumple la sección 7 u 8 después de que termine, las comisiones recurrentes se detienen: la comisión se paga solo sobre el gasto publicitario calificado hasta la fecha en que lo terminemos o en que usted incumpla esas secciones, menos cualquier reversión conforme al Anexo A.",
      ] },
      { h: "7. Información confidencial", p: [
        "Usted mantendrá en confidencialidad todo lo que sepa sobre DSP Connect que no sea público, incluidos nuestros proveedores de tecnología, costos, márgenes, precios internos, listas de clientes y datos de clientes, durante este Acuerdo y después de que termine. Puede usar la información de un cliente solo para atender a ese cliente a través de DSP Connect.",
      ] },
      { h: "8. No captación", p: [
        "Mientras este Acuerdo esté vigente y durante 12 meses después de que termine, usted no pedirá a ningún cliente acreditado a usted que lleve su publicidad programática fuera de DSP Connect, ni pedirá a ningún miembro del personal de DSP Connect ni a ningún Socio de Ventas Autorizado que se vaya. Esto no le impide trabajar en publicidad ni atender a quien llegue a usted sin que usted lo haya buscado.",
      ] },
      { h: "9. Nuestros materiales", p: [
        "La demostración, la capacitación, los materiales de venta, la marca y todo lo que le proporcionamos siguen siendo nuestros. Puede usarlos solo mientras sea Socio de Ventas Autorizado y solo para presentar clientes a DSP Connect.",
      ] },
      { h: "10. Responsabilidad", p: [
        "Ninguna de las partes es responsable ante la otra por pérdidas indirectas o consecuentes. Nuestra responsabilidad total ante usted conforme a este Acuerdo se limita a la comisión pagada a usted en los 3 meses anteriores al reclamo. Usted cubrirá cualquier pérdida que suframos porque usted, o cualquier persona que venda con su enlace de socio, haya incumplido las Reglas de Operación o la ley.",
      ] },
      { h: "11. Disposiciones generales", p: [
        `Este Acuerdo se rige por las leyes del estado en el que ${CO} está constituida. Podemos actualizar los Anexos enviándole un correo electrónico 30 días antes de que el cambio entre en vigor; si usted sigue vendiendo después de esa fecha, acepta el cambio. Un cambio en la tasa del Anexo A se aplica solo al gasto posterior a la entrada en vigor del cambio. Los avisos se dan por correo electrónico a la dirección registrada en su ficha de socio.`,
      ] },
      { h: "12. Idioma", p: [
        "Este Acuerdo y sus Anexos se redactaron en inglés. Esta traducción al español se proporciona solo para su conveniencia. Si hay alguna diferencia entre la versión en inglés y esta traducción, prevalece la versión en inglés. Al firmar, usted acepta los documentos en inglés y confirma que tuvo la oportunidad de leerlos o de pedir que se los expliquen.",
      ] },
    ],
  },
  {
    id: "compensation",
    tag: "Anexo A",
    title: "Política de Compensación",
    sections: [
      { p: [ES_NOTICE] },
      { h: "1. Tasa", p: [`Usted gana el ${PARTNER_PCT}% del gasto publicitario calificado de cada cliente acreditado a usted.`] },
      { h: "2. Qué clientes se le acreditan", p: [
        "Un cliente se le acredita cuando abre su cuenta de DSP Connect con su enlace de socio o con su código de socio, después de que usted haya firmado este Acuerdo. Un cliente no puede acreditarse a más de un socio. Si un cliente ya estaba en contacto con DSP Connect antes de que usted lo presentara, decidimos de buena fe a quién se le acredita, y nuestra decisión es definitiva.",
      ] },
      { h: "3. Comisiones recurrentes", p: [
        "Un cliente sigue acreditado a usted mientras su cuenta de DSP Connect esté abierta, incluso después de que termine este Acuerdo, salvo lo que dice la sección 6 del Acuerdo. Usted sigue ganando sobre cada dólar de gasto publicitario calificado de ese cliente, mes tras mes, sin tope y sin fecha de fin.",
      ] },
      { h: "4. Gasto publicitario calificado", p: [
        "El gasto publicitario calificado es el presupuesto publicitario que el cliente pagó por completo a DSP Connect y que realmente se invirtió en sus anuncios, según los registros de DSP Connect.",
        "No son gasto publicitario calificado: el presupuesto aún no invertido; los montos reembolsados al cliente; los montos disputados, con contracargo o revertidos por el banco del cliente; los montos no pagados o dados de baja; los impuestos y las comisiones de procesamiento de pagos; y cualquier gasto en una cuenta abierta incumpliendo las Reglas de Operación.",
      ] },
      { h: "5. Cuándo se le paga", p: [
        "La comisión por el gasto publicitario calificado de cada día se retiene 7 días y luego se paga a diario a su cuenta bancaria a través de Stripe. Usted debe crear y mantener una cuenta de pagos de Stripe a su nombre, o a nombre de su empresa si firmó por una empresa; no podemos pagarle hasta que esté activa.",
        "Usted da sus datos bancarios y fiscales directamente a Stripe. Usted es responsable de sus propios impuestos. Podemos emitir formularios fiscales según lo exija la ley.",
      ] },
      { h: "6. Reversiones", p: [
        "Si un gasto que generó comisión deja después de ser calificado (por ejemplo, por un reembolso o un contracargo), la comisión sobre ese gasto se revierte. Si todavía no se pagó, se cancela. Si ya se pagó, se descuenta de sus próximos pagos. Si no tiene más comisión para descontar dentro de 90 días, la devolverá dentro de los 30 días siguientes a nuestra solicitud.",
      ] },
      { h: "7. Su estado de cuenta", p: [
        "Su portal de socio muestra cada cliente acreditado, su gasto, la comisión ganada, la comisión retenida y los pagos realizados. Si cree que algo está mal, avísenos dentro de los 60 días siguientes al pago; de lo contrario, se considera correcto.",
      ] },
    ],
  },
  {
    id: "rules",
    tag: "Anexo B",
    title: "Reglas de Operación",
    sections: [
      { p: [ES_NOTICE] },
      { h: "1. Venta honesta", p: [
        "Describa DSP Connect con precisión y solo como lo describen nuestros materiales actuales. Nunca prometa ni estime resultados, clientes potenciales, ventas, posiciones ni retorno de la inversión publicitaria. Nunca diga que una oferta es limitada o que está por terminar cuando no lo es.",
        `Diga los precios exactamente como los publicamos: las cuentas empiezan con un presupuesto publicitario de $${MIN_BUDGET}; no hay cuota mensual de plataforma; nuestra tarifa está incluida en el precio de los anuncios. Nunca cotice un precio, descuento o tarifa diferente.`,
      ] },
      { h: "2. Lo que nunca debe decir", p: [
        "Nunca nombre ni describa a nuestros proveedores de tecnología, nuestros costos, márgenes, recargos ni cómo se calcula nuestra tarifa.",
        "Nunca ofrezca manejar, administrar ni optimizar las campañas de un cliente por él, ni ofrezca ningún servicio que no vendemos. DSP Connect configura las cuentas; el cliente las maneja con nuestra ayuda.",
        "Nunca aconseje a un cliente agregar dinero, subir su presupuesto ni gastar más. En su lugar, dé consejos sobre creatividad, audiencia, zonas, seguimiento, páginas de destino y ritmo de gasto.",
        "Nunca se presente como personal de DSP Connect, ni como un revendedor que fija precios o factura a clientes. Preséntese como Socio de Ventas Autorizado independiente de DSP Connect.",
      ] },
      { h: "3. Dinero y datos de clientes", p: [
        "Los clientes siempre pagan directamente a DSP Connect en nuestro sitio web. Nunca reciba, guarde ni reenvíe el dinero, los datos de tarjeta ni las contraseñas de un cliente. Use la información de un cliente solo para ayudarle en DSP Connect, y manténgala segura.",
      ] },
      { h: "4. Mercadeo", p: [
        "No envíe correos, mensajes de texto ni mensajes masivos a personas que no hayan aceptado recibirlos, y cumpla las leyes contra el spam y de privacidad donde usted y el cliente se encuentren. No compre anuncios con nuestra marca ni registre dominios o cuentas de redes sociales que usen \"DSP Connect\".",
      ] },
      { h: "5. Capacitación y soporte", p: [
        "Complete la capacitación de Socio de Ventas Autorizado en su portal antes de presentar clientes; si firmó por una empresa, asegúrese de que todas las personas que venden con su enlace aprendan el mismo material y sigan estas reglas. Envíe las preguntas de clientes sobre facturación, reembolsos, cancelaciones o acceso a la cuenta al soporte de DSP Connect en lugar de responderlas usted.",
      ] },
      { h: "6. Incumplimiento de las reglas", p: [
        "Si usted incumple estas reglas, podemos retener o revertir la comisión de las cuentas afectadas, pausar su enlace de socio o terminar este Acuerdo por causa justificada, lo que detiene las comisiones recurrentes.",
      ] },
    ],
  },
];
