import { MIN_BUDGET, SETUP_DAYS, SHARE_PCT } from "./site";

// The Managing Partner course. Short, practical lessons; a partner marks each one done.
// Adding a module here adds it to every partner's checklist.
export type Lesson = { id: string; title: string; minutes: number; points: string[]; check: string };

export const LESSONS: Lesson[] = [
  {
    id: "product",
    title: "What DSP Connect is",
    minutes: 5,
    points: [
      "DSP Connect puts a business's ads on streaming TV, websites, apps, audio and digital billboards, aimed at people in the area it serves.",
      "Two kinds of customer: business owners, who open their own account, and agencies, who run their clients on DSP Connect under their own brand for a 10% revenue share.",
      `We do the setup for the client: account, tracking, ad review and audience. Ads are live within ${SETUP_DAYS} days of payment. After that the client runs the account themselves, with our support.`,
      `Accounts start from a $${MIN_BUDGET} ad budget. There is no monthly platform fee: our fee is included in the price of the ads. No long-term contract.`,
    ],
    check: "I can explain what DSP Connect does and who it is for in two sentences.",
  },
  {
    id: "demo",
    title: "Running the demo",
    minutes: 10,
    points: [
      "Open getdspconnect.com/demo with the prospect, enter their industry and area, and walk through the sample account together.",
      "Show three things: where the ads appear, who they reach in the prospect's area, and what the results page will show them.",
      "Build a practice campaign with them in the demo. People buy what they have already built.",
      "Add your partner code to any link you send (getdspconnect.com/demo?p=YOURCODE) so the prospect is credited to you if they open an account.",
    ],
    check: "I have run the demo end to end for a practice prospect.",
  },
  {
    id: "selling",
    title: "The consultant conversation",
    minutes: 10,
    points: [
      "Ask before you tell: what does a good customer look like, where do they come from today, what area do you serve, what has worked and what has not?",
      "Fit the answer to their goal: calls, form leads, store visits, online sales or awareness. If it is not a fit, say so.",
      `Be clear on the start: a $${MIN_BUDGET} ad budget, done-for-you setup, live in ${SETUP_DAYS} days. Let the prospect choose the budget; never push them higher.`,
      "End every conversation with one next step: the demo, opening an account, or a call with DSP Connect.",
    ],
    check: "I can run a first call that ends with one clear next step.",
  },
  {
    id: "rules",
    title: "What you can and cannot say",
    minutes: 5,
    points: [
      "Never promise or estimate results, leads, sales or return on ad spend.",
      "Never name our technology providers, and never discuss our costs, mark-ups or how our fee works. The fee line is: \"No monthly platform fee. Our fee is included in the price of your ads.\"",
      "Never offer to manage a client's campaigns, and never advise a client to add money or spend more.",
      "Never discuss the Managing Partner program with anyone DSP Connect has not invited. Clients pay DSP Connect directly; never take a client's money, card details or passwords.",
    ],
    check: "I have read the Operating Rules and will follow them.",
  },
  {
    id: "clients",
    title: "Helping your clients after they start",
    minutes: 5,
    points: [
      "After payment the client gets a setup page with their campaign brief and a kickoff call. Help them finish the brief quickly: it is the biggest cause of delay.",
      "Your portal shows each client's setup progress, spend and what you have earned on them.",
      "When a client is live, advise like a consultant: creative, audience, areas, tracking, landing page and pacing. The Fin assistant in your portal can help you prepare.",
      "Send billing, refund, cancellation and login questions to DSP Connect support; do not answer them yourself.",
    ],
    check: "I know what my clients need from me after they pay.",
  },
  {
    id: "pay",
    title: "How you get paid",
    minutes: 5,
    points: [
      `You earn ${SHARE_PCT}% of each credited client's qualified ad spend: budget the client has paid that has actually run as ads.`,
      "Each day's commission is held for 7 days, then paid daily to your bank through Stripe. Set up your Stripe payout account in this portal.",
      "Refunds, chargebacks and unpaid amounts are not qualified; commission on them is reversed.",
      "There is no salary and no guaranteed income. What you earn depends on the clients you bring and what they spend.",
    ],
    check: "I understand how and when I am paid, and that refunds reverse commission.",
  },
];

export const LESSON_IDS = LESSONS.map((l) => l.id);
