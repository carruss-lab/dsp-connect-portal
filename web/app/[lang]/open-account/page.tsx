import type { Metadata } from "next";
import { Footer, Header, TalkBand } from "@/components/Chrome";
import LeadForm from "@/components/LeadForm";
import { Hello } from "@/components/Personal";
import { MIN_BUDGET, SETUP_DAYS } from "@/lib/site";
import { ADS_SERVICE, JsonLd, pageGraph, pageMeta } from "@/lib/seo";
import { getLang } from "@/lib/lang";
import { tr } from "@/lib/i18n";

const desc = (t: ReturnType<typeof tr>) => t(`Fill in your details, pay your ad budget online, and be live within ${SETUP_DAYS} days.`, `Llene sus datos, pague su presupuesto de anuncios en línea y esté activo en ${SETUP_DAYS} días.`);
export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang(); const t = tr(lang);
  return pageMeta({ lang, title: t("Open your account", "Abra su cuenta"), description: desc(t), path: "/open-account" });
}

export default async function OpenAccount() {
  const lang = await getLang(); const t = tr(lang);
  const DESCRIPTION = desc(t);
  return (
    <>
      <JsonLd data={pageGraph({ lang, path: "/open-account", name: t("Open your account", "Abra su cuenta"), description: DESCRIPTION, trail: [[t("Home", "Inicio"), "/"], [t("Open your account", "Abra su cuenta"), "/open-account"]], main: ADS_SERVICE })} />
      <Header />
      <main className="wrap" style={{ padding: "64px 32px 80px", display: "flex", flexWrap: "wrap", gap: 56, alignItems: "flex-start" }}>
        <div className="stack g24" style={{ flex: "1 1 380px", minWidth: 0 }}>
          <div className="eyebrow">{t("Open your account", "Abra su cuenta")}</div>
          <h1 className="h1" style={{ fontSize: "clamp(32px,4.4vw,46px)" }}><Hello withName={t("{name}, tell us about {business}. We set up the rest.", "{name}, cuéntenos sobre {business}. Nosotros configuramos el resto.")} fallback={t("Tell us about your business. We set up the rest.", "Cuéntenos sobre su negocio. Nosotros configuramos el resto.")} /></h1>
          <p className="lead">{t(`One form, one payment, and your ads are live within ${SETUP_DAYS} days.`, `Un formulario, un pago, y sus anuncios están activos en ${SETUP_DAYS} días.`)}</p>
          <ol className="list" style={{ fontSize: 15 }}>
            <li>{t("Fill in this form.", "Llene este formulario.")}</li>
            <li>{t(`Pay your starting ad budget (minimum $${MIN_BUDGET}).`, `Pague su presupuesto inicial de anuncios (mínimo $${MIN_BUDGET}).`)}</li>
            <li>{t("We create your account, place your tracking, review your ads and build your audience.", "Creamos su cuenta, instalamos su seguimiento, revisamos sus anuncios y creamos su audiencia.")}</li>
            <li>{t("You get your login and your ads go live.", "Recibe su acceso y sus anuncios salen al aire.")}</li>
          </ol>
        </div>
        <div className="card stack g16" style={{ flex: "1 1 420px", maxWidth: 560, minWidth: 0, background: "var(--ground)" }}>
          <LeadForm kind="account" cta={t("Continue to payment", "Continuar al pago")} />
        </div>
      </main>
      <TalkBand />
      <Footer />
    </>
  );
}
