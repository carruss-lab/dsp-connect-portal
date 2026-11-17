// The campaign brief a new client fills in: what a consultant would ask before building a first campaign.
// One definition drives the form, the validation, the team email and the back office.

export type Field =
  | { key: string; label: string; type: "text" | "email" | "date" | "money"; required?: boolean; placeholder?: string; help?: string }
  | { key: string; label: string; type: "area"; required?: boolean; placeholder?: string; help?: string }
  | { key: string; label: string; type: "select"; options: string[]; required?: boolean; help?: string }
  | { key: string; label: string; type: "checks"; options: string[]; help?: string };

export type Section = { id: string; title: string; why: string; fields: Field[] };

export const BRIEF: Section[] = [
  {
    id: "goals", title: "Your goals", why: "We build the campaign around one main result, so we need to know what a good outcome is for you.",
    fields: [
      { key: "primary_goal", label: "The main result you want from your ads", type: "select", required: true,
        options: ["Leads or enquiries", "Phone calls", "Bookings or appointments", "Online sales", "Visits to a store or location", "Awareness in my area", "Promote an event or launch"] },
      { key: "result_definition", label: "What counts as a result?", type: "area", required: true, placeholder: "For example: a completed quote form, a call longer than a minute, a booked consultation", help: "This is what we set tracking up to count." },
      { key: "customer_value", label: "What is a new customer worth to you, roughly?", type: "money", placeholder: "Optional", help: "Helps us judge what a result should cost." },
      { key: "target", label: "Is there a number you are aiming for each month?", type: "text", placeholder: "Optional. For example: 30 enquiries a month" },
      { key: "other_goals", label: "Anything else you want the ads to achieve?", type: "area", placeholder: "Optional" },
    ],
  },
  {
    id: "offer", title: "Your offer and your customers", why: "The better we understand who buys from you and why, the better we can aim your ads.",
    fields: [
      { key: "promoting", label: "What are you promoting?", type: "area", required: true, placeholder: "The product, service or offer these ads are about" },
      { key: "ideal_customer", label: "Who is your ideal customer?", type: "area", required: true, placeholder: "Who they are, what they need, what makes them choose you" },
      { key: "areas", label: "Where should your ads be shown?", type: "area", required: true, placeholder: "Cities, counties, ZIP codes or a distance around an address" },
      { key: "exclude", label: "Anywhere or anyone we should leave out?", type: "area", placeholder: "Optional. Areas you do not serve, existing customers, and so on" },
      { key: "competitors", label: "Who are your main competitors?", type: "text", placeholder: "Optional" },
      { key: "timing", label: "Busy seasons, days or hours we should know about?", type: "text", placeholder: "Optional" },
    ],
  },
  {
    id: "campaigns", title: "The campaigns you want", why: "Most clients start with one or two. Tick what fits; we will advise on the rest in your kickoff call.",
    fields: [
      { key: "campaign_types", label: "Which of these do you want to run?", type: "checks",
        options: ["Reach new people in my area", "Bring back people who visited my website", "Promote a specific offer or event", "Reach people near specific places", "Build name recognition", "Not sure, please advise"] },
      { key: "formats", label: "Ad formats", type: "checks", options: ["Banner", "Video", "Native"], help: "Banner: images on apps and websites. Video: short clips before or within content. Native: ads that match the page they sit on." },
      { key: "start_date", label: "When would you like to start?", type: "date", help: "We need up to 14 days for setup." },
      { key: "pacing", label: "How should your budget be spent?", type: "select", options: ["Evenly over about 30 days", "Evenly until a date I will give you", "As results allow, no fixed period", "Not sure, please advise"] },
    ],
  },
  {
    id: "creative", title: "Your ads", why: "Ads are the most common cause of a late launch, so we ask early.",
    fields: [
      { key: "creative_status", label: "Do you have ads ready?", type: "select", required: true, options: ["Yes, ready to send", "I have some images or video but not finished ads", "No, I would like to talk about options"] },
      { key: "ads_link", label: "Link to your ads, images or video", type: "text", placeholder: "A shared folder link (Google Drive, Dropbox, OneDrive)", help: "No folder? Leave this empty and reply to our email with the files attached." },
      { key: "logo_link", label: "Link to your logo and brand guidelines", type: "text", placeholder: "Optional" },
      { key: "disclaimers", label: "Wording that must appear in your ads", type: "area", placeholder: "Optional. License numbers, legal disclaimers, required statements" },
    ],
  },
  {
    id: "tracking", title: "Your website and tracking", why: "Tracking is how you see what your ads produced, not just how many people saw them.",
    fields: [
      { key: "landing_page", label: "The web page people should land on", type: "text", required: true, placeholder: "yourbusiness.com/offer" },
      { key: "site_platform", label: "What is your website built on?", type: "select", options: ["WordPress", "Shopify", "Wix", "Squarespace", "Webflow", "Custom built", "Not sure"] },
      { key: "web_contact_name", label: "Who manages your website?", type: "text", required: true, placeholder: "Name" },
      { key: "web_contact_email", label: "Their email", type: "email", required: true, placeholder: "name@example.com", help: "We ask them to add one small piece of tracking code. If that is you, enter your own details." },
      { key: "existing_tracking", label: "Tracking already on your website", type: "checks", options: ["Google Analytics", "Google Tag Manager", "Meta (Facebook) pixel", "Call tracking", "None", "Not sure"] },
      { key: "lead_handling", label: "Where do enquiries go today, and who follows up?", type: "area", placeholder: "Optional. For example: form emails to the office, followed up the same day" },
    ],
  },
  {
    id: "experience", title: "What you have tried before", why: "So we build on what worked and do not repeat what did not.",
    fields: [
      { key: "past_platforms", label: "Where have you advertised before?", type: "checks", options: ["Google Ads", "Facebook or Instagram", "Another programmatic platform", "TV, radio or print", "Nowhere yet"] },
      { key: "what_worked", label: "What worked, and what did not?", type: "area", placeholder: "Optional" },
    ],
  },
  {
    id: "approvals", title: "Rules and approvals", why: "Some industries have advertising rules, and some businesses need sign-off before anything runs.",
    fields: [
      { key: "approver", label: "Who approves your ads before they run?", type: "text", placeholder: "Name and email, if not you" },
      { key: "industry_rules", label: "Rules or compliance needs we should know about", type: "area", placeholder: "Optional. Regulators, franchise or brand rules, legal review" },
      { key: "avoid", label: "Subjects or kinds of websites your ads must not appear next to", type: "area", placeholder: "Optional" },
      { key: "notes", label: "Anything else we should know?", type: "area", placeholder: "Optional" },
    ],
  },
];

export const BRIEF_FIELDS = BRIEF.flatMap((s) => s.fields);
export const fieldLabel = (key: string) => BRIEF_FIELDS.find((f) => f.key === key)?.label || key;

/** Keeps only known fields, trims them, and reports the first thing missing. */
export function cleanBrief(input: Record<string, unknown>): { data: Record<string, string>; missing: string | null } {
  const data: Record<string, string> = {};
  let missing: string | null = null;
  for (const f of BRIEF_FIELDS) {
    const raw = input[f.key];
    let v = Array.isArray(raw) ? raw.filter((x) => typeof x === "string").join(", ") : typeof raw === "string" ? raw : typeof raw === "number" ? String(raw) : "";
    v = v.trim().slice(0, f.type === "area" ? 2000 : 500);
    if (f.type === "select" && v && !f.options.includes(v)) v = "";
    if (f.type === "email" && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) v = "";
    if (v) data[f.key] = v;
    else if ("required" in f && f.required && !missing) missing = f.label;
  }
  return { data, missing };
}
