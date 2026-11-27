import type { Metadata } from "next";
import { Footer, Header } from "@/components/Chrome";
import ApplyForm from "@/components/partner/ApplyForm";
import VideoEmbed from "@/components/VideoEmbed";
import PlannerVideo from "@/components/PlannerVideo";
import { VIDEOS, videoNode } from "@/lib/videos";
import { PARTNER_FAQ as FAQ } from "@/lib/faq";
import { JsonLd, PARTNER_PROGRAM, SITE_URL, pageGraph, pageMeta } from "@/lib/seo";
import { INDUSTRIES, LEGAL_ENTITY, MIN_BUDGET, SETUP_DAYS, PARTNER_PCT } from "@/lib/site";

const DESCRIPTION = `For ISOs, merchant-services agents and independent sales pros: earn ${PARTNER_PCT}% of your clients' ad spend, paid daily, with residuals for as long as they spend.`;
export const metadata: Metadata = pageMeta({
  title: "Become an Authorized Sales Partner", description: DESCRIPTION, path: "/partners", image: `${SITE_URL}/partners/opengraph-image`,
  ogTitle: `Authorized Sales Partner program: earn ${PARTNER_PCT}% of client ad spend, for life | DSP Connect`,
});

const STEPS = [
  ["Apply", "Tell us who you sell to today. It takes three minutes."],
  ["Sign your agreement", "Your enrollment link arrives by email right away. Sign your Sales Partner Agreement online, as yourself or for your company."],
  ["Verify with Stripe", "Set up daily payouts with Stripe, which verifies your identity and bank details. Once Stripe verifies you, you are approved automatically."],
  ["Train", "A short course on the product, the demo, the conversation and the rules."],
  ["Sell and earn", `Clients open their account through your link. You earn ${PARTNER_PCT}% of what they spend, for as long as they spend.`],
];
const WHY = [
  ["Residuals for life", "You keep earning on every client you bring for as long as they keep spending, even if you stop selling. No cap, no end date."],
  ["Paid daily", "Each day's commission is paid to your bank through Stripe after a 7-day hold. No waiting for month end."],
  ["Nothing to bill or collect", "Clients pay DSP Connect directly at our published prices. You never handle money, card details or invoices."],
  ["We do the setup", `Your clients are live within ${SETUP_DAYS} days of paying: account, tracking, ad review and audience, done for them.`],
];

export default function Partners() {
  return (
    <>
      <JsonLd data={pageGraph({
        path: "/partners", name: "Become an Authorized Sales Partner", description: DESCRIPTION,
        trail: [["Home", "/"], ["Sales Partners", "/partners"]], main: PARTNER_PROGRAM, faq: FAQ,
        image: `${SITE_URL}/partners/opengraph-image`,
        nodes: [videoNode(VIDEOS.partners, "/partners"), videoNode(VIDEOS.plannerPartners, "/partners", "planner-video"), {
          "@type": "HowTo", "@id": `${SITE_URL}/partners#how`, name: "How to become a DSP Connect Authorized Sales Partner",
          step: STEPS.map(([name, text], i) => ({ "@type": "HowToStep", position: i + 1, name, text, url: `${SITE_URL}/partners#apply` })),
        }],
      })} />
      <Header />
      <main>
        <section className="hero"><div className="wrap" style={{ alignItems: "flex-start" }}>
          <div className="hero-copy stack g24">
            <div className="eyebrow">Authorized Sales Partner program</div>
            <h1 className="h1">Sell DSP Connect to the businesses you already call on. Earn {PARTNER_PCT}% of what they spend, for life.</h1>
            <p className="lead" style={{ maxWidth: 600, fontWeight: 600, color: "var(--ink)" }}>You make the introduction. We set up and run the ads.</p>
            <p className="lead" style={{ maxWidth: 600 }}>Built for ISOs, merchant-services agents and local sales pros. You bring the relationships. We provide the product, the demo, the setup and the support, and pay you residuals for as long as your clients spend.</p>
            <div className="ticks"><span>{PARTNER_PCT}% of qualified ad spend</span><span>Residuals for life</span><span>Paid daily</span><span>Individual or company</span></div>
          </div>
          <div id="apply" className="card formcard stack g16" style={{ background: "var(--ground)", scrollMarginTop: 80 }}>
            <div className="h3" style={{ fontSize: 18 }}>Apply to become a Sales Partner</div>
            <ApplyForm />
          </div>
        </div></section>
        <section className="wrap" style={{ padding: "8px 32px 56px" }} aria-labelledby="video-h">
          <div className="stack g16" style={{ maxWidth: 960, margin: "0 auto" }}>
            <h2 id="video-h" className="h2" style={{ textAlign: "center" }}>See how the program works</h2>
            <p className="p" style={{ textAlign: "center" }}>Sell to the businesses you already call on. Earn {PARTNER_PCT}% of what they spend, for life.</p>
            <VideoEmbed id={VIDEOS.partners.id} title={VIDEOS.partners.title} poster={VIDEOS.partners.poster} />
          </div>
        </section>
        <PlannerVideo v={VIDEOS.plannerPartners} id="planner" eyebrow="Your sales tool" title="Hand any business owner an ad plan in 30 seconds." cta="See the free ad planner"
          points={["Type in the owner's website and get a streaming TV and programmatic plan for their business.", "Walk them through it in the demo account and build the campaign together.", "Your planner link credits every plan and sign-up to you, even if they finish later on their own.", "No advertising experience needed, and no promises: the plan never predicts results."]} />

        <section className="section band"><div className="wrap stack g32">
          <h2 className="h2">Why sales partners choose DSP Connect.</h2>
          <div className="grid cols-4">{WHY.map(([t, d]) => <div className="card stack g8" key={t}><h3 className="h3">{t}</h3><p className="p" style={{ fontSize: 14 }}>{d}</p></div>)}</div>
        </div></section>

        <section className="section"><div className="wrap stack g32">
          <h2 className="h2">From application to your first commission.</h2>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
            {STEPS.map(([t, d], i) => <div className="step stack g8" key={t}><div className="num">0{i + 1}</div><h3 className="h3">{t}</h3><p className="p" style={{ fontSize: 14 }}>{d}</p></div>)}
          </div>
        </div></section>

        <section className="section band"><div className="wrap stack g24" style={{ maxWidth: 860 }}>
          <h2 className="h2">How commission works.</h2>
          <p className="p" style={{ fontSize: 16 }}>You earn <b>{PARTNER_PCT}%</b> of the <b>qualified ad spend</b> of every client credited to you: ad budget the client has paid in full that has actually run as ads. Each day&apos;s commission is held for 7 days, then paid to your bank through Stripe.</p>
          <ul className="list"><li>Residuals continue for as long as the client keeps spending, including after your partnership ends, unless it is ended for cause.</li><li>Refunds, chargebacks and unpaid amounts are not qualified, and commission on them is reversed.</li><li>There is no salary and no guaranteed income. What you earn depends on the clients you bring and what they spend.</li></ul>
          <p className="small">Full terms are in the Sales Partner Agreement you review and sign when you enroll.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "baseline" }}>
            <h3 className="h3" style={{ fontSize: 18, flex: "1 1 240px" }}>Industries our partners sell into</h3>
            <div className="chips" style={{ flex: "999 1 560px" }}>{INDUSTRIES.filter((i) => i !== "Other").map((i) => <span className="chip" key={i}>{i}</span>)}</div>
          </div>
        </div></section>

        <section className="section"><div className="wrap stack g24" style={{ maxWidth: 860 }}>
          <h2 className="h2">Questions.</h2>
          {FAQ.map(([q, a]) => <details key={q} className="card stack g8"><summary style={{ cursor: "pointer", fontWeight: 600 }}>{q}</summary><p className="p" style={{ marginTop: 8 }}>{a}</p></details>)}
          <p className="small">Already a Sales Partner? <a href="/partner">Sign in to your portal</a>. Authorized Sales Partners are independent contractors of {LEGAL_ENTITY}, not employees or resellers.</p>
          <a className="btn btn-blue" href="#apply" style={{ alignSelf: "flex-start" }}>Apply now</a>
        </div></section>
      </main>
      <Footer />
    </>
  );
}
