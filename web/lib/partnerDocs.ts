import { createHash } from "crypto";
import { LEGAL_ENTITY, MIN_BUDGET, SHARE_PCT } from "./site";

// The Managing Partner admission documents. Drafted from the earlier partner terms and updated for
// commission only, daily payouts and the 7-day hold. DRAFT FOR LEGAL REVIEW: change the text here,
// then raise VERSION, so every signature records exactly which wording was agreed.
export const VERSION = "2026-11-16.1";

export type Doc = { id: string; tag: string; title: string; sections: { h?: string; p: string[] }[] };

const CO = LEGAL_ENTITY;

export const DOCS: Doc[] = [
  {
    id: "notice",
    tag: "Admission Notice",
    title: "Managing Partner Admission Notice",
    sections: [
      { p: [
        `This Admission Notice admits you as a Managing Partner of DSP Connect, a service of ${CO} ("DSP Connect", "we", "us"). It takes effect when you sign it below. Together with the Cash Compensation Policy (Exhibit A) and the Operating Rules (Exhibit B), it is the whole agreement between you and us about the Managing Partner program.`,
      ] },
      { h: "1. Your role", p: [
        "You introduce businesses (\"clients\") to DSP Connect and help them succeed on it. You act as an independent contractor. You are not an employee, agent, partner in law, member or officer of DSP Connect or of " + CO + ", and you may not sign anything or make any promise on our behalf.",
        "You decide your own hours and methods, provide your own tools and pay your own expenses, taxes and insurance. Nothing in this agreement creates an employment relationship, a franchise or a joint venture.",
      ] },
      { h: "2. Invitation only", p: [
        "The program is by invitation. Your admission is personal to you; you may not transfer it, share your partner link with others to sell on your behalf, or appoint sub-partners.",
      ] },
      { h: "3. Pay", p: [
        `You earn cash commission only, as set out in Exhibit A: ${SHARE_PCT}% of the qualified ad spend of clients credited to you. There is no salary, draw, equity or guaranteed income of any kind. Any earlier description of equity, ownership or profit share in DSP Connect or ${CO} does not apply to you.`,
      ] },
      { h: "4. Clients belong to DSP Connect", p: [
        "Every client account, contract, login, campaign and record belongs to DSP Connect. Clients contract and pay DSP Connect directly. You may not take payment from a client, hold a client's money, or set a client's price.",
      ] },
      { h: "5. Term and ending", p: [
        "This agreement continues until either side ends it. Either side may end it at any time with 30 days' written notice by email. We may end it immediately if you break the Operating Rules, act dishonestly, or harm a client or DSP Connect.",
        "When it ends, commission on qualified ad spend up to the end date is paid on the normal schedule, less any reversals under Exhibit A. No commission is earned on spend after the end date unless we agree otherwise in writing.",
      ] },
      { h: "6. Confidential information", p: [
        "You will keep confidential everything you learn about DSP Connect that is not public, including our technology providers, costs, margins, internal pricing, client lists and client data, during the agreement and after it ends. You may use client information only to serve that client through DSP Connect.",
      ] },
      { h: "7. No soliciting after you leave", p: [
        "For 12 months after this agreement ends, you will not ask any client credited to you to move its programmatic advertising away from DSP Connect, and you will not ask any DSP Connect staff member or Managing Partner to leave. This does not stop you from working in advertising or from serving anyone who comes to you without your asking.",
      ] },
      { h: "8. Our materials", p: [
        "The demo, training, sales materials, brand and everything we provide remain ours. You may use them only while you are a Managing Partner and only to introduce clients to DSP Connect.",
      ] },
      { h: "9. Liability", p: [
        "Neither side is liable to the other for indirect or consequential loss. Our total liability to you under this agreement is limited to the commission paid to you in the 3 months before the claim. You will cover any loss we suffer because you broke the Operating Rules or the law.",
      ] },
      { h: "10. General", p: [
        `This agreement is governed by the laws of the state in which ${CO} is organized. We may update the Exhibits by emailing you 30 days before the change takes effect; if you keep selling after that date you accept the change. Notices are given by email to the address on your partner record.`,
      ] },
    ],
  },
  {
    id: "compensation",
    tag: "Exhibit A",
    title: "Cash Compensation Policy",
    sections: [
      { h: "1. Rate", p: [`You earn ${SHARE_PCT}% of the qualified ad spend of each client credited to you.`] },
      { h: "2. Which clients are credited to you", p: [
        "A client is credited to you when it opens its DSP Connect account through your partner link or with your partner code, after your admission is signed. A client cannot be credited to more than one partner. If a client was already in contact with DSP Connect before your introduction, we decide in good faith who it is credited to, and our decision is final.",
      ] },
      { h: "3. Qualified ad spend", p: [
        "Qualified ad spend is ad budget that the client has paid to DSP Connect in full and that has actually been spent running the client's ads, as recorded by DSP Connect.",
        "These are not qualified ad spend: budget not yet spent; amounts refunded to the client; amounts disputed, charged back or reversed by the client's bank; unpaid or written-off amounts; taxes and payment processing fees; and any spend on an account opened in breach of the Operating Rules.",
      ] },
      { h: "4. When you are paid", p: [
        "Commission for each day's qualified ad spend is held for 7 days, then paid daily to your bank account through Stripe. You must set up and keep a Stripe payout account in your own name; we cannot pay you until it is active.",
        "You give your bank and tax details to Stripe directly. You are responsible for your own taxes. We may issue tax forms as required by law.",
      ] },
      { h: "5. Reversals", p: [
        "If spend that earned commission later stops being qualified (for example because of a refund or chargeback), the commission on it is reversed. If it has not been paid yet, it is cancelled. If it has been paid, it is deducted from your next payments. If you have no further commission to deduct within 90 days, you will repay it within 30 days of our request.",
      ] },
      { h: "6. Your statement", p: [
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
        "Never offer to run, manage or optimise a client's campaigns for them, or offer any service we do not sell. DSP Connect sets accounts up; the client runs them with our help.",
        "Never advise a client to add money, raise their budget or spend more. Give advice on creative, audience, areas, tracking, landing pages and pacing instead.",
        "Never talk about the Managing Partner program, its pay or how to join with anyone who has not been invited by DSP Connect.",
      ] },
      { h: "3. Client money and data", p: [
        "Clients always pay DSP Connect directly through our website. Never take, hold or forward a client's money, card details or passwords. Use client information only to help that client on DSP Connect, and keep it secure.",
      ] },
      { h: "4. Marketing", p: [
        "Do not send bulk email, texts or messages to people who have not agreed to hear from you, and follow the anti-spam and privacy laws where you and the client are. Do not buy ads on our brand name, register domains or social accounts that use \"DSP Connect\", or present yourself as DSP Connect staff. Describe yourself as an independent Managing Partner of DSP Connect.",
      ] },
      { h: "5. Training and support", p: [
        "Complete the Managing Partner training in your portal before you introduce clients. Send client questions about billing, refunds, cancellations or account access to DSP Connect support rather than answering them yourself.",
      ] },
      { h: "6. Breaking the rules", p: [
        "If you break these rules we may withhold or reverse commission on the affected accounts, pause your partner link, or end your admission immediately.",
      ] },
    ],
  },
];

/** The exact text of every document, so a signature can prove which wording was agreed. */
export function docText(): string {
  return DOCS.map((d) => [`${d.tag}: ${d.title}`, ...d.sections.flatMap((s) => [s.h || "", ...s.p])].filter(Boolean).join("\n")).join("\n\n");
}
export const docHash = () => createHash("sha256").update(VERSION + "\n" + docText()).digest("hex");
