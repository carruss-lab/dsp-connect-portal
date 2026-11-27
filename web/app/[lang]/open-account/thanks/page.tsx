import type { Metadata } from "next";
import Link from "@/components/Link";
import { Remember } from "@/components/Personal";
import TrackPurchase from "@/components/TrackPurchase";
import { Footer, Header } from "@/components/Chrome";
import { markPaid, stripe } from "@/lib/payments";
import { SETUP_DAYS } from "@/lib/site";
import { getLang } from "@/lib/lang";
import { tr } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  return { title: tr(await getLang())("Thank you", "Gracias"), robots: { index: false } };
}

export default async function Thanks({ searchParams }: PageProps<"/[lang]/open-account/thanks">) {
  const q = await searchParams;
  const lang = await getLang(); const t = tr(lang);
  const id = Array.isArray(q.session_id) ? q.session_id[0] : q.session_id;
  let state: "paid" | "pending" | "error" = "error";
  let lead = "";
  let amount = 0;
  const client = stripe();
  if (client && id && /^cs_[A-Za-z0-9_]+$/.test(id)) {
    try {
      const session = await client.checkout.sessions.retrieve(id);
      state = await markPaid(session);
      lead = session.client_reference_id || "";
      amount = (session.amount_total || 0) / 100;
    } catch (err) {
      console.error("thanks lookup failed", err);
    }
  }
  const copy = {
    paid: [t("Payment received. Your setup has started.", "Pago recibido. Su configuración ya empezó."), t(`We now create your account, place your tracking, review your ads and build your audience. You will be live within ${SETUP_DAYS} days, and we will email you at each step.`, `Ahora creamos su cuenta, instalamos su seguimiento, revisamos sus anuncios y creamos su audiencia. Estará activo en ${SETUP_DAYS} días, y le escribiremos en cada paso.`)],
    pending: [t("Thank you. Your payment is on its way.", "Gracias. Su pago está en camino."), t(`Bank transfers take a few days to clear. Your ${SETUP_DAYS}-day setup starts as soon as the payment arrives, and we will email you when it does.`, `Las transferencias bancarias tardan unos días en acreditarse. Su configuración de ${SETUP_DAYS} días empieza en cuanto llegue el pago, y le avisaremos por correo.`)],
    error: [t("We could not confirm your payment yet.", "Todavía no pudimos confirmar su pago."), t("If you completed payment, you do not need to pay again. We will confirm by email. If you did not, you can start again below.", "Si completó el pago, no necesita pagar de nuevo. Le confirmaremos por correo. Si no lo completó, puede empezar de nuevo abajo.")],
  }[state];
  return (
    <>
      <Header />
      <main className="wrap stack g24" style={{ padding: "96px 32px", maxWidth: 720 }}>
        <h1 className="h1" style={{ fontSize: "clamp(30px,4vw,42px)" }}>{copy[0]}</h1>
        <p className="lead">{copy[1]}</p>
        {state === "paid" && lead && <Remember stage="paid" setup={lead} />}
        {state === "paid" && id && amount > 0 && <TrackPurchase id={id} value={amount} />}
        {state === "paid" && lead && (
          <div className="card stack g12" style={{ background: "var(--ground)" }}>
            <h2 className="h3" style={{ fontSize: 18 }}>{t("One thing we need from you", "Una cosa que necesitamos de usted")}</h2>
            <p className="p">{t("Your campaign brief, within 5 days: your goals, your customers, the campaigns you want, your ads and your website. It takes about ten minutes, and the same page shows your setup progress.", "El resumen de su campaña, en un plazo de 5 días: sus metas, sus clientes, las campañas que quiere, sus anuncios y su sitio web. Toma unos diez minutos, y la misma página muestra el avance de su configuración.")}</p>
            <Link className="btn btn-blue" href={`/welcome?id=${lead}`} style={{ alignSelf: "flex-start" }}>{t("Fill in your campaign brief", "Llenar el resumen de su campaña")}</Link>
            <p className="small">{t("We have also emailed you this link. Your login details arrive in separate emails once your account is approved.", "También le enviamos este enlace por correo. Sus datos de acceso llegan en correos aparte cuando se apruebe su cuenta.")}</p>
          </div>
        )}
        {state === "error" && <Link className="btn btn-line" href="/open-account" style={{ alignSelf: "flex-start" }}>{t("Back to the form", "Volver al formulario")}</Link>}
      </main>
      <Footer />
    </>
  );
}
