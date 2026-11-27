import { createHash } from "crypto";
import { LEGAL_ENTITY, MIN_BUDGET, PARTNER_PCT } from "./site";

// The Authorized Sales Partner documents: a person or a company, approved automatically once the agreement
// is signed and Stripe verifies them, paid commission only with residuals for life. Approved for use by the
// owner on 2026-11-26. To change the wording, edit the text here and raise VERSION, so every signature
// records exactly which wording was agreed.
export const VERSION = "2026-11-26.2";

export const PROGRAM = "Authorized Sales Partner";

export type Doc = { id: string; tag: string; title: string; sections: { h?: string; p: string[] }[] };

const CO = LEGAL_ENTITY;

export const DOCS: Doc[] = [
  {
    id: "agreement",
    tag: "Agreement",
    title: "Authorized Sales Partner Agreement",
    sections: [
      { p: [
        `This Agreement appoints you as an Authorized Sales Partner of DSP Connect, a service of ${CO} ("DSP Connect", "we", "us"). "You" means the person, or the company, named where this Agreement is signed. It takes effect when you sign it below. Together with the Compensation Policy (Exhibit A) and the Operating Rules (Exhibit B), it is the whole agreement between you and us about the program.`,
      ] },
      { h: "1. Your role", p: [
        "You introduce businesses (\"clients\") to DSP Connect and help them succeed on it. You act as an independent contractor. You are not an employee, agent, partner in law, member or officer of DSP Connect or of " + CO + ", and you may not sign anything or make any promise on our behalf.",
        "You decide your own hours and methods, provide your own tools and pay your own expenses, taxes and insurance. Nothing in this Agreement creates an employment relationship, a franchise or a joint venture.",
      ] },
      { h: "2. Signing for a company", p: [
        "If you sign for a company, the company is the Authorized Sales Partner and the person signing confirms they are authorized to bind it. The company is responsible for everyone at the company who sells under its partner link, and for making sure they follow the Operating Rules.",
      ] },
      { h: "3. Approval and no sub-agents", p: [
        "You are approved as an Authorized Sales Partner once you have signed this Agreement and Stripe has verified your payout account. We may decline an application, and either of us may end this Agreement under section 6. Your appointment is personal to you (or to your company); you may not transfer it. You may not appoint sub-agents, resellers or referral partners, or let anyone outside your company sell under your partner link, unless we agree in writing.",
      ] },
      { h: "4. Pay", p: [
        `You earn cash commission only, as set out in Exhibit A: ${PARTNER_PCT}% of the qualified ad spend of clients credited to you, for as long as those clients keep spending (residuals). There is no salary, draw, equity or guaranteed income of any kind. Any earlier description of equity, ownership or profit share in DSP Connect or ${CO} does not apply to you.`,
      ] },
      { h: "5. Clients belong to DSP Connect", p: [
        "Every client account, contract, login, campaign and record belongs to DSP Connect. Clients contract and pay DSP Connect directly. You may not take payment from a client, hold a client's money, or set a client's price.",
      ] },
      { h: "6. Term and ending", p: [
        "This Agreement continues until either side ends it. Either side may end it at any time with 30 days' written notice by email. We may end it immediately for cause: if you break the Operating Rules or this Agreement, act dishonestly, or harm a client or DSP Connect.",
        "Residuals continue after this Agreement ends. If it ends for any reason other than cause, you keep earning commission on the qualified ad spend of clients credited to you before the end date, for as long as they keep spending, under Exhibit A, provided you keep a working payout account and keep to sections 7 and 8. No client can be credited to you after the end date.",
        "If we end this Agreement for cause, or you break section 7 or 8 after it ends, residuals stop: commission is paid only on qualified ad spend up to the date we end it or you break those sections, less any reversals under Exhibit A.",
      ] },
      { h: "7. Confidential information", p: [
        "You will keep confidential everything you learn about DSP Connect that is not public, including our technology providers, costs, margins, internal pricing, client lists and client data, during this Agreement and after it ends. You may use client information only to serve that client through DSP Connect.",
      ] },
      { h: "8. No soliciting", p: [
        "While this Agreement is in force and for 12 months after it ends, you will not ask any client credited to you to move its programmatic advertising away from DSP Connect, and you will not ask any DSP Connect staff member or Authorized Sales Partner to leave. This does not stop you from working in advertising or from serving anyone who comes to you without your asking.",
      ] },
      { h: "9. Our materials", p: [
        "The demo, training, sales materials, brand and everything we provide remain ours. You may use them only while you are an Authorized Sales Partner and only to introduce clients to DSP Connect.",
      ] },
      { h: "10. Liability", p: [
        "Neither side is liable to the other for indirect or consequential loss. Our total liability to you under this Agreement is limited to the commission paid to you in the 3 months before the claim. You will cover any loss we suffer because you, or anyone selling under your partner link, broke the Operating Rules or the law.",
      ] },
      { h: "11. General", p: [
        `This Agreement is governed by the laws of the state in which ${CO} is organized. We may update the Exhibits by emailing you 30 days before the change takes effect; if you keep selling after that date you accept the change. A change to the rate in Exhibit A applies only to spend after the change takes effect. Notices are given by email to the address on your partner record.`,
      ] },
    ],
  },
  {
    id: "compensation",
    tag: "Exhibit A",
    title: "Compensation Policy",
    sections: [
      { h: "1. Rate", p: [`You earn ${PARTNER_PCT}% of the qualified ad spend of each client credited to you.`] },
      { h: "2. Which clients are credited to you", p: [
        "A client is credited to you when it opens its DSP Connect account through your partner link or with your partner code, after you have signed this Agreement. A client cannot be credited to more than one partner. If a client was already in contact with DSP Connect before your introduction, we decide in good faith who it is credited to, and our decision is final.",
      ] },
      { h: "3. Residuals", p: [
        "A client stays credited to you for as long as its DSP Connect account is open, including after this Agreement ends, except as section 6 of the Agreement says. You keep earning on every dollar of qualified ad spend that client runs, month after month, with no cap and no end date.",
      ] },
      { h: "4. Qualified ad spend", p: [
        "Qualified ad spend is ad budget that the client has paid to DSP Connect in full and that has actually been spent running the client's ads, as recorded by DSP Connect.",
        "These are not qualified ad spend: budget not yet spent; amounts refunded to the client; amounts disputed, charged back or reversed by the client's bank; unpaid or written-off amounts; taxes and payment processing fees; and any spend on an account opened in breach of the Operating Rules.",
      ] },
      { h: "5. When you are paid", p: [
        "Commission for each day's qualified ad spend is held for 7 days, then paid daily to your bank account through Stripe. You must set up and keep a Stripe payout account in your own name, or your company's name if you signed for a company; we cannot pay you until it is active.",
        "You give your bank and tax details to Stripe directly. You are responsible for your own taxes. We may issue tax forms as required by law.",
      ] },
      { h: "6. Reversals", p: [
        "If spend that earned commission later stops being qualified (for example because of a refund or chargeback), the commission on it is reversed. If it has not been paid yet, it is cancelled. If it has been paid, it is deducted from your next payments. If you have no further commission to deduct within 90 days, you will repay it within 30 days of our request.",
      ] },
      { h: "7. Your statement", p: [
        "Your partner portal shows each credited client, their spend, the commission earned, commission on hold, and payments made. If you think anything is wrong, tell us within 60 days of the payment or it is treated as correct.",
      ] },
    ],
  },
  {
    id: "rules",
    tag: "Exhibit B",
    title: "Operating Rules",
    sections: [
      { h: "1. Honest selling", p: [
        "Describe DSP Connect accurately and only as our current materials describe it. Never promise or estimate results, leads, sales, rankings or return on ad spend. Never say an offer is limited or ending when it is not.",
        `State prices exactly as we publish them: accounts start from a $${MIN_BUDGET} ad budget; there is no monthly platform fee; our fee is included in the price of the ads. Never quote a different price, discount or fee.`,
      ] },
      { h: "2. What you never say", p: [
        "Never name or describe our technology providers, our costs, margins, mark-ups or how our fee is calculated.",
        "Never offer to run, manage or optimize a client's campaigns for them, or offer any service we do not sell. DSP Connect sets accounts up; the client runs them with our help.",
        "Never advise a client to add money, raise their budget or spend more. Give advice on creative, audience, areas, tracking, landing pages and pacing instead.",
        "Never describe yourself as DSP Connect staff, or as a reseller who sets prices or bills clients. Describe yourself as an independent Authorized Sales Partner of DSP Connect.",
      ] },
      { h: "3. Client money and data", p: [
        "Clients always pay DSP Connect directly through our website. Never take, hold or forward a client's money, card details or passwords. Use client information only to help that client on DSP Connect, and keep it secure.",
      ] },
      { h: "4. Marketing", p: [
        "Do not send bulk email, texts or messages to people who have not agreed to hear from you, and follow the anti-spam and privacy laws where you and the client are. Do not buy ads on our brand name, or register domains or social accounts that use \"DSP Connect\".",
      ] },
      { h: "5. Training and support", p: [
        "Complete the Authorized Sales Partner training in your portal before you introduce clients; if you signed for a company, make sure everyone who sells under your link learns the same material and follows these rules. Send client questions about billing, refunds, cancellations or account access to DSP Connect support rather than answering them yourself.",
      ] },
      { h: "6. Breaking the rules", p: [
        "If you break these rules we may withhold or reverse commission on the affected accounts, pause your partner link, or end this Agreement for cause, which stops residuals.",
      ] },
    ],
  },
];

/** The exact text of every document, so a signature can prove which wording was agreed. */
export function docText(): string {
  return DOCS.map((d) => [`${d.tag}: ${d.title}`, ...d.sections.flatMap((s) => [s.h || "", ...s.p])].filter(Boolean).join("\n")).join("\n\n");
}
export const docHash = () => createHash("sha256").update(VERSION + "\n" + docText()).digest("hex");
