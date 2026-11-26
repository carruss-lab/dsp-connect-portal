import Image from "next/image";
import Link from "next/link";
import { WelcomeBar } from "./Personal";
import { HELP_URL, LEGAL_ENTITY, LOGIN_URL, PARTNERSTACK_AGENCY_URL, SUPPORT_EMAIL } from "@/lib/site";

export function Header() {
  return (
    <>
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
          <Link href="/videos">Videos</Link>
          <Link href="/planner">Free ad plan</Link>
        </nav>
        {LOGIN_URL && <a className="navlink" href={LOGIN_URL} style={{ color: "var(--ink)" }}>Log in</a>}
        <Link className="btn btn-blue" href="/#market">See the demo</Link>
      </div>
    </header>
    <WelcomeBar />
    </>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="stack g8">
          <div>© {new Date().getFullYear()} {LEGAL_ENTITY}. DSP Connect is a service of {LEGAL_ENTITY}.</div>
          <div><a href={`mailto:${SUPPORT_EMAIL}`} style={{ marginLeft: 0 }}>{SUPPORT_EMAIL}</a></div>
        </div>
        <nav aria-label="Footer">
          {LOGIN_URL && <a href={LOGIN_URL}>Client log in</a>}
          <Link href="/about">About</Link>
          <Link href="/industries">Industries</Link>
          <Link href="/agencies">Agencies</Link>
          <Link href="/partners">Sales Partners</Link>
          <Link href="/compare">Comparisons</Link>
          <Link href="/videos">Videos</Link>
          <Link href="/planner">Ad planner</Link>
          <a href={HELP_URL}>Help center</a>
          <Link href="/terms">Terms</Link>
          <Link href="/refunds">Refunds</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}

/** A plain band that offers the two next steps: see the demo, then open an account. */
export function TalkBand({ industry, agency = false }: { industry?: string; agency?: boolean }) {
  if (agency) {
    return (
      <section className="section dark" style={{ padding: "64px 0" }}>
        <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center", justifyContent: "space-between" }}>
          <div className="stack g12" style={{ flex: "1 1 460px", minWidth: 0 }}>
            <h2 className="h2">Ready to join the agency program?</h2>
            <p className="p" style={{ fontSize: 16 }}>Apply on PartnerStack in a couple of minutes. That is where you sign up and set up your payouts. Questions? Ask Fin in the chat, any hour.</p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a className="btn btn-white" href={PARTNERSTACK_AGENCY_URL} target="_blank" rel="noopener noreferrer">Join the agency program</a>
            <Link className="btn btn-line" style={{ borderColor: "#fff", color: "#fff" }} href="/demo?view=agency">See the agency demo</Link>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="section dark" style={{ padding: "64px 0" }}>
      <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center", justifyContent: "space-between" }}>
        <div className="stack g12" style={{ flex: "1 1 460px", minWidth: 0 }}>
          <h2 className="h2">See it first. Start when you are ready.</h2>
          <p className="p" style={{ fontSize: 16 }}>Open the demo account in under a minute and click through every screen. Questions? Ask Fin in the chat, any hour.</p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="btn btn-white" href={industry ? `/?industry=${encodeURIComponent(industry)}#market` : "/#market"}>See the demo</Link>
          <Link className="btn btn-line" style={{ borderColor: "#fff", color: "#fff" }} href="/open-account">Open your account</Link>
        </div>
      </div>
    </section>
  );
}
