// The questions answered on the site, in one place. Each list is shown on its page and also feeds that page's
// structured data (FAQPage) and llms.txt, so what search engines, AI assistants and visitors read never differs.
import { EXCHANGES, MIN_BUDGET, SETUP_DAYS, SHARE_PCT } from "./site";

type QA = [question: string, answer: string];

export const HOME_FAQ: QA[] = [
  ["What is DSP Connect?", `DSP Connect is a programmatic advertising service for businesses and agencies. It buys ads on streaming TV, apps and websites across ${EXCHANGES} ad exchanges, the same kind of buying big brands do, open to any business from a $${MIN_BUDGET} ad budget, with the account set up for you.`],
  ["How is DSP Connect different from The Trade Desk or Amazon DSP?", `The Trade Desk starts with a sales conversation and a negotiated contract, and Amazon DSP is built around Amazon shoppers and Amazon's own properties. DSP Connect is open to any business from a $${MIN_BUDGET} ad budget with no long-term contract, and we set up the account, tracking, ads and audience for you within ${SETUP_DAYS} days.`],
  ["What is programmatic advertising?", "Programmatic advertising is buying ad space automatically, one impression at a time, across many apps, websites and streaming TV services at once, instead of booking each one separately. A demand-side platform (DSP) is the software that does the buying."],
  ["Can I advertise on streaming TV (CTV)?", "Yes. Video ads can run on streaming TV apps watched on connected TVs, as well as on apps and websites, from the same account and the same budget."],
  ["What is the smallest budget I can start with?", `The minimum starting ad budget is $${MIN_BUDGET}, with no long-term contract.`],
  ["How long until my ads are running?", `Within ${SETUP_DAYS} days of paying. We use that time to set up your account, tracking, ads and audience for you.`],
  ["Where do my ads appear?", `On streaming TV, apps and websites reached through ${EXCHANGES} ad exchanges. You can approve or block specific apps and sites.`],
  ["How do I know it is working?", "You get your own login showing views, clicks and spend, plus tracking on your website that counts leads and sales."],
  ["How does the campaign improve over time?", "Automatic rules drop the apps and sites that are not performing and move your budget to the ones that are."],
  ["What does it cost?", "No monthly platform fee. Our fee is included in the price of your ads."],
];

export const PARTNER_FAQ: QA[] = [
  ["Who is this for?", "ISOs and merchant-services agents, POS and telecom sellers, marketing consultants and independent reps who already call on local businesses. You can join as an individual or as a company."],
  ["Do I need advertising experience?", "No. If you can talk to a business owner about getting more customers, the training and the demo cover the rest."],
  ["What do my clients pay?", `Accounts start from a $${MIN_BUDGET} ad budget. There is no monthly platform fee: our fee is included in the price of the ads, and there is no long-term contract.`],
  ["Do I set prices or resell?", "No. You are an independent sales partner, not a reseller. Clients contract and pay DSP Connect directly, so you never carry billing risk."],
  ["Is there a cost to join?", "No. There is no fee to apply or to join. It is commission only: no salary, no draw and no guaranteed income."],
  ["Can my team sell under my company?", "Yes. Add your reps in your partner portal under Your team. Each rep gets their own sign-in and their own planner, demo and sign-up links, and only sees their own clients. Every client is credited to you, you see which rep brought each one, and all commission is paid to you; you pay your reps however you choose. Your company makes sure they follow our rules. Outside sub-agents are not part of the program."],
  ["Sales Partner or agency: which is right for me?", `Will you introduce business owners and let DSP Connect set up and run their advertising? Become a Sales Partner: you earn ${SHARE_PCT}% of each client's qualified ad spend, paid daily through Stripe, for as long as they spend. Will you run your clients' campaigns yourself, in your own agency account with a login for each client? Join as an agency at /agencies: you earn ${SHARE_PCT}% of the ad spend you manage, paid through PartnerStack.`],
];
