import { MIN_BUDGET, SETUP_DAYS, PARTNER_PCT } from "./site";

// The Authorized Sales Partner course: 14 video lessons (YouTube, unlisted), each with key points and a
// checklist line the partner ticks. Finishing all 14 marks the partner trained. Scripts and videos are
// produced from the dsp-videos project; keep the wording here in step with them.
export type Lesson = { id: string; title: string; minutes: number; video: string; points: string[]; check: string };

export const LESSONS: Lesson[] = [
  { id: "v1-welcome", title: "Welcome and how this program works", minutes: 2, video: "vaBohuRLAXQ",
    points: ["Your role: introduce DSP Connect to owners you know, show the demo, help them open an account through your link.", "You never set prices, take money, run campaigns or promise results.", "Five steps to your first commission: training, payouts, first demo, first account, their ads run."],
    check: "I know the five steps to my first commission." },
  { id: "v2-agreement", title: "Your agreement in plain English", minutes: 2, video: "1Bv5awl2cB8",
    points: ["You are an independent contractor, not staff and not a reseller. Company partners are responsible for their staff.", "No sub-agents. Clients contract with and pay DSP Connect. Confidentiality and 12 months of no soliciting.", "Either side can end it with 30 days' notice; residuals continue unless it ends for cause."],
    check: "I have read my signed agreement and Exhibits A and B." },
  { id: "v3-pay", title: "How you get paid", minutes: 2, video: "XiKSNtEgijI",
    points: [`${PARTNER_PCT}% of qualified ad spend: paid in full by the client and actually spent on their ads.`, "Held 7 days, then paid daily through Stripe. Your first payout is checked by a person.", "Refunds and chargebacks reverse commission. Residuals for life, unless ended for cause. No salary or guarantee."],
    check: "I can explain when and how I am paid, and what reverses commission." },
  { id: "v4-product", title: "What DSP Connect is, and who it fits", minutes: 2, video: "eBMUX37h7UE",
    points: [`From a $${MIN_BUDGET} ad budget. No monthly platform fee. Our fee is included in the price of your ads. Live within ${SETUP_DAYS} days, no long-term contract.`, "We set up account, tracking, ad review and audience; the client runs it with support.", "Poor fits: anyone needing guaranteed results, a tight budget, or someone to run it for them."],
    check: "I can explain DSP Connect in two sentences and spot a poor fit." },
  { id: "v5-screens", title: "The account, screen by screen", minutes: 2, video: "tEY0PWG7sR4",
    points: ["Explore, Dashboard, Campaigns, Audience, Conversion Tracking, Analytics and Traffic Funnel.", "Creative Assets, Allowlist / Blocklist, Retargeting, Custom Locations, Billing, Planning and Autopilot.", "Never suggest a client adds funds."],
    check: "I can open and explain every screen without notes." },
  { id: "v6-after-pay", title: "What happens after a client pays", minutes: 2, video: "8xB2-lbX8IY",
    points: ["Payment email and setup page; the campaign brief takes about 10 minutes. Help them send it the same day.", `Four setup steps, live within ${SETUP_DAYS} days, then their own login.`, "Billing, refunds, cancellations and logins always go to DSP Connect support."],
    check: `I can tell a client exactly what happens in their first ${SETUP_DAYS} days.` },
  { id: "v7-who", title: "Who to talk to", minutes: 1, video: "ovecY07xXeY",
    points: ["Start with owners you already know and serve; ask happy clients for warm introductions.", "No cold outreach: no bulk messages to people who didn't agree, no ads, domains or social accounts using our name.", "Write your list of 20 owners you know."],
    check: "I will only contact people who know me or asked." },
  { id: "v8-conversation", title: "The first conversation", minutes: 2, video: "BDubG-FdoYI",
    points: ["Open, ask before you tell, show the demo, explain how it works, agree one next step.", "They choose the budget. Never push higher, never estimate results.", "Practise the whole call out loud; ask Fin to play the owner."],
    check: "I have practised the full call out loud once." },
  { id: "v9-demo", title: "Running the demo live", minutes: 2, video: "mvyiowU1ejA",
    points: ["Always use your own demo link with your partner code.", "Show where the ads appear, who they reach, and what results they will see. Say the sample data is not real results.", "Let them build a practice campaign; never name the technology or suggest a bigger budget."],
    check: "I have run the demo end to end for a practice prospect." },
  { id: "v10-objections", title: "Questions and objections", minutes: 2, video: "9kg80opbSLE",
    points: ["Use the approved answers in your sales kit, word for word.", "Never promise results; state the price and fee line exactly.", "Don't know? \"Let me get DSP Connect to answer that properly.\""],
    check: "I can answer every objection in the kit without promising results." },
  { id: "v11-kit", title: "Your sales kit", minutes: 2, video: "onDrqaxIeL4",
    points: ["Three emails with your links filled in: first email, after the demo, one gentle follow-up.", "Your leave-behind with your QR code: print it or save it as a PDF.", "The first-call script and approved answers."],
    check: "I have opened my sales kit and printed or saved my leave-behind." },
  { id: "v12-support", title: "Supporting your clients", minutes: 1, video: "rohTHs8LlOg",
    points: ["Help with the brief on day one; watch their progress in your portal.", "Advise on creative, audience, areas, tracking, landing page and pacing.", "Never advise spending more or offer to run their campaigns. Keep their data private."],
    check: "I know what I handle and what I send to support." },
  { id: "v13-rules", title: "The rules, with real examples", minutes: 2, video: "UX3cP22_PBE",
    points: ["Never promise results. Prices exactly as published. Never the technology or our costs.", "Never manage campaigns or advise spending more. Describe yourself correctly.", "Never take money, cards or passwords. No bulk messages. Breaking the rules can end residuals."],
    check: "I have read the Operating Rules and will follow them." },
  { id: "v14-first-30", title: "Your first 30 days", minutes: 1, video: "rHxYbi1pq_A",
    points: ["Week 1: payouts, your list of 20, your leave-behind. Week 2: book 5 demos.", "Week 3: same-day follow-up emails, help your first client open and send their brief.", "Week 4: review, prepare with Fin, ask for warm introductions."],
    check: "I have written my list and booked my first demo." },
];

export const LESSON_IDS = LESSONS.map((l) => l.id);
