"use client";

/** Opens the browser's print dialog, where the partner can print or choose "Save as PDF". */
export default function PrintButton() {
  return <button className="btn btn-blue" onClick={() => window.print()}>Print or save as PDF</button>;
}
