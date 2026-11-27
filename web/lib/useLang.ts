"use client";
import { usePathname } from "next/navigation";
import { tr, type Lang } from "./i18n";

/** Language of the current page in Client Components (Spanish pages live under /es). */
export function useLang(): Lang {
  return usePathname()?.match(/^\/es(\/|$)/) ? "es" : "en";
}
export function useT() { return tr(useLang()); }
