"use client";
import Link from "@/components/Link";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/useLang";
import { industryName, tr } from "@/lib/i18n";
import { forgetProfile, onProfile, readProfile, saveProfile, type Profile } from "@/lib/profile";

/** Reads the visitor's remembered details after the page loads, and stays current when they change. */
export function useProfile(): Profile | null {
  const [p, setP] = useState<Profile | null>(null);
  useEffect(() => { setP(readProfile()); return onProfile(() => setP(readProfile())); }, []);
  return p;
}

const demoLink = (p: Profile) => `/demo?${new URLSearchParams({ industry: p.industry || "", market: p.market || "" })}`;

/** A slim welcome-back line under the header, with the visitor's next step. */
export function WelcomeBar() {
  const p = useProfile();
  const lang = useLang();
  const t = tr(lang);
  if (!p) return null;
  const name = "";
  // Show it to anyone who has told us something: most demo visitors give only an email, industry and area.
  if (!name && !p.business && !p.stage && !p.email) return null;
  let next: [string, string] | null = null;
  if (p.stage === "paid" && p.setup) next = [t("Go to your setup page", "Ir a su página de configuración"), `/welcome?id=${p.setup}`];
  else if (p.stage === "signup") next = [t("Finish opening your account", "Termine de abrir su cuenta"), "/open-account"];
  else if (p.stage === "demo") next = [p.industry && p.market ? t(`Your ${p.industry.toLowerCase()} demo for ${p.market}`, `Su demo de ${industryName(p.industry, "es").toLowerCase()} para ${p.market}`) : t("Back to your demo", "Volver a su demo"), demoLink(p)];
  else if (p.stage === "agency") next = [t("Open the agency demo", "Abrir la demo para agencias"), "/demo?view=agency"];
  return (
    <div style={{ background: "#EEF0FF", borderBottom: "1px solid #DADDF7", fontSize: 14 }}>
      <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", alignItems: "center", padding: "8px 32px" }}>
        <span>{t("Welcome back.", "Bienvenido de nuevo.")}{p.stage !== "agency" && p.industry ? t(` Ads for your ${p.industry.toLowerCase()} business${p.market ? ` in ${p.market}` : ""}.`, ` Anuncios para su negocio de ${industryName(p.industry, "es").toLowerCase()}${p.market ? ` en ${p.market}` : ""}.`) : ""}</span>
        {next && <Link href={next[1]} style={{ fontWeight: 600 }}>{next[0]} →</Link>}
        {p.stage === "demo" && <Link href="/open-account" style={{ fontWeight: 600 }}>{t("Open your account", "Abra su cuenta")} →</Link>}
        <button onClick={forgetProfile} style={{ marginLeft: "auto", background: "none", border: 0, color: "#5B6577", cursor: "pointer", fontSize: 13, textDecoration: "underline" }}>{t("Not you?", "¿No es usted?")}</button>
      </div>
    </div>
  );
}

/** Text that changes with what we know, e.g. a heading that uses the visitor's name. */
export function Hello({ withName, fallback }: { withName: string; fallback: string }) {
  const p = useProfile();
  const lang = useLang();
  const name = ""; // names are never shown on the public site
  const biz = ""; // business names are never shown on the public site
  if (!p || (!name && withName.includes("{name}")) || (!biz && withName.includes("{business}"))) return <>{fallback}</>;
  return <>{withName.replace("{name}", name).replace("{business}", biz).replace("{market}", p.market || (lang === "es" ? "su zona" : "your area"))}</>;
}

/** On an industry page: a line for visitors from that industry, pointing at their own demo. */
export function IndustryNote({ industry }: { industry: string }) {
  const p = useProfile();
  const t = tr(useLang());
  if (!p || p.industry !== industry) return null;
  return (
    <p className="note note-ok" style={{ maxWidth: 720 }}>
      {t("This is the page for businesses like yours", "Esta es la página para negocios como el suyo")}{p.market ? t(` in ${p.market}`, ` en ${p.market}`) : ""}.{" "}
      <Link href={demoLink(p)} style={{ fontWeight: 600 }}>{t("Open your demo set up for it", "Abra su demo configurada para ello")} →</Link>
    </p>
  );
}

/** Remembers details a page already knows, e.g. the industry and area a demo was opened for. */
export function Remember(p: Profile) {
  const key = JSON.stringify(p);
  useEffect(() => { saveProfile(JSON.parse(key)); }, [key]);
  return null;
}
