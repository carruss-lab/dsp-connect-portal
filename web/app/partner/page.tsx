import type { Metadata } from "next";
import Image from "next/image";
import ConnectButton from "@/components/ConnectButton";
import IdentifyClient from "@/components/IdentifyClient";
import { messengerJwt } from "@/lib/chatId";
import { CopyLink, CopyTemplate, LessonDone, LoginForm, SignDocs } from "@/components/partner/PartnerBits";
import { loadPortal, type Client, type Portal } from "@/lib/partner";
import { refreshPayouts } from "@/lib/partnerStripe";
import { DOCS, VERSION } from "@/lib/partnerDocs";
import { LEGAL_ENTITY, SETUP_DAYS, SHARE_PCT, SUPPORT_EMAIL, siteOrigin } from "@/lib/site";
import { LESSONS } from "@/lib/training";
import VideoEmbed from "@/components/VideoEmbed";
import { VIDEOS } from "@/lib/videos";
import { CALL_SCRIPT, EMAILS, OBJECTIONS, fill } from "@/lib/salesKit";

export const metadata: Metadata = { title: "Partner portal", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const usd = (v: number) => "$" + Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const day = (iso: string | null) => (iso ? new Date(iso.length === 10 ? iso + "T12:00:00Z" : iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Phoenix" }) : "");

function Top({ name }: { name?: string }) {
  return (
    <header className="header"><div className="wrap">
      <span className="brand"><Image src="/logo.png" alt="" width={30} height={30} />DSP Connect</span>
      <span className="small" style={{ flexGrow: 1 }}>Sales Partner portal</span>
      {name && <form action="/api/partner/logout" method="post"><span className="small" style={{ marginRight: 12 }}>{name}</span><button className="btn btn-line" style={{ minHeight: 34 }}>Sign out</button></form>}
    </div></header>
  );
}

function clientStatus(c: Client, today: string) {
  if (c.live_at) return { text: "Live", tone: "#14532D" };
  if (!c.paid_at) return { text: "Not paid yet", tone: "#5B6577" };
  const late = c.setup_due && c.setup_due < today;
  return { text: `In setup: ${c.steps_done} of 4${c.brief_sent ? "" : ", brief not sent"}${c.setup_due ? `, due ${day(c.setup_due)}` : ""}`, tone: late ? "#8A1C0E" : "#7A4B00" };
}

export default async function PartnerPortal({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const portal = await loadPortal();
  if (!portal) {
    return (
      <>
        <Top />
        <main className="wrap stack g24" style={{ padding: "72px 32px 96px", maxWidth: 520 }}>
          <div className="eyebrow">Authorized Sales Partners</div>
          <h1 className="h1" style={{ fontSize: 36 }}>Sign in to your partner portal.</h1>
          <p className="lead">Enter the email address you applied with. We will email you a link to sign in; no password needed.</p>
          <LoginForm expired={sp.link === "expired"} />
          <p className="small">Not a Sales Partner yet? <a href="/partners">Apply to become an Authorized Sales Partner</a>. Business owners can <a href="/open-account">open an account here</a>.</p>
        </main>
      </>
    );
  }
  if (portal.partner.stripe_started && !portal.partner.payouts_ready) {
    portal.partner.payouts_ready = await refreshPayouts({ invite_token: portal.partner.invite_token, stripe_account_id: portal.partner.stripe_account_id, payouts_ready: false });
  }
  return <Dashboard portal={portal} />;
}

function Dashboard({ portal }: { portal: Portal }) {
  const { partner: p, clients, earnings: e, payouts, training, today } = portal;
  const signed = !!p.signed_at;
  const trained = !!p.training_done_at;
  const origin = siteOrigin();
  const first = p.name.split(" ")[0];
  const steps = [
    { t: "Sign your Sales Partner Agreement", done: signed },
    { t: "Set up payouts with Stripe", done: p.payouts_ready },
    { t: "Complete the training", done: trained },
    { t: "Bring your first client", done: clients.some((c) => c.paid_at) },
  ];
  const ended = p.status === "paused";
  const live = clients.filter((c) => c.live_at).length;
  const week = clients.reduce((s, c) => s + Number(c.spent_7d || 0), 0);

  return (
    <>
      <Top name={p.name} />
      <IdentifyClient email={p.email} name={p.name} jwt={messengerJwt(p.email, p.name)} />
      <main className="wrap stack g32" style={{ padding: "48px 32px 96px", maxWidth: 1040 }}>
        <div className="stack g8">
          <div className="eyebrow">Authorized Sales Partner{p.vertical ? ` · ${p.vertical}` : ""}</div>
          <h1 className="h1" style={{ fontSize: "clamp(30px,4vw,42px)" }}>Welcome, {first}.</h1>
          {ended && <p className="note note-err">Your partner link is paused. New clients are not being credited to you. Contact DSP Connect for details.</p>}
        </div>

        <section className="card stack g16" aria-labelledby="prog">
          <h2 id="prog" className="h3">Your progress</h2>
          <ol className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", listStyle: "none", padding: 0, margin: 0 }}>
            {steps.map((s, i) => (
              <li key={s.t} className="stack g8" style={{ padding: 14, borderRadius: 8, background: s.done ? "#E8F3EC" : "var(--ground, #F5F6F8)" }}>
                <span className="num">{s.done ? "✓" : `0${i + 1}`}</span><span style={{ fontWeight: 600 }}>{s.t}</span>
              </li>
            ))}
          </ol>
        </section>

        {!signed ? (
          <section className="stack g24" aria-labelledby="docs">
            <div className="stack g8">
              <h2 id="docs" className="h2">Step 1: your Sales Partner Agreement</h2>
              <p className="lead">Read each document, accept it, and sign, as yourself or for your company. You will get a signed copy by email.</p>
            </div>
            {DOCS.map((d) => (
              <details key={d.id} className="card stack g12" open={d.id === "agreement"}>
                <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 18 }}>{d.tag}: {d.title}</summary>
                <div className="stack g12" style={{ marginTop: 12, maxHeight: 520, overflowY: "auto", paddingRight: 8 }}>
                  {d.sections.map((s, i) => (
                    <div key={i} className="stack g8">
                      {s.h && <h3 className="h3" style={{ fontSize: 16 }}>{s.h}</h3>}
                      {s.p.map((t, j) => <p key={j} className="p" style={{ fontSize: 15 }}>{t}</p>)}
                    </div>
                  ))}
                </div>
              </details>
            ))}
            <div className="card stack g16">
              <SignDocs docs={DOCS.map((d) => ({ id: d.id, label: `${d.tag} (${d.title})` }))} defaultName={p.name} entity={p.entity_type || "individual"} company={p.company_name || ""} />
              <p className="small">Document version {VERSION}. {LEGAL_ENTITY}.</p>
            </div>
          </section>
        ) : (
          <>
            <section className="grid cols-4" aria-label="Your numbers">
              <div className="card stack g8"><span className="small">Clients</span><span className="h2">{clients.filter((c) => c.paid_at).length}</span><span className="small">{live} live</span></div>
              <div className="card stack g8"><span className="small">Client spend, last 7 days</span><span className="h2">{usd(week)}</span></div>
              <div className="card stack g8"><span className="small">Commission on hold</span><span className="h2">{usd(e.holding)}</span><span className="small">{e.next_release ? `Next release ${day(e.next_release)}` : "7-day hold"}</span></div>
              <div className="card stack g8"><span className="small">Paid to you</span><span className="h2">{usd(e.paid)}</span><span className="small">{Number(e.ready) > 0 ? `${usd(e.ready)} ready to pay` : "Paid daily through Stripe"}</span></div>
            </section>

            {!p.payouts_ready && (
              <section className="card stack g12" aria-labelledby="pay">
                <h2 id="pay" className="h3">Verify with Stripe to get approved</h2>
                <p className="p">This is your last step to approval: once Stripe verifies you, you are approved automatically and your client links start crediting you. Commission is paid daily to your bank through Stripe, after a 7-day hold. You give your bank and tax details to Stripe directly; DSP Connect never sees them.</p>
                <ConnectButton token={p.invite_token} label={p.stripe_started ? "Finish payout setup" : "Set up payouts with Stripe"} />
                {p.stripe_started && <p className="small">If Stripe is still reviewing your details this can take a day. Use the button if Stripe asks for anything more.</p>}
              </section>
            )}

            <section className="card stack g16" aria-labelledby="links">
              <h2 id="links" className="h3">Your client links</h2>
              <p className="p">Clients who open their account through these links are credited to you{p.status === "invited" ? " once you are approved (Stripe verified)" : ""}. Your partner code is <b>{p.code}</b>.</p>
              <CopyLink label="Open an account" url={`${origin}/open-account?p=${p.code}`} />
              <CopyLink label="Free ad plan from their website" url={`${origin}/planner?p=${p.code}`} />
              <CopyLink label="Show the demo" url={`${origin}/demo?p=${p.code}`} />
              <CopyLink label="Home page" url={`${origin}/?p=${p.code}`} />
              {!trained && <p className="note" style={{ background: "#FFF6E5", color: "#7A4B00" }}>Please finish the training below before you introduce clients.</p>}
            </section>

            <section className="card stack g16" aria-labelledby="planner-h">
              <h2 id="planner-h" className="h3">Your sales tool: the free ad planner</h2>
              <p className="p">Type in a business owner&apos;s website and hand them a streaming TV and programmatic ad plan for their business in about 30 seconds. Use your planner link above: plans and sign-ups from it are credited to you, even if the owner finishes later on their own device.</p>
              <VideoEmbed id={VIDEOS.plannerPartners.id} title={VIDEOS.plannerPartners.title} poster={VIDEOS.plannerPartners.poster} />
              <p className="small">Never promise results or quote what an ad will produce. The plan doesn&apos;t, and neither should you.</p>
            </section>

            <section className="stack g16" aria-labelledby="kit">
              <div className="stack g8">
                <h2 id="kit" className="h3">Your sales kit</h2>
                <p className="p">Everything here already has your links in it. Replace the words in [brackets] before you send.</p>
              </div>
              <div className="card stack g12" style={{ background: "var(--ground)" }}>
                <h3 className="h3" style={{ fontSize: 16 }}>Leave-behind</h3>
                <p className="p" style={{ fontSize: 15 }}>A one-page sheet for business owners with your name, your demo link and a QR code. Print it or save it as a PDF to attach to emails.</p>
                <a className="btn btn-blue" href="/partner/leave-behind" target="_blank" rel="noopener" style={{ alignSelf: "flex-start" }}>Open your leave-behind</a>
              </div>
              <h3 className="h3" style={{ fontSize: 16 }}>Emails to prospects</h3>
              {EMAILS.map((t) => {
                const v = { first: "[first name]", business: "[business name]", me: p.name, company: p.company_name || "Authorized Sales Partner, DSP Connect", demo: `${origin}/demo?p=${p.code}`, open: `${origin}/open-account?p=${p.code}` };
                return <CopyTemplate key={t.id} title={t.title} when={t.when} subject={fill(t.subject, v)} body={fill(t.body, v)} />;
              })}
              <details className="card stack g8">
                <summary style={{ cursor: "pointer", fontWeight: 600 }}>First-call script <span className="small" style={{ fontWeight: 400 }}>· about 20 minutes</span></summary>
                <ol className="stack g12" style={{ marginTop: 8 }}>{CALL_SCRIPT.map((c) => (
                  <li key={c.step} className="stack g4"><b>{c.step}</b><ul className="list">{c.say.map((x) => <li key={x}>{x}</li>)}</ul></li>
                ))}</ol>
              </details>
              <details className="card stack g8">
                <summary style={{ cursor: "pointer", fontWeight: 600 }}>Answers to common questions</summary>
                <div className="stack g12" style={{ marginTop: 8 }}>{OBJECTIONS.map((o) => (
                  <div key={o.q} className="stack g4"><b>&ldquo;{o.q}&rdquo;</b><p className="p" style={{ fontSize: 15 }}>{o.a}</p></div>
                ))}</div>
              </details>
            </section>

            <section className="stack g16" aria-labelledby="cl">
              <h2 id="cl" className="h3">Your clients</h2>
              {clients.length === 0 ? (
                <p className="p">No clients yet. When someone opens an account through your link, they appear here with their setup progress, spend and your commission.</p>
              ) : (
                <div className="tablebox"><table>
                  <thead><tr><th scope="col">Client</th><th scope="col">Status</th><th scope="col">Budget paid</th><th scope="col">Spend, 7 days</th><th scope="col">Spend, total</th><th scope="col">Your commission</th></tr></thead>
                  <tbody>{clients.map((c) => {
                    const st = clientStatus(c, today);
                    return (
                      <tr key={c.id}>
                        <th scope="row"><div>{c.business || c.name || c.email}</div><div className="small">{[c.industry, c.market].filter(Boolean).join(" · ")}</div></th>
                        <td style={{ color: st.tone }}>{st.text}</td>
                        <td className="mono">{c.amount_paid ? usd(c.amount_paid) : "—"}</td>
                        <td className="mono">{usd(c.spent_7d)}</td>
                        <td className="mono">{usd(c.spent_total)}</td>
                        <td className="mono">{usd(c.earned)}</td>
                      </tr>
                    );
                  })}</tbody>
                </table></div>
              )}
              <p className="small">Setup takes {SETUP_DAYS} days from payment. The most common delay is the client&apos;s campaign brief; help them send it early. For billing, refunds or access, send clients to {SUPPORT_EMAIL}.</p>
            </section>

            <section className="stack g16" aria-labelledby="tr">
              <div className="stack g8">
                <h2 id="tr" className="h3">Training {trained ? "(complete)" : `(${LESSONS.filter((l) => training.includes(l.id)).length} of ${LESSONS.length} done)`}</h2>
                <p className="p">Fourteen short video lessons, about 25 minutes in all: the program, the product, selling, after the sale and the rules. Watch them in order and tick each checklist only when it is true.</p>
              </div>
              {LESSONS.map((l, i) => {
                const done = training.includes(l.id);
                return (
                  <details key={l.id} className="card stack g12" open={!trained && !done && LESSONS.slice(0, i).every((x) => training.includes(x.id))}>
                    <summary style={{ cursor: "pointer", fontWeight: 600 }}>{done ? "✓ " : `${i + 1}. `}{l.title} <span className="small" style={{ fontWeight: 400 }}>· {l.minutes} min</span></summary>
                    <VideoEmbed id={l.video} title={`Lesson ${i + 1}: ${l.title}`} />
                    <ul className="list" style={{ marginTop: 12 }}>{l.points.map((t, j) => <li key={j}>{t}</li>)}</ul>
                    <LessonDone id={l.id} check={l.check} done={done} />
                  </details>
                );
              })}
            </section>

            <section className="stack g16" aria-labelledby="po">
              <h2 id="po" className="h3">Payments to you</h2>
              {payouts.length === 0 ? <p className="p">No payments yet. Commission on each day&apos;s qualified spend is paid 7 days later.</p> : (
                <div className="tablebox"><table style={{ minWidth: 360 }}>
                  <thead><tr><th scope="col">Date</th><th scope="col">Amount</th></tr></thead>
                  <tbody>{payouts.map((x, i) => <tr key={i}><th scope="row">{day(x.created_at)}</th><td className="mono">{usd(x.amount)}</td></tr>)}</tbody>
                </table></div>
              )}
              {Number(e.reversed) > 0 && <p className="small">Reversed commission (refunds or chargebacks): {usd(e.reversed)}.{Number(e.owed) > 0 ? ` ${usd(e.owed)} of it was already paid and will be deducted from your next payment.` : ""}</p>}
            </section>

            <section className="card stack g8">
              <h2 className="h3">Help</h2>
              <p className="p">Use the chat button at the bottom of this page. Fin can help you prepare advice for a client, and anything about payouts, commission or your clients goes to our Sales Partner Support team.</p>
              <p className="small">You signed your Sales Partner Agreement on {day(p.signed_at)} as {p.legal_name}{p.entity_type === "company" && p.company_name ? `, ${p.signer_title || "authorized signer"} of ${p.company_name}` : ""}. You earn {SHARE_PCT}% of qualified ad spend, with residuals for as long as your clients spend. Need another copy? Ask in the chat.</p>
            </section>
          </>
        )}
      </main>
    </>
  );
}
