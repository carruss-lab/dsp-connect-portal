import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import PrintButton from "@/components/partner/PrintButton";
import { loadPortal } from "@/lib/partner";
import { FEE_LINE } from "@/lib/salesKit";
import { LEGAL_ENTITY, MIN_BUDGET, SETUP_DAYS, siteOrigin } from "@/lib/site";

export const metadata: Metadata = { title: "Your leave-behind", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// A one-page sheet a Sales Partner prints or saves as a PDF for business owners. It carries the
// partner's own demo link and QR code, so anyone who opens an account from it is credited to them.
export default async function LeaveBehind() {
  const portal = await loadPortal();
  if (!portal) redirect("/partner");
  const p = portal.partner;
  const link = `${siteOrigin()}/demo?p=${p.code}`;
  const short = link.replace(/^https?:\/\//, "");
  const qr = await QRCode.toString(link, { type: "svg", margin: 0, color: { dark: "#0A1220", light: "#FFFFFF" } });

  return (
    <>
      <style>{`
        @page { size: letter; margin: 0.5in; }
        body { background: #E9EBF0; }
        .sheet { background: #fff; max-width: 8.5in; min-height: 10in; margin: 24px auto; padding: 0.6in; box-shadow: 0 2px 16px rgba(10,18,32,.12); color: #0A1220; }
        .sheet h1 { font-size: 34px; line-height: 1.15; margin: 0; letter-spacing: -0.01em; }
        .sheet h2 { font-size: 16px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: .06em; color: #1A14D4; }
        .sheet p, .sheet li { font-size: 15px; line-height: 1.5; margin: 0; }
        .cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
        .box { border: 1px solid #DADDF7; border-radius: 10px; padding: 16px; }
        .qr svg { width: 1.6in; height: 1.6in; display: block; }
        .noprint { max-width: 8.5in; margin: 16px auto 0; display: flex; gap: 12px; align-items: center; justify-content: space-between; padding: 0 8px; }
        @media print { body { background: #fff; } .sheet { box-shadow: none; margin: 0; padding: 0; min-height: auto; } .noprint, .intercom-lightweight-app, #intercom-container, iframe { display: none !important; } }
        @media (max-width: 720px) { .cols { grid-template-columns: 1fr; } .sheet { padding: 24px; } .sheet h1 { font-size: 26px; } }
      `}</style>
      <div className="noprint">
        <a href="/partner" className="small">← Back to your portal</a>
        <PrintButton />
      </div>
      <main className="sheet" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/logo.png" alt="" width={34} height={34} />
          <b style={{ fontSize: 20 }}>DSP Connect</b>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h1>Put your business on streaming TV, websites and apps, in front of people in your area.</h1>
          <p style={{ fontSize: 17 }}>DSP Connect sets up your advertising account for you, and you see exactly where your ads run and who they reach.</p>
        </div>
        <div className="cols">
          <div className="box"><h2>1. See it first</h2><p>Open a sample account set up for a business like yours, before you spend anything.</p></div>
          <div className="box"><h2>2. Start small</h2><p>Accounts start from a ${MIN_BUDGET} ad budget. {FEE_LINE} No long-term contract.</p></div>
          <div className="box"><h2>3. We set it up</h2><p>Account, tracking, ad review and audience, done for you. Live within {SETUP_DAYS} days.</p></div>
        </div>
        <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap", border: "2px solid #1A14D4", borderRadius: 12, padding: 20 }}>
          <div className="qr" dangerouslySetInnerHTML={{ __html: qr }} aria-label="QR code for your demo" role="img" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: "1 1 260px" }}>
            <h2 style={{ margin: 0 }}>Open your demo</h2>
            <p>Scan the code or visit</p>
            <p style={{ fontSize: 18, fontWeight: 700, wordBreak: "break-all" }}>{short}</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h2>Your contact</h2>
          <p style={{ fontSize: 17, fontWeight: 700 }}>{p.name}</p>
          {p.company_name && <p>{p.company_name}</p>}
          <p>Authorized Sales Partner, DSP Connect</p>
          <p>{p.email}{p.phone ? ` · ${p.phone}` : ""}</p>
        </div>
        <p style={{ fontSize: 11, color: "#5B6577", marginTop: "auto" }}>DSP Connect is a service of {LEGAL_ENTITY}. {p.name} is an independent Authorized Sales Partner. Accounts are opened and paid for directly with DSP Connect. Results vary and are not guaranteed.</p>
      </main>
    </>
  );
}
