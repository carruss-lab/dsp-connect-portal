"use client";
import { useEffect } from "react";
import { useLang } from "@/lib/useLang";

/** Keeps the Messenger in the page's language when a visitor switches between English and Spanish. */
export default function IntercomLang() {
  const lang = useLang();
  useEffect(() => {
    const w = window as Window & { Intercom?: (cmd: string, data?: Record<string, unknown>) => void; intercomSettings?: Record<string, unknown> };
    w.intercomSettings = { ...(w.intercomSettings || {}), language_override: lang };
    if (typeof w.Intercom === "function") w.Intercom("update", { language_override: lang });
  }, [lang]);
  return null;
}
