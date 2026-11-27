import Link from "@/components/Link";
import { Footer, Header } from "@/components/Chrome";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="wrap stack g16" style={{ maxWidth: 640, padding: "96px 32px" }}>
        <h1 className="h2">We could not find that page.</h1>
        <p className="p">The address may be old or mistyped. These will get you where you were going.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="btn btn-blue" href="/">Home</Link>
          <Link className="btn btn-line" href="/#market">See the demo</Link>
          <Link className="btn btn-line" href="/compare">How we compare</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
