import Image from "next/image";
import Link from "next/link";
import { LEGAL_ENTITY, LOGIN_URL } from "@/lib/site";

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
          <Link href="/agencies">For agencies</Link>
          <Link href="/compare">How we compare</Link>
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
        <div>© {new Date().getFullYear()} {LEGAL_ENTITY}. DSP Connect is a service of {LEGAL_ENTITY}.</div>
        <nav aria-label="Footer">
          <a href={LOGIN_URL}>Client log in</a>
          <Link href="/agencies">Agencies</Link>
          <Link href="/compare">Comparisons</Link>
          <Link href="/open-account">Open your account</Link>
        </nav>
      </div>
    </footer>
  );
}
