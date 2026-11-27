"use client";
import Link from "@/components/Link";
import { Footer, Header } from "@/components/Chrome";
import { useT } from "@/lib/useLang";

export default function NotFound() {
  const t = useT();
  return (
    <>
      <Header />
      <main className="wrap stack g16" style={{ maxWidth: 640, padding: "96px 32px" }}>
        <h1 className="h2">{t("We could not find that page.", "No encontramos esa página.")}</h1>
        <p className="p">{t("The address may be old or mistyped. These will get you where you were going.", "Es posible que la dirección sea antigua o tenga un error. Estos enlaces lo llevarán a donde iba.")}</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="btn btn-blue" href="/">{t("Home", "Inicio")}</Link>
          <Link className="btn btn-line" href="/#market">{t("See the demo", "Ver la demostración")}</Link>
          <Link className="btn btn-line" href="/compare">{t("How we compare", "Cómo nos comparamos")}</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
