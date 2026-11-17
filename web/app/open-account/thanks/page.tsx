import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header } from "@/components/Chrome";
import { markPaid, stripe } from "@/lib/payments";
import { SETUP_DAYS } from "@/lib/site";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

export default async function Thanks({ searchParams }: PageProps<"/open-account/thanks">) {
  const q = await searchParams;
  const id = Array.isArray(q.session_id) ? q.session_id[0] : q.session_id;
  let state: "paid" | "pending" | "error" = "error";
  let lead = "";
  const client = stripe();
  if (client && id && /^cs_[A-Za-z0-9_]+$/.test(id)) {
    try {
      const session = await client.checkout.sessions.retrieve(id);
      state = await markPaid(session);
      lead = session.client_reference_id || "";
    } catch (err) {
      console.error("thanks lookup failed", err);
    }
  }
  const copy = {
    paid: ["Payment received. Your setup has started.", `We now create your account, place your tracking, review your ads and build your audience. You will be live within ${SETUP_DAYS} days, and we will email you at each step.`],
    pending: ["Thank you. Your payment is on its way.", `Bank transfers take a few days to clear. Your ${SETUP_DAYS}-day setup starts as soon as the payment arrives, and we will email you when it does.`],
    error: ["We could not confirm your payment yet.", "If you completed payment, you do not need to pay again. We will confirm by email. If you did not, you can start again below."],
  }[state];
  return (
    <>
      <Header />
      <main className="wrap stack g24" style={{ padding: "96px 32px", maxWidth: 720 }}>
        <h1 className="h1" style={{ fontSize: "clamp(30px,4vw,42px)" }}>{copy[0]}</h1>
        <p className="lead">{copy[1]}</p>
        {state === "paid" && lead && (
          <div className="card stack g12" style={{ background: "var(--ground)" }}>
            <h2 className="h3" style={{ fontSize: 18 }}>One thing we need from you</h2>
            <p className="p">Your ads and the person who manages your website, within 5 days. It takes about three minutes, and the same page shows your setup progress.</p>
            <Link className="btn btn-blue" href={`/welcome?id=${lead}`} style={{ alignSelf: "flex-start" }}>Go to your setup page</Link>
            <p className="small">We have also emailed you this link. Your login details arrive in separate emails once your account is approved.</p>
          </div>
        )}
        {state === "error" && <Link className="btn btn-line" href="/open-account" style={{ alignSelf: "flex-start" }}>Back to the form</Link>}
      </main>
      <Footer />
    </>
  );
}
