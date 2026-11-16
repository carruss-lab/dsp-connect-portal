import type { Metadata } from "next";
import { Footer, Header } from "@/components/Chrome";
import LeadForm from "@/components/LeadForm";
import { SETUP_DAYS, SHARE_PCT } from "@/lib/site";

export const metadata: Metadata = {
  title: "For agencies",
  description: `Run client campaigns on DSP Connect and earn ${SHARE_PCT}% of the ad spend you manage.`,
};

const POINTS = [
  ["Your clients stay yours", "We never contact, bill or sell to your clients. You own the relationship."],
  ["All clients in one account", "Each client gets their own login, with the access you choose for them."],
  [`${SHARE_PCT}% of the ad spend you manage`, "Paid on spend your clients actually run, on top of the fees you already charge."],
  [`Each client set up in ${SETUP_DAYS} days`, "We create the account, place tracking, review ads and build the audience."],
];
const money = (s: number) => `$${((s * SHARE_PCT) / 100).toLocaleString("en-US")}`;

export default function Agencies() {
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="wrap">
            <div className="hero-copy stack g24">
              <div className="eyebrow">For agencies</div>
              <h1 className="h1">Keep your clients. Earn {SHARE_PCT}% of what they spend.</h1>
              <p className="lead" style={{ maxWidth: 560 }}>
                Run your clients&apos; advertising across apps and websites on our platform, under a revenue share agreement.
              </p>
              <div className="grid" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16, maxWidth: 520 }}>
                {[50000, 150000, 500000].map((s) => (
                  <div key={s}><div className="money" style={{ fontSize: 24 }}>{money(s)}</div><div className="small">a month at ${s / 1000}k managed spend</div></div>
                ))}
              </div>
            </div>
            <div className="card formcard stack g16">
              <div className="stack g8">
                <h2 className="h3" style={{ fontSize: 18 }}>Ask about an agency agreement</h2>
                <p className="small">We reply within one business day.</p>
              </div>
              <LeadForm kind="agency" cta="Request agreement details" />
            </div>
          </div>
        </section>
        <section className="section band">
          <div className="wrap grid cols-4">
            {POINTS.map(([t, d]) => (
              <div className="step stack g8" key={t}><h3 className="h3">{t}</h3><p className="p" style={{ fontSize: 14 }}>{d}</p></div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
