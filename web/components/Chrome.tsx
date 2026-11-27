"use client";
import Image from "next/image";
import Link from "@/components/Link";
import { WelcomeBar } from "./Personal";
import LangSwitch from "./LangSwitch";
import { useT } from "@/lib/useLang";
import { HELP_URL, LEGAL_ENTITY, LOGIN_URL, PARTNERSTACK_AGENCY_URL, SUPPORT_EMAIL } from "@/lib/site";

export function Header() {
  const t = useT();
  return (
    <>
    <header className="header">
      <div className="wrap">
        <Link href="/" className="brand">
          <Image src="/logo.png" alt="" width={30} height={30} />
          DSP Connect
        </Link>
        <nav className="nav" aria-label={t("Main", "Principal")}>
          <Link href="/#how">{t("How it works", "Cómo funciona")}</Link>
          <Link href="/#who">{t("Who it is for", "Para quién es")}</Link>
          <Link href="/industries">{t("Industries", "Industrias")}</Link>
          <Link href="/agencies">{t("For agencies", "Para agencias")}</Link>
          <Link href="/compare">{t("How we compare", "Comparaciones")}</Link>
          <Link href="/videos">{t("Videos", "Videos")}</Link>
          <Link href="/planner">{t("Free ad plan", "Plan gratis")}</Link>
        </nav>
        <LangSwitch />
        {LOGIN_URL && <a className="navlink" href={LOGIN_URL} style={{ color: "var(--ink)" }}>{t("Log in", "Iniciar sesión")}</a>}
        <Link className="btn btn-blue" href="/#market">{t("See the demo", "Ver la demo")}</Link>
      </div>
    </header>
    <WelcomeBar />
    </>
  );
}

export function Footer() {
  const t = useT();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="stack g8">
          <div>© {new Date().getFullYear()} {LEGAL_ENTITY}. {t("DSP Connect is a service of", "DSP Connect es un servicio de")} {LEGAL_ENTITY}.</div>
          <div><a href={`mailto:${SUPPORT_EMAIL}`} style={{ marginLeft: 0 }}>{SUPPORT_EMAIL}</a></div>
        </div>
        <nav aria-label={t("Footer", "Pie de página")}>
          {LOGIN_URL && <a href={LOGIN_URL}>{t("Client log in", "Acceso de clientes")}</a>}
          <Link href="/about">{t("About", "Quiénes somos")}</Link>
          <Link href="/industries">{t("Industries", "Industrias")}</Link>
          <Link href="/agencies">{t("Agencies", "Agencias")}</Link>
          <Link href="/partners">{t("Sales Partners", "Socios de Ventas")}</Link>
          <Link href="/compare">{t("Comparisons", "Comparaciones")}</Link>
          <Link href="/videos">Videos</Link>
          <Link href="/planner">{t("Ad planner", "Planificador de anuncios")}</Link>
          <a href={HELP_URL}>{t("Help center", "Centro de ayuda")}</a>
          <Link href="/terms">{t("Terms", "Términos")}</Link>
          <Link href="/refunds">{t("Refunds", "Reembolsos")}</Link>
          <Link href="/privacy">{t("Privacy", "Privacidad")}</Link>
        </nav>
      </div>
    </footer>
  );
}

/** A plain band that offers the two next steps: see the demo, then open an account. */
export function TalkBand({ industry, agency = false }: { industry?: string; agency?: boolean }) {
  const t = useT();
  if (agency) {
    return (
      <section className="section dark" style={{ padding: "64px 0" }}>
        <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center", justifyContent: "space-between" }}>
          <div className="stack g12" style={{ flex: "1 1 460px", minWidth: 0 }}>
            <h2 className="h2">{t("Ready to join the agency program?", "¿Listo para unirse al programa de agencias?")}</h2>
            <p className="p" style={{ fontSize: 16 }}>{t("Apply on PartnerStack in a couple of minutes. That is where you sign up and set up your payouts. Questions? Ask Fin in the chat, any hour.", "Solicite su ingreso en PartnerStack en un par de minutos. Ahí se registra y configura sus pagos. ¿Preguntas? Pregúntele a Fin en el chat, a cualquier hora.")}</p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a className="btn btn-white" href={PARTNERSTACK_AGENCY_URL} target="_blank" rel="noopener noreferrer">{t("Join the agency program", "Unirse al programa de agencias")}</a>
            <Link className="btn btn-line" style={{ borderColor: "#fff", color: "#fff" }} href="/demo?view=agency">{t("See the agency demo", "Ver la demo para agencias")}</Link>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="section dark" style={{ padding: "64px 0" }}>
      <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center", justifyContent: "space-between" }}>
        <div className="stack g12" style={{ flex: "1 1 460px", minWidth: 0 }}>
          <h2 className="h2">{t("See it first. Start when you are ready.", "Véalo primero. Empiece cuando esté listo.")}</h2>
          <p className="p" style={{ fontSize: 16 }}>{t("Open the demo account in under a minute and click through every screen. Questions? Ask Fin in the chat, any hour.", "Abra la cuenta de demostración en menos de un minuto y recorra cada pantalla. ¿Preguntas? Pregúntele a Fin en el chat, a cualquier hora.")}</p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="btn btn-white" href={industry ? `/?industry=${encodeURIComponent(industry)}#market` : "/#market"}>{t("See the demo", "Ver la demo")}</Link>
          <Link className="btn btn-line" style={{ borderColor: "#fff", color: "#fff" }} href="/open-account">{t("Open your account", "Abra su cuenta")}</Link>
        </div>
      </div>
    </section>
  );
}
