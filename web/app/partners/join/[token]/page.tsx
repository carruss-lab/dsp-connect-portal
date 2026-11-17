import type { Metadata } from "next";
import Image from "next/image";
import ConnectButton from "@/components/ConnectButton";
import { refreshPayouts } from "@/lib/partnerStripe";
import { isUuid, secretRpc } from "@/lib/server";
import { LEGAL_ENTITY, SHARE_PCT } from "@/lib/site";

export const metadata: Metadata = { title: "Your Managing Partner invitation", robots: { index: false, follow: false } };
type Partner = { id: string; name: string; email: string; status: string; code: string; stripe_account_id: string | null; payouts_ready: boolean };

export default async function Join({ params }: PageProps<"/partners/join/[token]">) {
  const { token } = await params;
  let partner: Partner | null = null;
  if (isUuid(token)) {
    try { partner = (await secretRpc<Partner[]>("partner_by_token", { p_token: token }))[0] || null; } catch (err) { console.error("join lookup failed", err); }
  }
  const started = !!partner?.stripe_account_id;
  const ready = partner ? await refreshPayouts({ ...partner, invite_token: token }) : false;

  return (
    <>
      <header className="header"><div className="wrap"><span className="brand"><Image src="/logo.png" alt="" width={30} height={30} />DSP Connect</span><span className="small">Managing Partner invitation</span></div></header>
      <main className="wrap stack g32" style={{ padding: "72px 32px 96px", maxWidth: 760 }}>
        {!partner || partner.status === "ended" ? (
          <><h1 className="h1" style={{ fontSize: 36 }}>This invitation link is not valid.</h1><p className="lead">Check that you opened the full link from your invitation email, or reply to the person who invited you.</p></>
        ) : (
          <>
            <div className="stack g16">
              <div className="eyebrow">By invitation only</div>
              <h1 className="h1" style={{ fontSize: "clamp(30px,4.4vw,44px)" }}>Welcome, {partner.name.split(" ")[0]}.</h1>
              <p className="lead">You have been invited to join DSP Connect as a Managing Partner. You earn {SHARE_PCT}% of the qualified ad spend of the clients you bring in, paid daily.</p>
            </div>
            <ol className="stack g16" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li className="card stack g8">
                <div className="num">01</div><h2 className="h3">Open your partner portal</h2>
                <p className="p">Sign in with {partner.email} to read and sign your admission documents, complete the short training, and see your clients and earnings.</p>
                <a className="btn btn-blue" style={{ alignSelf: "flex-start" }} href="/partner">{partner.status === "invited" ? "Sign your admission documents" : "Go to your portal"}</a>
              </li>
              <li className="card stack g12" style={ready ? { borderColor: "#14532D" } : undefined}>
                <div className="num">02</div><h2 className="h3">Set up your payouts</h2>
                {ready ? (
                  <p className="note note-ok">Your payout account is set up. Commission will be paid to the bank account you gave Stripe.</p>
                ) : (
                  <>
                    <p className="p">Payouts are made through Stripe. You give your bank and tax details directly to Stripe on their secure page; DSP Connect never sees or stores them.</p>
                    <ConnectButton token={token} label={started ? "Finish payout setup" : partner.stripe_account_id ? "Continue payout setup" : "Set up payouts with Stripe"} />
                    {started && <p className="small">Stripe is still reviewing your details. If it asks for anything more, use the button above.</p>}
                  </>
                )}
              </li>
              <li className="card stack g8">
                <div className="num">03</div><h2 className="h3">Your client link</h2>
                <p className="p">Once you are admitted, clients who open their account through your link are credited to you automatically.</p>
                <div className="dm-code" style={{ marginTop: 0 }}>getdspconnect.com/?p={partner.code}</div>
                <p className="small">Your partner code is <b>{partner.code}</b>. The link starts crediting you once your admission documents are signed.</p>
              </li>
            </ol>
            <p className="small">Managing Partners are independent contractors of {LEGAL_ENTITY}, not employees. There is no salary and no guaranteed income.</p>
          </>
        )}
      </main>
    </>
  );
}
