import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header } from "@/components/Chrome";
import { FACTS } from "@/lib/facts";
import { ID, JsonLd, PROFILES, SLOGAN, pageGraph, pageMeta } from "@/lib/seo";
import { HELP_URL, LEGAL_ENTITY, MIN_BUDGET, SETUP_DAYS, SHARE_PCT, PARTNER_PCT, SUPPORT_EMAIL } from "@/lib/site";

const DESCRIPTION = `About DSP Connect: programmatic advertising on streaming TV, apps and websites for any business from a $${MIN_BUDGET} ad budget, set up for you.`;
export const metadata: Metadata = pageMeta({ title: "About DSP Connect", description: DESCRIPTION, path: "/about" });

const WHO: [string, string, string][] = [
  ["Business owners", `Advertise on streaming TV, apps and websites from a $${MIN_BUDGET} ad budget. We set up the account, tracking, ads and audience, and ads are live within ${SETUP_DAYS} days.`, "/open-account"],
  ["Agencies", `Run your clients' programmatic advertising on DSP Connect, keep the client relationship, and earn ${SHARE_PCT}% of the ad spend you manage.`, "/agencies"],
  ["Sales partners", `ISOs, merchant-services agents and independent reps introduce DSP Connect to the businesses they already call on and earn ${PARTNER_PCT}% of their clients' qualified ad spend.`, "/partners"],
];

const PROFILE_NAMES: Record<string, string> = {
  "https://www.youtube.com/@getdspconnect": "YouTube",
  "https://www.linkedin.com/company/getdspconnect": "LinkedIn",
};

export default function About() {
  return (
    <>
      <JsonLd data={pageGraph({
        path: "/about", type: "AboutPage", name: "About DSP Connect", description: DESCRIPTION,
        trail: [["Home", "/"], ["About", "/about"]], main: ID.org, about: [ID.org, ID.ads],
      })} />
      <Header />
      <main className="wrap narrow stack g56" style={{ padding: "64px 32px 80px" }}>
        <section className="stack g16">
          <div className="eyebrow">About</div>
          <h1 className="h1" style={{ fontSize: "clamp(32px,4.4vw,46px)", maxWidth: 860 }}>{SLOGAN}</h1>
          <p className="lead" style={{ maxWidth: 720 }}>
            DSP Connect is a programmatic advertising service. It buys ads on streaming TV, apps and websites, the same
            kind of buying big brands do through platforms like The Trade Desk and Amazon DSP, and opens it to any business
            and agency without an enterprise contract.
          </p>
        </section>

        <section className="stack g16" aria-labelledby="facts-h">
          <h2 id="facts-h" className="h2" style={{ fontSize: 24 }}>DSP Connect at a glance</h2>
          <div className="tablebox">
            <table>
              <tbody>
                {FACTS.map(([k, v]) => (
                  <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="stack g16" aria-labelledby="who-h">
          <h2 id="who-h" className="h2" style={{ fontSize: 24 }}>Who it is for</h2>
          <div className="grid cols-3" style={{ gap: 16 }}>
            {WHO.map(([h, t, href]) => (
              <article key={h} className="card stack g8">
                <h3 className="h3" style={{ fontSize: 18 }}>{h}</h3>
                <p className="p">{t}</p>
                <Link href={href} className="small">Learn more</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="stack g12" aria-labelledby="co-h">
          <h2 id="co-h" className="h2" style={{ fontSize: 24 }}>The company</h2>
          <p className="p">
            DSP Connect is a service of {LEGAL_ENTITY}. Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>, visit
            the <a href={HELP_URL}>help center</a>, or see how we compare with{" "}
            <Link href="/compare">other advertising platforms</Link>.
          </p>
          <p className="p">
            Follow DSP Connect on{" "}
            {PROFILES.filter((u) => PROFILE_NAMES[u]).map((u, i, a) => (
              <span key={u}><a href={u} rel="me noopener" target="_blank">{PROFILE_NAMES[u]}</a>{i < a.length - 1 ? " and " : "."}</span>
            ))}
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}

