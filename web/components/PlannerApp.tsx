"use client";
import Link from "@/components/Link";
import { useEffect, useState } from "react";
import PlanView from "./PlanView";
import PlannerForm from "./PlannerForm";
import type { SavedPlan } from "@/lib/plan";
import { accountHref, askAboutPlan, demoHref, loadPlan } from "@/lib/planClient";
import { useLang } from "@/lib/useLang";
import { localePath, tr } from "@/lib/i18n";

/** The planner on /planner: the form, then the plan with the ways to carry it on. A ?plan= link reopens a saved plan. */
export default function PlannerApp({ intro }: { intro: React.ReactNode }) {
  const [saved, setSaved] = useState<SavedPlan | null>(null);
  const lang = useLang(); const t = tr(lang); const base = localePath("/planner", lang);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const id = new URLSearchParams(location.search).get("plan");
    if (!id) return;
    Promise.resolve().then(() => setLoading(true));
    loadPlan(id).then((p) => { setSaved(p); setLoading(false); });
  }, []);

  const show = (p: SavedPlan) => {
    setSaved(p);
    history.replaceState(null, "", `${base}?plan=${p.id}`);
    setTimeout(() => document.getElementById("your-plan")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  if (loading) return <div className="wrap"><p className="p" role="status">{t("Opening your plan…", "Abriendo su plan…")}</p></div>;
  if (saved) {
    return (
      <div id="your-plan" className="wrap stack g16" style={{ scrollMarginTop: 80 }}>
        <PlanView saved={saved} actions={<>
          <Link className="btn btn-white" href={demoHref(saved)}>{t("See it in your demo account", "Véalo en su cuenta de demostración")}</Link>
          <Link className="btn btn-line" style={{ borderColor: "#fff", color: "#fff" }} href={accountHref(saved)}>{t("Open your account with this plan", "Abra su cuenta con este plan")}</Link>
          <button type="button" className="btn btn-line" style={{ borderColor: "#A9C1F5", color: "#A9C1F5" }} onClick={() => askAboutPlan(saved)}>{t("Ask about this plan", "Preguntar sobre este plan")}</button>
        </>} />
        <p className="small">{t("Your plan is saved to your email. When you open your account it goes with you: we use it for your setup and your campaign brief.", "Su plan está guardado con su correo. Cuando abra su cuenta, va con usted: lo usamos para su configuración y el resumen de su campaña.")}{" "}
          <button type="button" className="link" style={{ background: "none", border: 0, padding: 0, color: "var(--blue)", cursor: "pointer", font: "inherit", textDecoration: "underline" }}
            onClick={() => { setSaved(null); history.replaceState(null, "", base); }}>{t("Make a plan for another website", "Hacer un plan para otro sitio web")}</button></p>
      </div>
    );
  }
  return (
    <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: 48, alignItems: "flex-start" }}>
      <div className="stack g24" style={{ flex: "1 1 400px", minWidth: 0 }}>{intro}</div>
      <div className="card stack g16" style={{ flex: "1 1 420px", minWidth: 0, maxWidth: 620, background: "var(--ground)" }}>
        <h2 className="h3" style={{ fontSize: 20 }}>{t("Get your free ad plan", "Obtenga su plan de anuncios gratis")}</h2>
        <PlannerForm onPlan={show} />
      </div>
    </div>
  );
}
