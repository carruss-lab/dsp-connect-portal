"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { localePath } from "@/lib/i18n";

// A Spanish-speaking visitor on an English page gets a small, dismissible offer to switch.
// No automatic redirect: search engines and people who chose English keep the page they asked for.
export default function LanguageHint() {
  const path = usePathname() || "/";
  const [show, setShow] = useState(false);
  const onEs = /^\/es(\/|$)/.test(path);
  useEffect(() => {
    if (onEs || path.startsWith("/admin")) return;
    let dismissed = false;
    try { dismissed = localStorage.getItem("dsp-lang-hint") === "1"; } catch {}
    const langs = (navigator.languages?.length ? navigator.languages : [navigator.language]).map((l) => (l || "").toLowerCase());
    if (!dismissed && langs[0]?.startsWith("es")) setShow(true);
  }, [onEs, path]);
  if (!show || onEs) return null;
  const close = () => { setShow(false); try { localStorage.setItem("dsp-lang-hint", "1"); } catch {} };
  return (
    <div role="region" aria-label="Idioma" style={{ position: "fixed", left: 16, bottom: 16, zIndex: 50, background: "#0B1220", color: "#fff", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center", boxShadow: "0 8px 30px rgba(0,0,0,.25)", maxWidth: "calc(100vw - 32px)", fontSize: 14 }}>
      <span>¿Prefiere español?</span>
      <a href={localePath(path, "es") + (typeof window !== "undefined" ? window.location.search : "")} style={{ color: "#fff", fontWeight: 700, textDecoration: "underline" }}>Ver en español</a>
      <button onClick={close} aria-label="Cerrar" style={{ background: "transparent", border: 0, color: "#9DB4E8", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
    </div>
  );
}
