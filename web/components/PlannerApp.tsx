"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import PlanView from "./PlanView";
import PlannerForm from "./PlannerForm";
import type { SavedPlan } from "@/lib/plan";
import { accountHref, askAboutPlan, demoHref, loadPlan } from "@/lib/planClient";

/** The planner on /planner: the form, then the plan with the ways to carry it on. A ?plan= link reopens a saved plan. */
export default function PlannerApp() {
  const [saved, setSaved] = useState<SavedPlan | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const id = new URLSearchParams(location.search).get("plan");
    if (!id) return;
    Promise.resolve().then(() => setLoading(true));
    loadPlan(id).then((p) => { setSaved(p); setLoading(false); });
  }, []);

  const show = (p: SavedPlan) => {
    setSaved(p);
    history.replaceState(null, "", `/planner?plan=${p.id}`);
    setTimeout(() => document.getElementById("your-plan")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  if (loading) return <p className="p" role="status">Opening your plan…</p>;
  if (saved) {
    return (
      <div id="your-plan" className="stack g16" style={{ scrollMarginTop: 80 }}>
        <PlanView saved={saved} actions={<>
          <Link className="btn btn-white" href={demoHref(saved)}>See it in your demo account</Link>
          <Link className="btn btn-line" style={{ borderColor: "#fff", color: "#fff" }} href={accountHref(saved)}>Open your account with this plan</Link>
          <button type="button" className="btn btn-line" style={{ borderColor: "#A9C1F5", color: "#A9C1F5" }} onClick={() => askAboutPlan(saved)}>Ask about this plan</button>
        </>} />
        <p className="small">Your plan is saved to your email. When you open your account it goes with you: we use it for your setup and your campaign brief.{" "}
          <button type="button" className="link" style={{ background: "none", border: 0, padding: 0, color: "var(--blue)", cursor: "pointer", font: "inherit", textDecoration: "underline" }}
            onClick={() => { setSaved(null); history.replaceState(null, "", "/planner"); }}>Make a plan for another website</button></p>
      </div>
    );
  }
  return (
    <div className="card stack g16" style={{ background: "var(--ground)", maxWidth: 620 }}>
      <h2 className="h3" style={{ fontSize: 20 }}>Get your free ad plan</h2>
      <PlannerForm onPlan={show} />
    </div>
  );
}
