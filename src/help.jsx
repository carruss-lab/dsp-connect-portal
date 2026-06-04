import { useState } from "react";

export const HELP = {
  dashboard: {
    title: "Dashboard",
    icon: "layout-dashboard",
    summary: "Your command center — everything at a glance.",
    sections: [
      {
        heading: "Active AUM",
        body: "AUM = Ad Spend Under Management — your total monthly ad spend across all Active clients. This is the number your 10% compensation is calculated from. Only clients in Active status count. Clients in Lead, Review, or Approved do NOT count yet."
      },
      {
        heading: "Monthly Compensation",
        body: "You earn 10% of your Active AUM every month. Example: $500,000 in active spend = $50,000 monthly comp. Payment is processed after DSP Connect collects funds from advertisers, typically within 30 days of month end."
      },
      {
        heading: "Partner Score",
        body: "A 0–100 health score based on your AUM level, total clients, and number of active clients. 70+ is strong. Below 40 means you need more active clients. Check it daily as a performance gauge."
      },
      {
        heading: "90-Day Acceleration Windows",
        body: "You have three windows to earn bonus equity on top of your 5% base grant:\n\nDay 1–30: up to 3% bonus\nDay 31–60: up to 3% bonus\nDay 61–90: up to 4% bonus\n\nEach window has AUM targets. Missed windows are permanently forfeited — they do not roll over. Your first 90 days are critical."
      },
      {
        heading: "Announcements",
        body: "Official messages from DSP Connect operations. Policy updates, program changes, and important notices. These appear automatically — check here regularly."
      }
    ]
  },
  clients: {
    title: "Adding Clients",
    icon: "building-skyscraper",
    summary: "How to add clients and move them through to Active.",
    sections: [
      {
        heading: "Brand clients vs Agency clients",
        body: "Brand clients are direct advertisers — companies buying ads for their own products.\n\nAgency clients are advertising agencies managing spend on behalf of multiple brands.\n\nBoth count toward your AUM at full value. Add each type under their respective menu section."
      },
      {
        heading: "Step 1 — Basic info",
        body: "Enter the company name, contact person, email, and estimated monthly ad spend. The spend you enter is your estimate — the actual figure is confirmed when DSP Connect activates the campaign."
      },
      {
        heading: "Step 2 — Campaign brief",
        body: "This is the full intake form sent to DSP Connect for review. Fill it out completely — goals, budget, geography, creative format, device targeting, KPIs, and tracking setup. The more detail you provide, the faster your client gets approved and activated."
      },
      {
        heading: "After you submit",
        body: "Your client lands in Review status and DSP Connect operations is notified immediately. Review typically takes 1–2 business days. You will receive an email when the status changes. Once Active, the client counts toward your monthly compensation and equity."
      },
      {
        heading: "Pipeline stages explained",
        body: "Lead → added, not yet submitted to DSP Connect\nDeposit Paid → client has paid their deposit\nReview → submitted, under DSP Connect review\nApproved → approved, campaign being set up\nActive → LIVE — counts toward your AUM and compensation"
      }
    ]
  },
  compensation: {
    title: "Compensation",
    icon: "currency-dollar",
    summary: "How your 10% flat rate works — no tiers, no caps.",
    sections: [
      {
        heading: "The 10% flat rate",
        body: "You earn 10% of all Qualified Ad Spend Under Management. Qualified means the spend has been contracted, activated, invoiced, AND collected by DSP Connect. There are no tiers, no caps, no minimums — flat 10% on everything that qualifies."
      },
      {
        heading: "What does NOT qualify",
        body: "Unpaid invoices, chargebacks, refunds, disputed charges, and write-offs do not count. If an advertiser doesn't pay DSP Connect, that spend is removed from your calculation for that period."
      },
      {
        heading: "When you get paid",
        body: "Payouts are processed monthly after DSP Connect collects from advertisers. There is no fixed calendar date. When the admin records your payout, you receive an email with the amount, period covered, and reference number."
      },
      {
        heading: "No salary or guarantee",
        body: "Your compensation is entirely production-based. DSP Connect does not guarantee any minimum payment. No Active clients = no income that month. Build your client base to build consistent income."
      },
      {
        heading: "Reading your payout history",
        body: "Use the Weekly / Monthly / All filter to view records. Each entry shows the date, period covered, amount, and a reference number (check, wire, or ACH). Keep these for your financial records."
      }
    ]
  },
  equity: {
    title: "Equity & Ownership",
    icon: "chart-donut",
    summary: "Your path to LLC membership — how vesting and acceleration works.",
    sections: [
      {
        heading: "Your base equity grant — 5%",
        body: "Every Managing Partner has a 5% LLC membership interest grant. It does not vest automatically. You must: (1) reach $5M annual AUM in your first 12 months, AND (2) complete your full 1-year anniversary. Both conditions are required."
      },
      {
        heading: "The $5M AUM threshold",
        body: "You must generate $5,000,000 in annual managed ad spend during Year 1. If you fall short, your equity grant does not vest and you receive nothing from the equity pool. This is a hard threshold, not a soft target."
      },
      {
        heading: "The 1-year cliff",
        body: "Even if you hit $5M AUM on Day 1, equity does not vest until your 1-year anniversary. Leave before that date for any reason and you forfeit everything — base grant and all acceleration earned."
      },
      {
        heading: "Acceleration windows in detail",
        body: "Day 1–30 targets:\n  $50k AUM → +0.5% | $100k → +1.5% | $500k → +3.0%\n\nDay 31–60 targets:\n  $500k AUM → +1.0% | $1M → +2.0% | $2M → +3.0%\n\nDay 61–90 targets:\n  $1M AUM → +2.0% | $2M → +3.0% | $3M → +4.0%\n\nMaximum total Year 1: 15% (5% base + 10% acceleration)"
      },
      {
        heading: "Missed windows are permanent",
        body: "A window that passes without hitting its AUM target is permanently forfeited. It does not roll into the next window. Each window is independent. A miss on Day 1–30 does not affect your Day 31–60 window — but that missed equity is gone forever."
      },
      {
        heading: "What equity means in practice",
        body: "As an LLC member you share in profits and enterprise value of DSP Connect. The exact economic terms are in your Master Operating Agreement. Contact DSP Connect operations for questions about distributions or valuations."
      }
    ]
  },
  pipeline: {
    title: "Pipeline",
    icon: "git-branch",
    summary: "Track every client from first contact to live campaign.",
    sections: [
      {
        heading: "Moving a client forward",
        body: "On the Pipeline page, each client card has a stage dropdown at the bottom. Select the new stage to advance it. You can also update stage from the Brand Clients or Agency Clients tables using the same dropdown."
      },
      {
        heading: "When to submit for Review",
        body: "Submit when you have a signed commitment or strong verbal agreement to proceed. Do not submit speculative prospects — DSP Connect reviews every submission personally and needs confirmed intent."
      },
      {
        heading: "What happens in Review",
        body: "DSP Connect operations reads your campaign brief, verifies the client, and confirms the campaign can be executed. This typically takes 1–2 business days. You receive an email when status changes to Approved or if the team has questions."
      },
      {
        heading: "Active = earning",
        body: "The moment a client reaches Active status, their spend counts toward your AUM and monthly compensation. Your #1 goal is moving clients from Lead to Active as fast as possible — that is how you build your income."
      }
    ]
  },
  support: {
    title: "Help Desk",
    icon: "headset",
    summary: "Reach DSP Connect operations — we respond within 1 business day.",
    sections: [
      {
        heading: "When to submit a ticket",
        body: "Use the Help Desk for: client approval questions, billing discrepancies, portal issues, or anything you cannot resolve yourself. Check this help guide first — most common questions are answered here."
      },
      {
        heading: "Issue types",
        body: "Client Issue → problem with a specific client or campaign\nAgency Issue → problem with an agency relationship\nBilling Issue → question about your compensation or a payout\nTechnical Issue → portal not working correctly\nOther → anything else"
      },
      {
        heading: "Response time",
        body: "DSP Connect responds to all tickets within 1 business day. You receive an email notification when your ticket is updated. Check your spam folder if you don't see it."
      },
      {
        heading: "For urgent issues",
        body: "If an issue is affecting a live campaign or is time-sensitive, write URGENT in the subject line. This flags it for immediate review by the operations team."
      }
    ]
  },
  resources: {
    title: "Training & Resources",
    icon: "school",
    summary: "Guides, videos, and SOPs uploaded by DSP Connect.",
    sections: [
      {
        heading: "Training",
        body: "Video walkthroughs, platform guides, and certification content. Click any card to play the video or open the resource directly in the portal. YouTube videos play inline — you never leave the portal. New content is added regularly."
      },
      {
        heading: "SOPs",
        body: "Standard Operating Procedures — step-by-step guides for onboarding clients, setting up campaigns, and handling common situations. These are the official DSP Connect processes. Follow them exactly."
      },
      {
        heading: "Documents",
        body: "Your signed agreements, policy documents, and reference materials. These include your Admission Notice, Exhibit A and B, and any updates to program terms. Keep copies for your own records."
      }
    ]
  }
};

const S_LABEL = {
  fontSize: 10,
  color: "var(--text3)",
  letterSpacing: "0.6px",
  textTransform: "uppercase",
  fontWeight: 500,
};

export function Tip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 4 }}>
      {children}
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: "50%", background: "var(--bg3)", color: "var(--text3)", fontSize: 9, fontWeight: 700, cursor: "help", flexShrink: 0, border: "0.5px solid var(--line3)", fontFamily: "var(--font)" }}
      >?</span>
      {show && (
        <span style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: "#1A1D2E", color: "#fff", fontSize: 11, lineHeight: 1.5, padding: "7px 10px", borderRadius: 6, whiteSpace: "normal", maxWidth: 220, minWidth: 140, zIndex: 999, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", pointerEvents: "none", textAlign: "left" }}>
          {text}
          <span style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #1A1D2E" }} />
        </span>
      )}
    </span>
  );
}

export function HelpDrawer({ topic, onClose }) {
  const content = HELP[topic];
  if (!content) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 900 }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 460, background: "var(--bg)", borderLeft: "0.5px solid var(--line2)", zIndex: 901, display: "flex", flexDirection: "column", boxShadow: "-4px 0 32px rgba(0,0,0,0.10)" }}>
        <div style={{ padding: "18px 20px", borderBottom: "0.5px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "var(--blue-bg)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className={`ti ti-${content.icon}`} style={{ fontSize: 16, color: "var(--blue)" }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{content.title} — Guide</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>{content.summary}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", fontSize: 18, padding: 4, lineHeight: 1, display: "flex", alignItems: "center" }}>
            <i className="ti ti-x" />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {content.sections.map((s, i) => (
            <div key={i} style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ display: "inline-block", width: 20, height: 20, background: "var(--blue)", borderRadius: "50%", color: "#fff", fontSize: 10, fontWeight: 700, textAlign: "center", lineHeight: "20px", flexShrink: 0, fontFamily: "var(--mono)" }}>{i + 1}</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{s.heading}</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.75, whiteSpace: "pre-wrap", paddingLeft: 28 }}>{s.body}</div>
            </div>
          ))}
          <div style={{ margin: 20, padding: 16, background: "var(--blue-bg)", borderRadius: 8, border: "0.5px solid rgba(26,20,212,0.12)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--blue)", marginBottom: 4 }}>Still need help?</div>
            <div style={{ fontSize: 11, color: "var(--text2)", lineHeight: 1.65 }}>Submit a support ticket from the Help Desk section. DSP Connect responds within 1 business day.</div>
          </div>
        </div>
      </div>
    </>
  );
}

export function HelpBtn({ topic, setHelp }) {
  return (
    <button
      onClick={() => setHelp(topic)}
      style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--blue)", background: "var(--blue-bg)", border: "0.5px solid rgba(26,20,212,0.15)", borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontFamily: "var(--font)", flexShrink: 0, whiteSpace: "nowrap", fontWeight: 500 }}
    >
      <i className="ti ti-help-circle" style={{ fontSize: 12 }} />How this works
    </button>
  );
}

export function GlobalHelpBtn({ setHelp }) {
  return (
    <button
      onClick={() => setHelp("dashboard")}
      style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--blue)", background: "var(--blue-bg)", border: "0.5px solid rgba(26,20,212,0.15)", borderRadius: 5, padding: "6px 10px", cursor: "pointer", fontFamily: "var(--font)", width: "100%", marginBottom: 10, fontWeight: 500 }}
    >
      <i className="ti ti-help-circle" style={{ fontSize: 13 }} />Help &amp; guides
    </button>
  );
}
