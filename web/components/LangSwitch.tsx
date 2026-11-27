"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { localePath } from "@/lib/i18n";

function Switch() {
  const path = usePathname() || "/";
  const q = useSearchParams()?.toString();
  const es = /^\/es(\/|$)/.test(path);
  const to = localePath(path, es ? "en" : "es") + (q ? `?${q}` : "");
  return (
    <a className="navlink" href={to} hrefLang={es ? "en" : "es"} lang={es ? "en" : "es"} aria-label={es ? "View this page in English" : "Ver esta página en español"}
      style={{ color: "var(--ink)", fontWeight: 600, whiteSpace: "nowrap" }}>
      {es ? "English" : "Español"}
    </a>
  );
}
/** Link to the same page in the other language. */
export default function LangSwitch() {
  return <Suspense fallback={null}><Switch /></Suspense>;
}
