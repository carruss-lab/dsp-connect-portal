import type { Metadata } from "next";
import { Footer, Header, TalkBand } from "@/components/Chrome";
import LeadForm from "@/components/LeadForm";
import { MIN_BUDGET, SETUP_DAYS } from "@/lib/site";
import { JsonLd, crumbs } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/open-account" },
  title: "Open your account",
  description: `Fill in your details, pay your ad budget online, and be live within ${SETUP_DAYS} days.`,
};

export default function OpenAccount() {
  return (
    <>
      <JsonLd data={crumbs([["Home", "/"], ["Open your account", "/open-account"]])} />
      <Header />
      <main className="wrap" style={{ padding: "64px 32px 80px", display: "flex", flexWrap: "wrap", gap: 56, alignItems: "flex-start" }}>
        <div className="stack g24" style={{ flex: "1 1 380px", minWidth: 0 }}>
          <div className="eyebrow">Open your account</div>
          <h1 className="h1" style={{ fontSize: "clamp(32px,4.4vw,46px)" }}>Tell us about your business. We set up the rest.</h1>
          <p className="lead">One form, one payment, and your ads are live within {SETUP_DAYS} days.</p>
          <ol className="list" style={{ fontSize: 15 }}>
            <li>Fill in this form.</li>
            <li>Pay your starting ad budget (minimum ${MIN_BUDGET}).</li>
            <li>We create your account, place your tracking, review your ads and build your audience.</li>
            <li>You get your login and your ads go live.</li>
          </ol>
        </div>
        <div className="card stack g16" style={{ flex: "1 1 420px", maxWidth: 560, minWidth: 0, background: "var(--ground)" }}>
          <LeadForm kind="account" cta="Continue to payment" />
        </div>
        <TalkBand />
      </main>
      <Footer />
    </>
  );
}
