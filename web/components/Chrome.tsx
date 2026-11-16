import Image from "next/image";
import Link from "next/link";
import { BUSINESS_ADDRESS, LEGAL_ENTITY, LOGIN_URL, MEETING_URL, SUPPORT_EMAIL } from "@/lib/site";

export function Header() {
  return (
    <header className="header">
      <div className="wrap">
        <Link href="/" className="brand">
          <Image src="/logo.png" alt="" width={30} height={30} />
          DSP Connect
        </Link>
        <nav className="nav" aria-label="Main">
          <Link href="/#how">How it works</Link>
          <Link href="/#who">Who it is for</Link>
          <Link href="/industries">Industries</Link>
          <Link href="/agencies">For agencies</Link>
          <Link href="/compare">How we compare</Link>
          <a href={MEETING_URL} target="_blank" rel="noopener">Book a call</a>
        </nav>
        <a className="navlink" href={LOGIN_URL} style={{ color: "var(--ink)" }}>Log in</a>
        <Link className="btn btn-blue" href="/#market">See the demo</Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="stack g8">
          <div>© {new Date().getFullYear()} {LEGAL_ENTITY}. DSP Connect is a service of {LEGAL_ENTITY}.</div>
          <div>{BUSINESS_ADDRESS ? `${BUSINESS_ADDRESS} · ` : ""}<a href={`mailto:${SUPPORT_EMAIL}`} style={{ marginLeft: 0 }}>{SUPPORT_EMAIL}</a></div>
        </div>
        <nav aria-label="Footer">
          <a href={LOGIN_URL}>Client log in</a>
          <Link href="/industries">Industries</Link>
          <Link href="/agencies">Agencies</Link>
          <Link href="/compare">Comparisons</Link>
          <a href={MEETING_URL} target="_blank" rel="noopener">Book a call</a>
          <Link href="/terms">Terms</Link>
          <Link href="/refunds">Refunds</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}

/** A plain band that offers the two next steps: see the demo, or talk to a person. */
export function TalkBand({ industry }: { industry?: string }) {
  return (
    <section className="section dark" style={{ padding: "64px 0" }}>
      <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center", justifyContent: "space-between" }}>
        <div className="stack g12" style={{ flex: "1 1 460px", minWidth: 0 }}>
          <h2 className="h2">See it first, or talk to a person.</h2>
          <p className="p" style={{ fontSize: 16 }}>Open the demo account in under a minute, or book a 20-minute call and we will walk you through it.</p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="btn btn-white" href={industry ? `/?industry=${encodeURIComponent(industry)}#market` : "/#market"}>See the demo</Link>
          <a className="btn btn-line" style={{ borderColor: "#fff", color: "#fff" }} href={MEETING_URL} target="_blank" rel="noopener">Book a call</a>
        </div>
      </div>
    </section>
  );
}
