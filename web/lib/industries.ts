import { MIN_BUDGET, SETUP_DAYS } from "./site";

export type Industry = {
  slug: string;
  name: string; // must match a name in INDUSTRIES so the demo opens set up for it
  who: string; // the reader, in a few words
  headline: string;
  intro: string;
  counts: string[]; // what we set tracking up to count
  campaigns: [title: string, text: string][];
  rules: [title: string, text: string][];
  faq: [q: string, a: string][];
};

const startFaq = (who: string): [string, string] => [
  `How much does a ${who} need to start?`,
  `The minimum starting ad budget is $${MIN_BUDGET}. There is no monthly platform fee; our fee is included in the price of your ads.`,
];
const liveFaq: [string, string] = [
  "How soon are ads live?",
  `Within ${SETUP_DAYS} days of payment. We create your account, place tracking on your website, review your ads and build your audience for you.`,
];

// No results, client names or statistics appear here: only what the service does and the rules that apply.
export const INDUSTRY_PAGES: Industry[] = [
  {
    slug: "healthcare", name: "Healthcare", who: "practice or clinic",
    headline: "Reach local patients on the apps and websites they use every day.",
    intro: "For medical, dental, vision and wellness practices that want new patient enquiries from their own area, beyond search and social.",
    counts: ["Appointment requests and booking form submissions", "Calls from your website", "Visits to your new-patient and insurance pages"],
    campaigns: [
      ["New patients near each location", "Video and banner ads shown within the distance people will travel to your practice, with a separate budget for each location."],
      ["A new service or provider", "Introduce a service, a new doctor or extended hours to people in your area before they need you."],
      ["People who visited but did not book", "Show a reminder to people who looked at your booking page and left."],
    ],
    rules: [
      ["No targeting by health condition", "We do not build audiences from a person's medical conditions or treatment. Audiences use location, context and general interests."],
      ["Tracking that stays off patient pages", "We place tracking on public pages only, never inside patient portals or on pages that reveal a condition, so it does not capture protected health information."],
      ["Claims you can stand behind", "Ads for treatments must be accurate and must not promise outcomes. Some treatments need extra review by the ad exchanges."],
    ],
    faq: [startFaq("practice"), liveFaq, ["Is this suitable under HIPAA?", "We set tracking up to avoid patient portals and condition-specific pages, and we do not target by health condition. You remain responsible for your own compliance, so check our setup with your compliance lead before launch."]],
  },
  {
    slug: "legal", name: "Legal", who: "law firm",
    headline: "Stay in front of people in your area before they choose a lawyer.",
    intro: "For law firms that want more case enquiries from specific cities or counties, in practice areas where people take time to decide.",
    counts: ["Consultation requests and contact form submissions", "Calls from your website", "Visits to each practice-area page"],
    campaigns: [
      ["One practice area, one county", "Run each practice area as its own campaign so you can see what an enquiry costs for each."],
      ["People who read and left", "Show your firm again to people who read a practice-area page and did not get in touch."],
      ["Name recognition before the need", "Short video on local news and sports apps, so your firm is the name people remember."],
    ],
    rules: [
      ["Your bar's advertising rules", "Ads must follow your state bar's rules on lawyer advertising, including required disclaimers and limits on words such as specialist or expert. We include your disclaimer text in every ad."],
      ["No promises of results", "Ads cannot guarantee an outcome or imply one from past results without the wording your bar requires."],
      ["Sensitive circumstances", "We do not build audiences from a person's criminal record, immigration status or financial hardship."],
    ],
    faq: [startFaq("law firm"), liveFaq, ["Can we limit ads to the counties we serve?", "Yes. You choose states, cities, ZIP codes or a distance around an address, and ads are shown only there."]],
  },
  {
    slug: "financial-services", name: "Financial Services", who: "financial firm",
    headline: "Reach the right households in your market, within the rules.",
    intro: "For advisors, lenders, insurers, credit unions and accountants that want qualified enquiries from a defined area.",
    counts: ["Consultation and quote requests", "Application starts", "Calls from your website"],
    campaigns: [
      ["A product in a place", "One campaign per product and market, so each has its own budget and cost per enquiry."],
      ["Seasonal demand", "Tax season, open enrollment, rate changes: run for the weeks that matter and pause after."],
      ["People who started and stopped", "Remind people who began a quote or application and did not finish."],
    ],
    rules: [
      ["Credit, housing and employment offers", "Ads for credit, loans, insurance or housing cannot be targeted by age, gender, ZIP code or other protected characteristics. We set these campaigns up with the wider targeting the rules require."],
      ["Required disclosures", "Rates, fees and terms must be shown as regulators require, and your compliance team should approve ads before launch. We build that approval into the setup."],
      ["No guaranteed returns", "Ads cannot promise investment performance."],
    ],
    faq: [startFaq("financial firm"), liveFaq, ["Can our compliance team review ads first?", "Yes. Send us the approved ads, or we send drafts for approval. Nothing runs until you confirm it is approved."]],
  },
  {
    slug: "automotive", name: "Automotive", who: "dealership",
    headline: "Be seen by local shoppers while they are still deciding.",
    intro: "For dealerships, dealer groups and service centers that want showroom visits, service bookings and enquiries from their own market area.",
    counts: ["Vehicle detail page views", "Test drive and trade-in form submissions", "Service bookings and calls"],
    campaigns: [
      ["Your market area, by location", "Each rooftop gets its own area and budget, so stores in a group do not compete with each other."],
      ["Inventory you need to move", "Feature specific models or aged stock to people nearby."],
      ["Service and parts", "Reach owners in your area with service offers between purchases."],
    ],
    rules: [
      ["Offers shown accurately", "Prices, payments and incentives must include the terms and disclaimers your state and the manufacturer require."],
      ["Manufacturer advertising rules", "If you claim co-op funds, send us the brand's ad guidelines and we build to them."],
      ["Financing offers", "Ads that promote financing follow the same fair-lending targeting limits as any credit offer."],
    ],
    faq: [startFaq("dealership"), liveFaq, ["Can each location have its own budget?", "Yes. Each location runs as its own campaign with its own area, budget and results."]],
  },
  {
    slug: "real-estate", name: "Real Estate", who: "brokerage or agent",
    headline: "Keep listings and your name in front of local buyers and sellers.",
    intro: "For brokerages, teams, builders and property managers that want enquiries from specific neighborhoods and price ranges.",
    counts: ["Listing and community page views", "Showing and valuation requests", "Calls and contact form submissions"],
    campaigns: [
      ["A listing or a community", "Video and banner ads for one property or development, shown in the areas buyers are moving from."],
      ["Seller enquiries", "Home valuation offers shown around the neighborhoods you want listings in."],
      ["People who viewed a listing", "Show the property again to people who looked and did not enquire."],
    ],
    rules: [
      ["Fair housing", "Housing ads cannot be targeted by age, gender, family status, ZIP code or other protected characteristics. We set housing campaigns up with the wider area targeting the rules require."],
      ["Licensing details", "Ads carry the brokerage name and license details your state requires."],
      ["Accurate listings", "Prices and availability in ads must match the live listing."],
    ],
    faq: [startFaq("brokerage"), liveFaq, ["Can we advertise a single listing?", "Yes. A listing can run as its own short campaign and stop when it sells."]],
  },
  {
    slug: "home-services", name: "Home Services", who: "home services business",
    headline: "Be the name homeowners in your service area already know.",
    intro: "For HVAC, plumbing, roofing, electrical, solar, landscaping and remodeling companies that want booked jobs in the areas they serve.",
    counts: ["Quote and booking requests", "Calls from your website", "Visits to each service page"],
    campaigns: [
      ["Your service area only", "Ads shown in the ZIP codes or radius your crews cover, and nowhere else."],
      ["Seasonal work", "Heating before winter, cooling before summer, roofing after storms: run when demand is there."],
      ["People who asked for a quote and went quiet", "Remind people who visited your quote page and did not finish."],
    ],
    rules: [
      ["Licenses and offers", "Ads show license numbers where your state requires, and offers include their real terms and end dates."],
      ["Financing", "If you advertise financing, the same fair-lending limits apply as for any credit offer."],
    ],
    faq: [startFaq("home services business"), liveFaq, ["Can we pause when we are fully booked?", "Yes. You can pause and restart campaigns in your account at any time."]],
  },
  {
    slug: "franchise", name: "Franchise", who: "franchise",
    headline: "One brand, every location, each with its own area and budget.",
    intro: "For franchisors and multi-unit owners that want consistent brand advertising with results reported location by location.",
    counts: ["Location page views and direction requests", "Orders, bookings or enquiries per location", "Franchise enquiry form submissions"],
    campaigns: [
      ["Every location, its own area", "Each unit gets a campaign around its own address, so neighboring units do not overlap."],
      ["A new opening", "Build awareness around a new location in the weeks before and after it opens."],
      ["Franchise development", "A separate campaign aimed at prospective franchisees in the markets you want to grow."],
    ],
    rules: [
      ["Brand standards", "Send us your brand guidelines once and every location's ads are built to them."],
      ["Franchise sales advertising", "Ads that offer a franchise must follow franchise sales rules and state registration requirements. Your franchise counsel should approve them."],
    ],
    faq: [startFaq("franchise location"), liveFaq, ["Can franchisees see only their own location?", "Yes. Each location can have its own login showing only its campaigns and results."]],
  },
  {
    slug: "hospitality", name: "Hospitality", who: "hospitality business",
    headline: "Fill rooms and tables with people already planning a visit.",
    intro: "For hotels, resorts, restaurants, venues and attractions that want direct bookings from the places their guests come from.",
    counts: ["Booking engine visits and completed bookings", "Reservation and event enquiries", "Menu and offer page views"],
    campaigns: [
      ["Your feeder markets", "Show ads in the cities your guests travel from, not just around your address."],
      ["Slow periods", "Promote midweek, shoulder season or last-minute availability when you need it."],
      ["People who looked at dates and left", "Remind people who checked availability and did not book."],
    ],
    rules: [
      ["Prices and fees shown honestly", "Advertised rates must include mandatory fees, as price-display rules require."],
      ["Alcohol and gaming", "Ads that feature alcohol or gaming are shown only to adults and need extra review by the ad exchanges."],
    ],
    faq: [startFaq("hospitality business"), liveFaq, ["Can we track bookings made on our booking engine?", "Usually, yes. We place tracking on your booking confirmation page, with help from your booking provider if it sits on their system."]],
  },
  {
    slug: "political", name: "Political", who: "campaign or cause",
    headline: "Reach voters in your district on the screens they use every day.",
    intro: "For candidate campaigns, committees and advocacy groups that need to reach voters in a defined district before a fixed date.",
    counts: ["Visits to your issue and candidate pages", "Volunteer and event sign-ups", "Video views to completion"],
    campaigns: [
      ["Your district only", "Ads shown within the boundaries you give us, by state, county, city or ZIP code."],
      ["Introduce, then remind", "Longer video early to introduce the candidate or issue, shorter reminders as voting approaches."],
      ["Get out the vote", "A final push in the days before early voting and election day."],
    ],
    rules: [
      ["Identity checks and disclaimers", "Political advertisers are verified before ads run, and every ad carries a paid-for-by disclaimer as election law requires. Allow extra days for this."],
      ["Some places and exchanges restrict political ads", "Certain states and ad exchanges limit or do not accept political advertising. We tell you where your ads can run before you pay."],
      ["Deadlines", `Setup takes up to ${SETUP_DAYS} days, plus verification. Start early: we cannot shorten an exchange's review before an election.`],
    ],
    faq: [startFaq("campaign"), liveFaq, ["Can ads be limited to one district?", "Yes, by state, county, city or ZIP code. Where a district cuts across ZIP codes, we use the closest match and tell you where the edges fall."]],
  },
];

export const industryBySlug = (slug: string) => INDUSTRY_PAGES.find((i) => i.slug === slug);
