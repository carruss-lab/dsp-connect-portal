import "@fontsource-variable/inter";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page not found | DSP Connect", robots: { index: false } };

// Shown for any address that matches no page, in English or Spanish. It sits outside the site's layout,
// so it carries its own simple header and picks the language from the address in the browser.
export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <header className="header"><div className="wrap"><a className="brand" href="/"><img src="/logo.png" alt="" width={30} height={30} />DSP Connect</a></div></header>
        <main className="wrap stack g16" style={{ maxWidth: 640, padding: "96px 32px" }}>
          <div data-l="en" className="stack g16" suppressHydrationWarning>
            <h1 className="h2">We could not find that page.</h1>
            <p className="p">The address may be old or mistyped. These will get you where you were going.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a className="btn btn-blue" href="/">Home</a>
              <a className="btn btn-line" href="/#market">See the demo</a>
              <a className="btn btn-line" href="/compare">How we compare</a>
            </div>
          </div>
          <div data-l="es" className="stack g16" hidden suppressHydrationWarning>
            <h1 className="h2">No encontramos esa página.</h1>
            <p className="p">Es posible que la dirección sea antigua o tenga un error. Estos enlaces lo llevarán a donde iba.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a className="btn btn-blue" href="/es">Inicio</a>
              <a className="btn btn-line" href="/es#market">Ver la demostración</a>
              <a className="btn btn-line" href="/es/compare">Cómo nos comparamos</a>
            </div>
          </div>
        </main>
        <script dangerouslySetInnerHTML={{ __html: `if(/^\\/es(\\/|$)/.test(location.pathname)){document.documentElement.lang="es";document.title="Página no encontrada | DSP Connect";document.querySelector('[data-l="en"]').hidden=true;document.querySelector('[data-l="es"]').hidden=false;}` }} />
      </body>
    </html>
  );
}
