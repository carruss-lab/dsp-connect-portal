import { EXCHANGES, MIN_BUDGET, SETUP_DAYS, SHARE_PCT } from "./site";

export type Comparison = {
  slug: string; // kept identical to the old site's addresses
  name: string;
  headline: string;
  intro: string;
  tiles: [string, string][];
  rows: [string, string, string][];
  owner: string;
  agency: string;
  whenText: string;
};

// Competitor details come from public sources checked in November 2026.
// Anything that could not be confirmed is stated as "not published", not guessed.
export const CHECKED = "November 2026";

const US = {
  setup: "We do it for you",
  live: `Within ${SETUP_DAYS} days, fully set up`,
  budget: `$${MIN_BUDGET}`,
  share: `${SHARE_PCT}% of the ad spend you manage`,
  where: `${EXCHANGES} ad exchanges`,
  support: "AI help in your account, plus people",
  contract: "No long-term contract",
};

export const COMPARISONS: Comparison[] = [
  {
    slug: "dsp-connect-vs.-stackadapt",
    name: "StackAdapt",
    headline: "which one sets you up, and which one pays you back?",
    intro: "Both platforms let you buy advertising across apps and websites. The difference is who does the setup, and who keeps the margin.",
    tiles: [["Done-for-you setup", "DSP Connect only"], ["Agency revenue share", `DSP Connect only: ${SHARE_PCT}%`], ["Human + AI support", "Both platforms"], ["Creative studio", "StackAdapt only"]],
    rows: [
      ["Who sets up the account", US.setup, "You do. Self-serve signup on the Basic tier"],
      ["Time to live", US.live, "Quick access, then you build it yourself"],
      ["Budget to start", US.budget, "No minimum listed on the Basic tier"],
      ["Agency revenue share", US.share, "No"],
      ["Where ads run", US.where, "Curated network"],
      ["Support", US.support, "Dedicated human reps"],
      ["Creative studio", "No", "Yes"],
      ["Competes for your clients", "Never", "No"],
    ],
    owner: `StackAdapt lets you sign up and start quickly, but the building is yours. DSP Connect sets up your account, your tracking and your audience before you touch anything, and you start from $${MIN_BUDGET}.`,
    agency: `StackAdapt is excellent software, but it does not share revenue with you. DSP Connect pays ${SHARE_PCT}% of the ad spend you manage, on top of the fees you already charge your clients.`,
    whenText: "Choose StackAdapt if you need ads built inside the platform with their creative studio, if their Ivy AI bidding is a requirement, or if you have a team ready to build campaigns this week and do not want setup done for you.",
  },
  {
    slug: "dsp-connect-vs-google-dv360",
    name: "Google DV360",
    headline: "enterprise power, or a platform you can actually get into?",
    intro: "DV360 is Google's enterprise advertising platform. It is powerful, and it was built for brands that spend millions a month. Here is what a smaller advertiser or agency faces.",
    tiles: [["DV360 minimum", "Not published"], ["DSP Connect minimum", US.budget], ["DV360 access", "Usually through a Google partner"], ["DSP Connect setup", `Done for you in ${SETUP_DAYS} days`]],
    rows: [
      ["Who sets up the account", US.setup, "You or your agency"],
      ["Time to live", US.live, "Depends on the partner you buy through"],
      ["Budget to start", US.budget, "Not published. Usually enterprise-level"],
      ["Agency revenue share", US.share, "No"],
      ["Where ads run", `${EXCHANGES} open-web ad exchanges`, "Google exchange and limited partners"],
      ["YouTube inventory", "No", "Yes"],
      ["Google stack integration", "No", "Yes (SA360, CM360, GA4)"],
    ],
    owner: `DV360 is not sold to a business spending a few thousand dollars a month. DSP Connect starts at $${MIN_BUDGET}, and we set it up for you.`,
    agency: `Google keeps the margin on every dollar your clients spend through DV360. DSP Connect pays you ${SHARE_PCT}% of the ad spend you manage.`,
    whenText: "DV360 is the right choice if you manage very large budgets and need deep integration with Google's full advertising stack, including YouTube, SA360, CM360 and GA4.",
  },
  {
    slug: "dsp-connect-vs-the-trade-desk",
    name: "The Trade Desk",
    headline: "the gold standard, if you can get in.",
    intro: "The Trade Desk is the benchmark for large-scale programmatic buying. Access starts with a sales conversation and a negotiated contract. Here is what a smaller advertiser or agency faces.",
    tiles: [["Trade Desk minimum", "Not published"], ["DSP Connect minimum", US.budget], ["Trade Desk access", "Sales conversation and contract"], ["DSP Connect setup", `Done for you in ${SETUP_DAYS} days`]],
    rows: [
      ["Who sets up the account", US.setup, "You do, after a sales conversation and demo"],
      ["Time to live", US.live, "After a contract is negotiated"],
      ["Budget to start", US.budget, "Not published"],
      ["Contract", US.contract, "Yes, negotiated for every account"],
      ["Agency revenue share", US.share, "No"],
      ["Where ads run", US.where, "Curated premium inventory"],
      ["AI bidding", "Automatic optimization rules", "Kokai AI, industry-leading"],
      ["Identity", "Standard targeting", "Unified ID 2.0"],
    ],
    owner: `The Trade Desk has no self-serve signup. Every account starts with a sales conversation and a negotiated contract. DSP Connect starts at $${MIN_BUDGET} and we do the setup.`,
    agency: `The Trade Desk has no revenue share for agencies. DSP Connect pays ${SHARE_PCT}% of the ad spend you manage.`,
    whenText: "The Trade Desk is the right choice for teams running $500k a month or more, with clients who need the most advanced identity resolution, streaming TV targeting and AI optimization on the market.",
  },
  {
    slug: "dsp-connect-vs-choozle",
    name: "Choozle",
    headline: "simple is good. Set up for you, and paid, is better.",
    intro: "Choozle built a friendly platform that is easy to start on. DSP Connect sets everything up for you, charges no monthly fee, and shares revenue with agencies.",
    tiles: [["Choozle monthly fee", "$99 a month"], ["DSP Connect monthly fee", "$0"], ["Agency revenue share", `DSP Connect only: ${SHARE_PCT}%`], ["Done-for-you setup", "DSP Connect only"]],
    rows: [
      ["Who sets up the account", US.setup, "You do"],
      ["Time to live", US.live, "Quick access, then you build it yourself"],
      ["Budget to start", US.budget, "Not stated"],
      ["Monthly platform fee", "$0", "$99 a month"],
      ["Agency revenue share", US.share, "No"],
      ["Where ads run", US.where, "Curated network"],
      ["Ease of use", "Set up for you, with guides and chat help", "Very simple, beginner-friendly"],
    ],
    owner: "Choozle is easy to learn, but you still do the building and pay a monthly fee. DSP Connect has no monthly fee, and your account, tracking and audience are set up for you.",
    agency: `At $50,000 a month in managed spend, Choozle costs $1,188 a year in fees and pays nothing back. At the same spend, DSP Connect's ${SHARE_PCT}% share is $5,000 a month.`,
    whenText: "Choozle is a good starting point if you are new to this kind of advertising, want the simplest interface, and want to be running in a day or two by building it yourself.",
  },
  {
    slug: "dsp-connect-vs-amazon-dsp",
    name: "Amazon DSP",
    headline: "the open web, or a platform built for Amazon sellers?",
    intro: "Amazon DSP is powerful if you sell on Amazon. For most other businesses, its focus on Amazon shoppers and Amazon's own properties makes it a poor fit.",
    tiles: [["Amazon managed service", "$50,000 typical minimum"], ["DSP Connect minimum", US.budget], ["Amazon DSP focus", "Amazon sellers"], ["DSP Connect focus", "Any business, any industry"]],
    rows: [
      ["Who sets up the account", US.setup, "You do on self-service. Amazon's team on managed service"],
      ["Time to live", US.live, "Depends on the route you choose"],
      ["Budget to start", US.budget, "Managed service: $50,000 typical. Self-service: none published"],
      ["Agency revenue share", US.share, "No"],
      ["Where ads run", `${EXCHANGES} open-web ad exchanges`, "Amazon-owned properties and limited partners"],
      ["Amazon shopper data", "No", "Yes, best in class"],
      ["Prime Video and Twitch", "No", "Yes"],
    ],
    owner: `Unless you sell on Amazon, you would be learning a platform built around Amazon shoppers. DSP Connect starts at $${MIN_BUDGET} and works for any industry.`,
    agency: `Amazon DSP has no revenue share for agencies. With DSP Connect you own the client relationship and earn ${SHARE_PCT}% of the spend you manage.`,
    whenText: "Amazon DSP is the right call when your clients sell on Amazon and need its shopper data, or when Prime Video and Twitch inventory is central to the plan.",
  },
  {
    slug: "dsp-connect-vs-basis-technologies",
    name: "Basis Technologies",
    headline: "one tool for everything, or one that sets you up and pays you back?",
    intro: "Basis combines search, social and programmatic advertising in one interface. DSP Connect does one thing: advertising across apps and websites, set up for you, with a revenue share for agencies.",
    tiles: [["Agency revenue share", `DSP Connect only: ${SHARE_PCT}%`], ["Done-for-you setup", "DSP Connect only"], ["Search and social in one place", "Basis only"], ["Budget to start", `DSP Connect: ${US.budget}`]],
    rows: [
      ["Who sets up the account", US.setup, "You do, after a demo and onboarding"],
      ["Time to live", US.live, "After a demo and onboarding"],
      ["Budget to start", US.budget, "Not published. Demo required"],
      ["Agency revenue share", US.share, "No"],
      ["Where ads run", US.where, "Curated network"],
      ["Search and social management", "No", "Yes, one workflow"],
      ["Support", US.support, "Dedicated support team"],
    ],
    owner: `Basis is built for marketing teams juggling several channels. If you want ads running on apps and websites without learning a new tool, DSP Connect sets it up for you from $${MIN_BUDGET}.`,
    agency: `Basis keeps the platform margin. DSP Connect pays ${SHARE_PCT}% of the ad spend you manage.`,
    whenText: "Basis is the right fit for teams that need to manage search and paid social alongside programmatic in one place, and value that convenience over a revenue share.",
  },
  {
    slug: "dsp-connect-vs-simpli.fi",
    name: "Simpli.fi",
    headline: "local targeting specialist, or set up for you with a revenue share?",
    intro: "Simpli.fi is a strong platform for local and multi-location advertisers. DSP Connect serves local, regional and national advertisers, does the setup for you, and shares revenue with agencies.",
    tiles: [["Agency revenue share", `DSP Connect only: ${SHARE_PCT}%`], ["Done-for-you setup", "DSP Connect only"], ["Address-level targeting", "Simpli.fi strength"], ["Budget to start", `DSP Connect: ${US.budget}`]],
    rows: [
      ["Who sets up the account", US.setup, "You do, after a demo and onboarding"],
      ["Time to live", US.live, "Requires demo and onboarding"],
      ["Budget to start", US.budget, "Not publicly disclosed"],
      ["Agency revenue share", US.share, "No"],
      ["Where ads run", US.where, "Curated, local-focused network"],
      ["Local targeting", "City, state and custom locations", "Best in class: zip code, address, radius"],
      ["Multi-location brands", "Supported", "Core strength"],
    ],
    owner: `Simpli.fi does not publish its pricing and starts with a demo. DSP Connect shows you your market first, starts at $${MIN_BUDGET}, and does the setup.`,
    agency: `Simpli.fi has no revenue share. DSP Connect pays ${SHARE_PCT}% of the ad spend you manage, across local, regional and national clients.`,
    whenText: "Simpli.fi is the right choice when address-level and zip-code targeting for franchises and multi-location brands is the heart of what you do.",
  },
];
