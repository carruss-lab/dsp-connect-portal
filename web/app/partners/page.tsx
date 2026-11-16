import type { Metadata } from "next";
import Image from "next/image";
import { INDUSTRIES, LEGAL_ENTITY, MIN_BUDGET, SETUP_DAYS, SHARE_PCT } from "@/lib/site";

// Private program page: not linked from the public site and hidden from search engines.
export const metadata: Metadata = {
  title: "Managing Partner program",
  description: "The DSP Connect Managing Partner program. By invitation only.",
  robots: { index: false, follow: false },
};

const STEPS = [
  ["Invitation", "Managing Partners join by invitation. Your invitation arrives by email."],
  ["Admission", "You review and sign your admission documents online."],
  ["Training", "Complete the Managing Partner course: the product, the demo, the sales process and the rules."],
  ["Bring clients", "Register each client. They pay their ad budget online and we set them up."],
  ["Get paid", `Earn ${SHARE_PCT}% of their qualified ad spend, paid every week.`],
];
const TOOLS = [
  ["A demo that sells", "Open a sample account set up for your prospect's industry and area, and build a practice campaign with them."],
  ["Done-for-you setup", `Your clients are live within ${SETUP_DAYS} days of paying. You sell; we build.`],
  ["A low first step", `Clients can start from $${MIN_BUDGET}, so the first yes is easy.`],
  ["Training and support", "A full course before you sell, and a support team for you and your clients after."],
];

export default function Partners() {
  return (
    <>
      <header className="header"><div className="wrap">
        <span className="brand"><Image src="/logo.png" alt="" width={30} height={30} />DSP Connect</span>
        <span className="small" style={{ flexGrow: 1 }}>Managing Partner program</span>
        <span className="small">By invitation only</span>
      </div></header>
      <main>
        <section className="hero"><div className="wrap">
          <div className="hero-copy stack g24">
            <div className="eyebrow">By invitation only</div>
            <h1 className="h1">Sell DSP Connect in the industry you know. Earn {SHARE_PCT}% of what your clients spend.</h1>
            <p className="lead" style={{ maxWidth: 580 }}>Managing Partners are independent sellers who bring businesses in their industry onto DSP Connect. You bring the relationships. We provide the product, the training, the setup and the support.</p>
            <div className="ticks"><span>{SHARE_PCT}% of qualified ad spend</span><span>Paid weekly</span><span>Independent, commission-only</span></div>
          </div>
          <div className="card formcard stack g16" style={{ background: "var(--ground)" }}>
            <div className="h3" style={{ fontSize: 18 }}>How commission works</div>
            <p className="p">You earn <b>{SHARE_PCT}%</b> of the ad spend of clients you bring in, once that spend is <b>qualified</b>: the client is yours, under contract, live, invoiced and paid.</p>
            <ul className="list"><li>Paid every week, to your bank account through Stripe</li><li>Paid after the client&apos;s funds are received</li><li>Refunds, chargebacks and unpaid invoices do not count</li></ul>
            <p className="small">There is no salary and no guaranteed income. What you earn depends on the clients you bring and what they spend. Full terms are in the admission documents you review before signing.</p>
          </div>
        </div></section>

        <section className="section band"><div className="wrap stack g32">
          <h2 className="h2">From invitation to your first commission.</h2>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
            {STEPS.map(([t, d], i) => <div className="step stack g8" key={t}><div className="num">0{i + 1}</div><h3 className="h3">{t}</h3><p className="p" style={{ fontSize: 14 }}>{d}</p></div>)}
          </div>
        </div></section>

        <section className="section"><div className="wrap stack g32">
          <h2 className="h2">What you sell with.</h2>
          <div className="grid cols-4">{TOOLS.map(([t, d]) => <div className="card stack g8" key={t}><h3 className="h3">{t}</h3><p className="p" style={{ fontSize: 14 }}>{d}</p></div>)}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "baseline" }}>
            <h3 className="h3" style={{ fontSize: 18, flex: "1 1 240px" }}>Industries our partners cover</h3>
            <div className="chips" style={{ flex: "999 1 560px" }}>{INDUSTRIES.filter((i) => i !== "Other").map((i) => <span className="chip" key={i}>{i}</span>)}</div>
          </div>
        </div></section>

        <section className="section band"><div className="wrap stack g16" style={{ maxWidth: 760 }}>
          <h2 className="h2">Have an invitation?</h2>
          <p className="p" style={{ fontSize: 16 }}>Use the link in your invitation email to review your admission documents and set up your weekly payouts. There is no public application. If you were expecting an invitation and have not received it, reply to the person who contacted you.</p>
        </div></section>
      </main>
      <footer className="footer"><div className="wrap"><div>© {new Date().getFullYear()} {LEGAL_ENTITY}. DSP Connect is a service of {LEGAL_ENTITY}.</div><div>Managing Partners are independent contractors, not employees.</div></div></footer>
    </>
  );
}
