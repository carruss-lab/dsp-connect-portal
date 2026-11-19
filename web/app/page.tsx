import Image from "next/image";
import Link from "next/link";
import { Footer, Header } from "@/components/Chrome";
import LeadForm from "@/components/LeadForm";
import { COMPARISONS } from "@/lib/compare";
import { EXCHANGES, MIN_BUDGET, SETUP_DAYS, SHARE_PCT } from "@/lib/site";
import VideoEmbed from "@/components/VideoEmbed";
import { ADS_SERVICE, JsonLd, pageGraph } from "@/lib/seo";
import { VIDEOS, videoNode } from "@/lib/videos";
import { INDUSTRY_PAGES } from "@/lib/industries";
import { HOME_FAQ as FAQ } from "@/lib/faq";
import { MEETING_URL } from "@/lib/site";

const STEPS = [
  ["See the demo", "Open a sample account set up for a business like yours, before you spend anything."],
  ["Tell us about your business", "Fill in one short form online: your goals, your area and the ads you want to run."],
  ["Pay online", `Agree to the terms and pay your ad budget by card or bank transfer. Budgets start at $${MIN_BUDGET}.`],
  [`Live within ${SETUP_DAYS} days`, "We set up your account and launch your ads. Log in any time to see views, clicks, leads and spend."],
];
const SETUP = [
  ["Create your account", "Your login, your budget loaded, your reporting ready."],
  ["Place your tracking", "So leads and sales from your ads are counted on your own website."],
  ["Review your ads", "Checked against exchange rules so they are approved the first time."],
  ["Build your audience", "Your area, your customers, the apps and sites that fit your business."],
];
const TRUST: [string, string, string, string][] = [
  ["The account itself", "Open the demo and click through every screen you will use, before you give us a card.", "/#market", "Open the demo"],
  ["A person", "Book a 20-minute call and ask us anything about your market, your ads or the setup.", MEETING_URL, "Book a call"],
  ["Your way out", "No long-term contract. Cancel any time and your unspent ad budget is refunded.", "/refunds", "Read the refund policy"],
  ["The terms", "Short, plain client terms. Payment is taken by Stripe; we never see your card details.", "/terms", "Read the client terms"],
];

export default function Home() {
  return (
    <>
      <JsonLd data={pageGraph({ path: "/", name: "DSP Connect | Enterprise programmatic advertising, without the enterprise contract", description: `Streaming TV, apps and websites across ${EXCHANGES} ad exchanges, open to any business from a $${MIN_BUDGET} ad budget. Set up for you, live within ${SETUP_DAYS} days. No contract.`, main: ADS_SERVICE, faq: FAQ, nodes: [videoNode(VIDEOS.owners, "/")] })} />
      <Header />
      <main>
        <section className="hero">
          <div className="wrap">
            <div className="hero-copy stack g24">
              <div className="eyebrow">Programmatic advertising for every business</div>
              <h1 className="h1">Enterprise programmatic advertising. Without the enterprise contract.</h1>
              <p className="lead" style={{ maxWidth: 600 }}>
                The same kind of buying big brands do through The Trade Desk and Amazon DSP: streaming TV, apps and websites
                across {EXCHANGES} ad exchanges. Open to any business from a ${MIN_BUDGET} ad budget, set up for you and live within {SETUP_DAYS} days.
              </p>
              <div className="ticks">
                <span>From ${MIN_BUDGET}</span>
                <span>Live within {SETUP_DAYS} days</span>
                <span>No contract</span>
                <span>No monthly platform fee</span>
              </div>
              <Link className="btn btn-blue" href="/open-account" style={{ alignSelf: "flex-start" }}>Open your account</Link>
            </div>
            <div id="market" className="card formcard stack g16" style={{ scrollMarginTop: 90 }}>
              <div className="stack g8">
                <h2 className="h3" style={{ fontSize: 18 }}>See your sample account</h2>
                <p className="small">Tell us your industry and area and we open a sample account set up for a business like yours. See exactly what you get before you spend a dollar. No card needed.</p>
              </div>
              <LeadForm kind="market_check" cta="Open the demo" />
            </div>
          </div>
        </section>
        <section className="wrap" style={{ padding: "8px 32px 56px" }} aria-labelledby="video-h">
          <div className="stack g16" style={{ maxWidth: 960, margin: "0 auto" }}>
            <h2 id="video-h" className="h2" style={{ textAlign: "center" }}>See how it works in 2 minutes</h2>
            <p className="p" style={{ textAlign: "center" }}>Enterprise programmatic advertising, without the enterprise contract.</p>
            <VideoEmbed id={VIDEOS.owners.id} title={VIDEOS.owners.title} poster={VIDEOS.owners.poster} />
          </div>
        </section>

        <section style={{ paddingBottom: 40 }}>
          <div className="wrap stack g16">
            <div className="shot">
              <Image src="/demo-dashboard.png" alt="The DSP Connect dashboard in the demo account, showing spend, impressions, clicks, conversions and a chart of impressions by day for four campaigns." width={2560} height={1520} sizes="(max-width: 1240px) 100vw, 1176px" priority />
            </div>
            <p className="small">The demo account, with sample data. Enter your industry and area above to open it set up for a business like yours.</p>
          </div>
        </section>

        <section id="how" className="section" style={{ scrollMarginTop: 70, paddingTop: 40 }}>
          <div className="wrap stack g32">
            <div className="stack g12" style={{ maxWidth: 680 }}>
              <h2 className="h2">Done-for-you setup. Live in {SETUP_DAYS} days.</h2>
              <p className="p" style={{ fontSize: 16 }}>You fill in one form and pay. We build everything else and hand you the keys.</p>
            </div>
            <div className="grid cols-4">
              {STEPS.map(([t, d], i) => (
                <div className="step stack g8" key={t}>
                  <div className="num">0{i + 1}</div><h3 className="h3">{t}</h3><p className="p" style={{ fontSize: 14 }}>{d}</p>
                </div>
              ))}
            </div>
            <div className="card stack g24" style={{ background: "var(--ground)" }}>
              <h3 className="h3" style={{ fontSize: 16 }}>What we do for you in those {SETUP_DAYS} days</h3>
              <div className="grid cols-4" style={{ gap: 20 }}>
                {SETUP.map(([t, d]) => (
                  <div className="stack" style={{ gap: 4 }} key={t}><div style={{ fontSize: 14, fontWeight: 600 }}>{t}</div><p className="small" style={{ color: "var(--body)" }}>{d}</p></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="who" className="section band" style={{ scrollMarginTop: 70 }}>
          <div className="wrap stack g32">
            <h2 className="h2">Built for two kinds of customer.</h2>
            <div className="grid cols-2">
              <article className="card card-strong stack g16">
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <h3 className="h2" style={{ fontSize: 22 }}>Business owners</h3><span className="mono" style={{ fontSize: 14, color: "var(--body)" }}>from ${MIN_BUDGET}</span>
                </div>
                <p className="p">Used to running ads on Facebook or Google? Reach the same customers on the apps and websites they use the rest of the day.</p>
                <ul className="list">
                  <li>Account and tracking set up for you</li>
                  <li>Video, banner and native ads, run by you</li>
                  <li>Live within {SETUP_DAYS} days of paying</li>
                </ul>
                <Link className="btn btn-blue" href="/open-account" style={{ alignSelf: "flex-start" }}>Open your account</Link>
              </article>
              <article className="card stack g16">
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <h3 className="h2" style={{ fontSize: 22 }}>Agencies</h3><span className="mono" style={{ fontSize: 14, color: "var(--body)" }}>{SHARE_PCT}% revenue share</span>
                </div>
                <p className="p">Run your clients&apos; campaigns on our platform under a revenue share agreement. Your clients stay yours.</p>
                <ul className="list">
                  <li>All your clients in one account, each with their own login</li>
                  <li>{SHARE_PCT}% of the ad spend you manage</li>
                  <li>Each client set up within {SETUP_DAYS} days</li>
                </ul>
                <Link className="btn btn-line" href="/agencies" style={{ alignSelf: "flex-start" }}>Ask about an agency agreement</Link>
              </article>
            </div>
            <p className="small">No monthly platform fee. Our fee is included in the price of your ads.</p>
          </div>
        </section>

        <section className="section" style={{ padding: "56px 0" }}>
          <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "baseline" }}>
            <h2 className="h3" style={{ fontSize: 20, flex: "1 1 240px" }}>Industries we set up most</h2>
            <div className="chips" style={{ flex: "999 1 560px" }}>
              {INDUSTRY_PAGES.map((i) => <Link className="chip" key={i.slug} href={`/industries/${i.slug}`} style={{ textDecoration: "none", color: "inherit" }}>{i.name}</Link>)}
            </div>
          </div>
        </section>

        <section className="section" style={{ borderTop: "1px solid var(--line)", padding: "72px 0" }}>
          <div className="wrap stack g24">
            <div className="stack g12" style={{ maxWidth: 680 }}>
              <h2 className="h2">How we compare.</h2>
              <p className="p" style={{ fontSize: 16 }}>Already looked at another platform? See setup, minimums and fees side by side.</p>
            </div>
            <div className="grid cols-3" style={{ gap: 12 }}>
              {COMPARISONS.map((c) => (
                <Link key={c.slug} className="linkrow" href={`/${c.slug}`}>
                  <span>DSP Connect vs {c.name}</span><span aria-hidden="true" style={{ color: "var(--blue)" }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section band" style={{ padding: "64px 0" }}>
          <div className="wrap stack g24">
            <h2 className="h2" style={{ fontSize: 28 }}>What you can check before you pay.</h2>
            <div className="grid cols-4">
              {TRUST.map(([t, d, href, label]) => (
                <div className="step stack g8" key={t}><h3 className="h3">{t}</h3><p className="p" style={{ fontSize: 14 }}>{d}</p>
                  {href.startsWith("http") ? <a href={href} target="_blank" rel="noopener" style={{ fontSize: 14 }}>{label}</a> : <Link href={href} style={{ fontSize: 14 }}>{label}</Link>}</div>
              ))}
            </div>
          </div>
        </section>

        <section className="section dark" style={{ padding: "72px 0" }}>
          <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: 40, alignItems: "center", justifyContent: "space-between" }}>
            <div className="stack g12" style={{ flex: "1 1 480px", minWidth: 0 }}>
              <div className="eyebrow" style={{ color: "var(--soft)" }}>Ready when you are</div>
              <h2 className="h2">Open your account today. Be live within {SETUP_DAYS} days.</h2>
              <p className="p" style={{ fontSize: 16 }}>Fill in your details, pay your ad budget online, and we set up the rest.</p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="btn btn-white" href="/open-account">Open your account</Link>
              <a className="btn btn-line" style={{ borderColor: "#fff", color: "#fff" }} href={MEETING_URL} target="_blank" rel="noopener">Book a call first</a>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap stack g24" style={{ maxWidth: 880 }}>
            <h2 className="h2" style={{ fontSize: 28 }}>Common questions</h2>
            <div>
              {FAQ.map(([q, a]) => (
                <div className="faq stack g8" key={q}><h3 className="h3" style={{ fontSize: 16 }}>{q}</h3><p className="p">{a}</p></div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
