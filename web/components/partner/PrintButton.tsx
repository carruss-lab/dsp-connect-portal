"use client";
import { useT } from "@/lib/useLang";

/** Opens the browser's print dialog, where the partner can print or choose "Save as PDF". */
export default function PrintButton() {
  const t = useT();
  return <button className="btn btn-blue" onClick={() => window.print()}>{t("Print or save as PDF", "Imprimir o guardar como PDF")}</button>;
}
