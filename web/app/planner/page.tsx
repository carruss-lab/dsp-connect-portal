import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header } from "@/components/Chrome";
import PlannerApp from "@/components/PlannerApp";
import PlannerVideo from "@/components/PlannerVideo";
import { VIDEOS, videoNode } from "@/lib/videos";
import { ID, JsonLd, SITE_URL, pageGraph, pageMeta } from "@/lib/seo";
import { MIN_BUDGET, SETUP_DAYS } from "@/lib/site";

const PATH = "/planner";
const DESCRIPTION =
  "Enter your website and get a free ad plan: streaming TV, video, display, native and retargeting, split for your budget, with targeting and tracking.";

export const metadata: Metadata = pageMeta({ title: "Free Ad Planner for Streaming TV and Programmatic", description: DESCRIPTION, path: PATH });

const COVERS: [string, string][] = [
  ["What we learned from your website", "What you sell, who buys it, where they are and what they do on your site."],
  ["Your channel mix", `Streaming TV (CTV), online video, display, native and retargeting: which fit you, and how to split the starting budget you choose (from $${MIN_BUDGET}).`],
  ["Who we reach", "Locations, ages, audiences and the content they watch and read."],
  ["The ads you need", "Formats, sizes and lengths, and the message for each."],
  ["How results are counted", "The one result to track, and how tracking is set up."],
  ["Your first 30 days", "From opening your account to your ads going live and the first review."],
];

const FAQ: [string, string][] = [
  ["How does the ad planner work?", "You enter your website, business name, industry, area and the starting budget you have in mind. We read your homepage and a few key pages, such as services, products and contact, then write a starting ad plan for streaming TV, online video, display, native and retargeting ads, split for that budget."],
  ["Is the ad plan free?", "Yes. The plan is free and saved to your email. It goes with you if you open an account, and we use it for your setup and campaign brief."],
  ["What is CTV advertising?", "CTV (connected TV) advertising means video ads on streaming TV apps watched on a television, such as smart TVs and streaming sticks. You can target it by location, age and interest, like online ads."],
  ["What does the plan cost to run?", `Accounts start from a $${MIN_BUDGET} ad budget. No monthly platform fee. Our fee is included in the price of your ads. Your ads are live within ${SETUP_DAYS} days of payment.`],
  ["Does the plan predict my results?", "No. Advertising can't guarantee results. The plan says what each channel is for and how results are counted. We confirm it with you before anything runs."],
  ["What do you do with my website?", "We read the public pages of your website once to write the plan. We do not change anything on your site."],
];

export default function Planner() {
  const graph = pageGraph({
    path: PATH, name: "Free ad planner", description: DESCRIPTION, trail: [["Home", "/"], ["Ad planner", PATH]], about: [ID.ads, ID.org],
    faq: FAQ, main: `${SITE_URL}${PATH}#app`,
    nodes: [{
      "@type": "WebApplication", "@id": `${SITE_URL}${PATH}#app`, name: "DSP Connect ad planner", url: `${SITE_URL}${PATH}`,
      applicationCategory: "BusinessApplication", operatingSystem: "Any (web browser)", browserRequirements: "Requires JavaScript",
      description: DESCRIPTION, isAccessibleForFree: true, provider: { "@id": ID.org }, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: COVERS.map(([t]) => t),
    },
    videoNode(VIDEOS.plannerOwners, PATH),
    {
      "@type": "HowTo", "@id": `${SITE_URL}${PATH}#howto`, name: "How to get a free ad plan from your website",
      description: "Get a streaming TV and programmatic ad plan written from your own website, then build the campaign in the demo account.",
      totalTime: "PT1M", tool: [{ "@type": "HowToTool", name: "Your business website" }], video: { "@id": `${SITE_URL}${PATH}#video` },
      step: [
        ["Enter your details", "Enter your website, business name, email, industry, where your customers are and your starting budget (from $" + MIN_BUDGET + ")."],
        ["Get your plan", "We read your website and write a plan: what you sell and who buys it, the channel mix and budget split, who to reach, the ads you need and how results are counted."],
        ["See it in your demo account", "Open the plan in your demo account and press Build this campaign to fill in the campaign builder from the plan."],
        ["Open your account with the plan", "Open your account with the plan attached. We use it for your setup, and your ads are live within " + SETUP_DAYS + " days."],
      ].map(([name, text], i) => ({ "@type": "HowToStep", position: i + 1, name, text, url: `${SITE_URL}${PATH}#app` })),
    }],
  });
  return (
    <>
      <JsonLd data={graph} />
      <Header />
      <main>
        <section id="top" className="hero" style={{ paddingBottom: 48, scrollMarginTop: 80 }}>
          <PlannerApp intro={
            <>
              <div className="eyebrow">Free ad planner</div>
              <h1 className="h1" style={{ maxWidth: 720 }}>Your website in. Your ad plan out.</h1>
              <p className="lead" style={{ maxWidth: 640 }}>
                Enter your website and we read it the way a media planner would, then write a plan for streaming TV, online video,
                display, native and retargeting ads: which channels fit, how to split the budget you choose (from ${MIN_BUDGET}), who to reach,
                which ads you need and how results are counted.
              </p>
              <ul className="list" style={{ fontSize: 15 }}>
                <li>Free, in about 30 seconds.</li>
                <li>Saved to your email, and it carries into your account.</li>
                <li>Open it in your demo account and build the campaign.</li>
              </ul>
            </>
          } />
        </section>

        <PlannerVideo v={VIDEOS.plannerOwners} id="watch" eyebrow="Watch" title="See the planner in 60 seconds." cta="Get your free ad plan" href="#top"
          points={["Enter your website, area and the budget you have in mind.", "Get the channel mix and budget split, in dollars, with the reason for each.", "Open it in your demo account and build the campaign.", "Open your account with the plan attached when you are ready."]} />

        <section className="section band" aria-labelledby="covers-h">
          <div className="wrap stack g24">
            <h2 id="covers-h" className="h2">What your plan covers</h2>
            <div className="grid cols-3" style={{ gap: 16 }}>
              {COVERS.map(([t, d], i) => (
                <div key={t} className="step stack g8"><div className="num">{String(i + 1).padStart(2, "0")}</div><h3 className="h3">{t}</h3><p className="p" style={{ fontSize: 15 }}>{d}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="faq-h">
          <div className="wrap narrow stack g24">
            <h2 id="faq-h" className="h2">Questions about the ad planner</h2>
            <div>{FAQ.map(([q, a]) => <div key={q} className="faq stack g8"><h3 className="h3">{q}</h3><p className="p faq-a">{a}</p></div>)}</div>
            <p className="small">Want to see the platform first? <Link href="/#market">Open the demo account</Link> or <Link href="/videos">watch the videos</Link>.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
