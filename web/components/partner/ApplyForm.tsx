"use client";
import { useState } from "react";
import { trackLead } from "@/lib/analytics";
import { INDUSTRIES } from "@/lib/site";
import { useLang } from "@/lib/useLang";
import { industryName, tr } from "@/lib/i18n";

/** Public application to become an Authorized Sales Partner. */
export default function ApplyForm() {
  const [entity, setEntity] = useState<"individual" | "company">("individual");
  const [state, setState] = useState<"idle" | "busy" | "done" | "existing">("idle");
  const [error, setError] = useState("");
  const lang = useLang(); const t = tr(lang);
  if (state === "done" || state === "existing") {
    return (
      <div className="note note-ok stack g8" role="status">
        <b>{state === "done" ? t("Thank you. Your application is in.", "Gracias. Recibimos su solicitud.") : t("We already have your application.", "Ya tenemos su solicitud.")}</b>
        <span>{state === "done"
          ? t("Your enrollment link is on its way to your inbox. Open it to sign your Sales Partner Agreement and set up your payouts with Stripe.", "Su enlace de inscripción va camino a su correo. Ábralo para firmar su Acuerdo de Socio de Ventas y configurar sus pagos con Stripe.")
          : t("Check your inbox for your enrollment link, or sign in to your partner portal with this email.", "Busque su enlace de inscripción en su correo, o entre a su portal de socio con este correo.")}</span>
      </div>
    );
  }
  return (
    <form className="stack g16" onSubmit={async (e) => {
      e.preventDefault(); setState("busy"); setError("");
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      try {
        const r = await fetch("/api/partner/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, entity, lang, agree: !!data.agree }) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || t("Something went wrong. Please try again.", "Algo salió mal. Inténtelo de nuevo."));
        if (!j.existing) trackLead("sales_partner");
        setState(j.existing ? "existing" : "done");
      } catch (err) { setError(err instanceof Error ? err.message : String(err)); setState("idle"); }
    }}>
      <fieldset className="stack g8" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="small" style={{ fontWeight: 600, marginBottom: 6 }}>{t("You are applying as", "Usted solicita como")}</legend>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="radio" name="entity_choice" checked={entity === "individual"} onChange={() => setEntity("individual")} /> {t("An individual", "Persona")}</label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="radio" name="entity_choice" checked={entity === "company"} onChange={() => setEntity("company")} /> {t("A company (ISO, agency or sales firm)", "Empresa (ISO, agencia o firma de ventas)")}</label>
        </div>
      </fieldset>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <div className="field" style={{ flex: "1 1 220px" }}><label htmlFor="ap-name">{t("Your full name", "Su nombre completo")}</label><input id="ap-name" name="name" className="input" required autoComplete="name" /></div>
        {entity === "company" && <div className="field" style={{ flex: "1 1 220px" }}><label htmlFor="ap-company">{t("Company name", "Nombre de la empresa")}</label><input id="ap-company" name="company" className="input" required autoComplete="organization" /></div>}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <div className="field" style={{ flex: "1 1 220px" }}><label htmlFor="ap-email">{t("Email", "Correo")}</label><input id="ap-email" name="email" type="email" className="input" required autoComplete="email" /></div>
        <div className="field" style={{ flex: "1 1 160px" }}><label htmlFor="ap-phone">{t("Phone", "Teléfono")}</label><input id="ap-phone" name="phone" type="tel" className="input" autoComplete="tel" /></div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <div className="field" style={{ flex: "1 1 200px" }}><label htmlFor="ap-loc">{t("Where you sell (city, state)", "Dónde vende (ciudad, estado)")}</label><input id="ap-loc" name="location" className="input" placeholder={t("e.g. Phoenix, AZ", "p. ej. Phoenix, AZ")} /></div>
        <div className="field" style={{ flex: "1 1 200px" }}><label htmlFor="ap-vert">{t("Main industry you sell into", "Industria principal a la que vende")}</label>
          <select id="ap-vert" name="vertical" className="input">{INDUSTRIES.map((i) => <option key={i} value={i}>{industryName(i, lang)}</option>)}</select></div>
      </div>
      <div className="field"><label htmlFor="ap-exp">{t("What do you sell today, and to whom?", "¿Qué vende hoy, y a quién?")}</label>
        <textarea id="ap-exp" name="experience" className="input" rows={3} placeholder={t("e.g. Merchant services to restaurants and retail for 6 years", "p. ej. Servicios para comerciantes a restaurantes y tiendas por 6 años")} /></div>
      <div className="field"><label htmlFor="ap-net">{t("How many local businesses do you talk to in a typical month? (optional)", "¿Con cuántos negocios locales habla en un mes normal? (opcional)")}</label>
        <textarea id="ap-net" name="network" className="input" rows={2} /></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <div className="field" style={{ flex: "1 1 220px" }}><label htmlFor="ap-web">{t("Website (optional)", "Sitio web (opcional)")}</label><input id="ap-web" name="website" className="input" /></div>
        <div className="field" style={{ flex: "1 1 220px" }}><label htmlFor="ap-li">{t("LinkedIn (optional)", "LinkedIn (opcional)")}</label><input id="ap-li" name="linkedin" className="input" /></div>
      </div>
      <input name="company_fax" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1 }} />
      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14 }}>
        <input type="checkbox" name="agree" required style={{ marginTop: 3 }} />
        <span>{t("DSP Connect may contact me about this application. Applying does not create any agreement; I will review and sign the Sales Partner Agreement before I start.", "DSP Connect puede contactarme sobre esta solicitud. Solicitar no crea ningún acuerdo; revisaré y firmaré el Acuerdo de Socio de Ventas antes de empezar.")}</span>
      </label>
      {error && <p className="note note-err" role="alert">{error}</p>}
      <button className="btn btn-blue" disabled={state === "busy"} style={{ alignSelf: "flex-start" }}>{state === "busy" ? t("Sending…", "Enviando…") : t("Apply to become a Sales Partner", "Solicitar ser Socio de Ventas")}</button>
    </form>
  );
}
