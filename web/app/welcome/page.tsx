import type { Metadata } from "next";
import { Footer, Header } from "@/components/Chrome";
import IdentifyClient from "@/components/IdentifyClient";
import IntakeForm from "@/components/IntakeForm";
import { isUuid, secretRpc } from "@/lib/server";
import { HELP_URL, MEETING_URL, SETUP_DAYS, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Your setup", robots: { index: false, follow: false } };

type Status = {
  email: string; business: string | null; name: string | null; paid_at: string; amount_paid: number | null; setup_due: string | null; website: string | null;
  step_account_at: string | null; step_tracking_at: string | null; step_ads_at: string | null; step_audience_at: string | null; live_at: string | null; intake_at: string | null;
  intake: Record<string, string> | null; formats: string | null; market: string | null; goals: string | null;
};
const STEPS: [keyof Status, string, string][] = [
  ["step_account_at", "Account created", "Your account exists and your ad budget is loaded."],
  ["step_tracking_at", "Tracking placed", "Your website counts the visits and leads your ads produce."],
  ["step_ads_at", "Ads approved", "Your ads are checked and accepted by the ad exchanges."],
  ["step_audience_at", "Audience built", "Your ads are aimed at the right people in your area."],
];
const TODO = (s: Status): [boolean, string, React.ReactNode][] => [
  [!!s.intake_at, "Fill in your campaign brief", <>Your goals, customers, campaigns, ads and website. <a href="#brief">Go to the brief</a>. Please send it within 5 days of paying.</>],
  [false, "Book your kickoff call", <>Twenty minutes to walk through your brief and agree the plan. <a href={MEETING_URL} target="_blank" rel="noopener">Choose a time</a>.</>],
  [false, "Watch for your login emails", "Once your account is approved, your login details arrive in separate emails. Keep them safe."],
];
const day = (iso: string) => new Date(iso.slice(0, 10) + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });

// A paying client's private page: where their setup stands, and where they send us what we need.
export default async function Welcome({ searchParams }: PageProps<"/welcome">) {
  const id = String((await searchParams).id || "");
  let s: Status | null = null;
  if (isUuid(id)) { try { s = await secretRpc<Status | null>("client_status", { p_lead: id }); } catch (err) { console.error("welcome failed", err); } }

  if (!s) {
    return (
      <>
        <Header />
        <main className="wrap stack g16" style={{ maxWidth: 640, padding: "96px 32px" }}>
          <h1 className="h2">We could not find that setup page.</h1>
          <p className="p">Use the link in your payment email. If you cannot find it, email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and we will send it again.</p>
        </main>
        <Footer />
      </>
    );
  }
  const done = STEPS.filter(([k]) => s![k]).length;
  return (
    <>
      <Header />
      <IdentifyClient email={s.email} name={s.name} />
      <main className="wrap narrow stack g32" style={{ padding: "64px 32px 80px" }}>
        <div className="stack g12">
          <div className="eyebrow">Your setup{s.business ? ` · ${s.business}` : ""}</div>
          <h1 className="h1" style={{ fontSize: "clamp(30px,4vw,42px)" }}>
            {s.live_at ? "Your ads are live." : done === STEPS.length ? "Setup is finished. Final checks before launch." : `${done} of ${STEPS.length} setup steps done.`}
          </h1>
          <p className="lead">
            {s.live_at ? `They went live on ${day(s.live_at)}. You will get a summary every Monday.`
              : s.setup_due ? `Your ads will be live by ${day(s.setup_due)}.` : `Your ads will be live within ${SETUP_DAYS} days of your payment.`}
          </p>
        </div>

        <ol className="grid" style={{ listStyle: "none", padding: 0, margin: 0, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
          {STEPS.map(([k, t, d], i) => (
            <li className="step stack g8" key={k} style={{ borderTopColor: s![k] ? "var(--blue)" : "var(--line)" }}>
              <div className="num">{String(i + 1).padStart(2, "0")} · {s![k] ? `Done ${day(s![k] as string)}` : "In progress"}</div>
              <h2 className="h3">{t}</h2>
              <p className="p" style={{ fontSize: 14 }}>{d}</p>
            </li>
          ))}
        </ol>

        <section className="stack g16">
          <h2 className="h3" style={{ fontSize: 19 }}>Your part: three things</h2>
          <ol className="stack g12" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {TODO(s).map(([done, t, d]) => (
              <li key={t} className="card" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 16 }}>
                <span aria-hidden="true" style={{ flex: "0 0 24px", height: 24, borderRadius: 12, border: "2px solid", borderColor: done ? "var(--blue)" : "var(--line)", background: done ? "var(--blue)" : "transparent", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{done ? "✓" : ""}</span>
                <div className="stack g8"><h3 className="h3" style={{ fontSize: 16 }}>{t}{done ? <span className="small"> · done</span> : ""}</h3><p className="p" style={{ fontSize: 14 }}>{d}</p></div>
              </li>
            ))}
          </ol>
        </section>

        {!s.live_at && (
          <section id="brief" className="card stack g24" style={{ background: "var(--ground)", maxWidth: 820, scrollMarginTop: 80 }}>
            <div className="stack g8">
              <h2 className="h2" style={{ fontSize: 24 }}>{s.intake_at ? "Your campaign brief" : "Your campaign brief: tell us what you want to achieve"}</h2>
              <p className="p">
                {s.intake_at ? `You sent this on ${day(s.intake_at)}. Change anything below and send it again.`
                  : "These are the questions an advertising consultant asks before building a first campaign. Your answers decide what we build, who we aim it at and what we count as a result. It takes about ten minutes, and only a few answers are required. The rest help us do a better job."}
              </p>
            </div>
            <IntakeForm lead={id} saved={s.intake} defaults={{ landing_page: s.website || "", areas: s.market || "", formats: s.formats || "", other_goals: s.goals || "" }} />
          </section>
        )}

        <section className="grid cols-3">
          <div className="stack g8"><h2 className="h3">Emails to expect</h2><p className="p" style={{ fontSize: 14 }}>One from us each time a step is finished and when you go live. Your login details arrive in separate emails once your account is approved.</p></div>
          <div className="stack g8"><h2 className="h3">Questions</h2><p className="p" style={{ fontSize: 14 }}>Use the chat on this page, read <a href={HELP_URL}>the help center</a>, or email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p></div>
          <div className="stack g8"><h2 className="h3">Talk to a person</h2><p className="p" style={{ fontSize: 14 }}><a href={MEETING_URL} target="_blank" rel="noopener">Book a 20-minute call</a> and we will walk through your setup with you.</p></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
