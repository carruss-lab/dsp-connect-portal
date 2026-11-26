import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header, TalkBand } from "@/components/Chrome";
import LeadForm from "@/components/LeadForm";
import { PARTNERSTACK_AGENCY_URL, SETUP_DAYS, SHARE_PCT } from "@/lib/site";
import VideoEmbed from "@/components/VideoEmbed";
import PlannerVideo from "@/components/PlannerVideo";
import { VIDEOS, videoNode } from "@/lib/videos";
import { AGENCY_PROGRAM, JsonLd, SITE_URL, pageGraph, pageMeta } from "@/lib/seo";

const DESCRIPTION = `Run client campaigns on DSP Connect and earn ${SHARE_PCT}% of the ad spend you manage.`;
export const metadata: Metadata = pageMeta({ title: "For agencies", description: DESCRIPTION, path: "/agencies", image: `${SITE_URL}/agencies/opengraph-image`, ogTitle: `For agencies: keep your clients, earn ${SHARE_PCT}% of what they spend | DSP Connect` });

const POINTS = [
  ["Your clients stay yours", "We never contact, bill or sell to your clients. You own the relationship."],
  ["All clients in one account", "Each client gets their own login, with the access you choose for them."],
  [`${SHARE_PCT}% of the ad spend you manage`, "Paid through PartnerStack on spend your clients actually run, on top of the fees you already charge."],
  [`Each client set up in ${SETUP_DAYS} days`, "We create the account, place tracking, review ads and build the audience."],
  ["Your whole sales team, tracked", "Invite your reps from your PartnerStack dashboard. Each gets their own link, every client is tracked to the rep who brought it, and all commission comes to your agency."],
];
const money = (s: number) => `$${((s * SHARE_PCT) / 100).toLocaleString("en-US")}`;

export default function Agencies() {
  return (
    <>
      <JsonLd data={pageGraph({ path: "/agencies", name: "For agencies", description: DESCRIPTION, trail: [["Home", "/"], ["For agencies", "/agencies"]], main: AGENCY_PROGRAM, nodes: [videoNode(VIDEOS.agencies, "/agencies"), videoNode(VIDEOS.plannerAgencies, "/agencies", "planner-video"), videoNode(VIDEOS.teamAgencies, "/agencies", "team-video")], image: `${SITE_URL}/agencies/opengraph-image` })} />
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
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a className="btn btn-blue" href={PARTNERSTACK_AGENCY_URL} target="_blank" rel="noopener noreferrer">Join the agency program</a>
                <Link className="btn btn-line" href="/demo?view=agency">See the agency demo</Link>
              </div>
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
        <section className="wrap" style={{ padding: "8px 32px 56px" }} aria-labelledby="video-h">
          <div className="stack g16" style={{ maxWidth: 960, margin: "0 auto" }}>
            <h2 id="video-h" className="h2" style={{ textAlign: "center" }}>See the agency program in 90 seconds</h2>
            <p className="p" style={{ textAlign: "center" }}>Your clients stay yours. You earn 10% of the ad spend you manage.</p>
            <VideoEmbed id={VIDEOS.agencies.id} title={VIDEOS.agencies.title} poster={VIDEOS.agencies.poster} />
          </div>
        </section>
        <PlannerVideo v={VIDEOS.plannerAgencies} id="planner" eyebrow="Free ad planner" title="Walk into every pitch with a plan." cta="Try it on your next prospect"
          points={["Turn any prospect's website into a streaming TV and programmatic plan in about 30 seconds.", "A channel mix with reasons tied to their site, and the budget split in dollars.", "Open it in the demo and build the campaign live in the meeting.", "Run existing clients' sites to see where streaming TV and native fit next."]} />
        <section className="section band">
          <div className="wrap grid cols-4">
            {POINTS.map(([t, d]) => (
              <div className="step stack g8" key={t}><h3 className="h3">{t}</h3><p className="p" style={{ fontSize: 14 }}>{d}</p></div>
            ))}
          </div>
        </section>
        <PlannerVideo v={VIDEOS.teamAgencies} id="team" eyebrow="Your sales team" title="Add your reps in PartnerStack." cta="Sign in to PartnerStack" href="https://dash.partnerstack.com"
          points={["Click your initials, then Members & Invites.", "Invite by email, and choose Member for each salesperson.", "Each rep gets their own referral link and sees only their own customers and commissions.", "Every customer is credited to your agency, and only the owner and Finance can withdraw."]} />
        <section className="section" aria-labelledby="which-h">
          <div className="wrap narrow stack g16">
            <h2 id="which-h" className="h2">Agency or Sales Partner?</h2>
            <p className="p"><b>Join as an agency</b> if you run your clients&apos; campaigns yourself, in your own agency account with a login for each client. You keep the client relationship and earn {SHARE_PCT}% of the ad spend you manage, paid through PartnerStack.</p>
            <p className="p"><b>Become a <Link href="/partners">Sales Partner</Link></b> if you introduce business owners and want DSP Connect to set up and run their advertising. You earn {SHARE_PCT}% of each client&apos;s qualified ad spend, paid daily through Stripe, for as long as they spend.</p>
            <p className="p">Both programs let you add your sales team: agencies invite reps from their PartnerStack dashboard, and Sales Partners add reps in their partner portal. Either way, every client is tracked to the rep who brought it and all commission comes to you.</p>
          </div>
        </section>
        <TalkBand agency />
      </main>
      <Footer />
    </>
  );
}
