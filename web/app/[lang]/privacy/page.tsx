import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Legal, { type Part } from "@/components/Legal";
import { LEGAL_ENTITY } from "@/lib/site";

export const metadata: Metadata = pageMeta({ title: "Privacy policy", description: "What information DSP Connect collects from visitors, clients and partners, why we collect it, and the choices you have.", path: "/privacy" });

const PARTS: Part[] = [
  ["Who we are", [`DSP Connect is a service of ${LEGAL_ENTITY}. This policy covers this website and the DSP Connect service.`]],
  ["What we collect", [
    "What you give us: your name, business name, email, phone, website, industry, area, budget and goals, when you open the demo, open an account, ask about an agency agreement or write to us.",
    "Payment details: your payment is taken by Stripe. We receive confirmation and the amount. We never see or store your full card or bank details.",
    "How the site is used: pages visited, the page or campaign that brought you here, and general device and browser information. We use this in combined form to see which pages are useful. We do not use advertising cookies on this website.",
    "Details you type into our forms (such as your name, business, industry and area) are also remembered in your own browser, so the site can greet you, fill in forms for you and take you back to your demo or setup page. They stay on your device; use \"Not you?\" at the top of any page to clear them.",
    "Messages: what you send us by chat or email, so we can answer and keep a record.",
  ]],
  ["Why we use it", [
    "To open the demo and your account, set up your advertising, take payment, send you setup updates and account summaries, answer your questions, keep the service secure, and meet our legal duties.",
    "If you start opening an account and do not finish, we may send you one reminder. Every reminder has an unsubscribe link, and we honor it.",
  ]],
  ["Who we share it with", [
    "Companies that help us run the service, only as far as they need it: our payment provider (Stripe), our customer messaging and help desk provider (Intercom), our email delivery provider, our website and database hosts, and the advertising technology partners that deliver your ads.",
    "We do not sell your personal information. We disclose it if the law requires us to, or as part of a sale or merger of the business, under the same protections.",
  ]],
  ["Information about people who see ads", [
    "Ads are delivered using signals such as general location, device type and the kind of app or website being viewed. If you place our tracking code on your website, it records visits and actions so you can see what your ads produced. You are responsible for telling your own website visitors about this in your privacy policy.",
  ]],
  ["How long we keep it", [
    "Account and payment records are kept for as long as you are a client and for seven years after, for tax and legal reasons. Enquiries that do not become accounts are deleted after 24 months.",
  ]],
  ["Your choices", [
    "You can ask us for a copy of your information, ask us to correct or delete it, or tell us to stop emailing you. Email us and we will respond within 30 days. Depending on where you live, you may have further rights under your state's privacy law; we honor those requests from anyone, wherever they live.",
  ]],
  ["Security and children", [
    "We limit access to people who need it, encrypt data in transit, and use providers that hold recognized security certifications. No system is perfectly secure; if a breach affects you, we will tell you as the law requires.",
    "The service is for businesses. It is not directed at children, and we do not knowingly collect information from anyone under 16.",
  ]],
  ["Changes", ["If we change this policy in a way that matters, we will post the new version here and email clients before it applies."]],
];

export default function Privacy() {
  return <Legal path="/privacy" title="Privacy policy" intro="What we collect, why we collect it, who sees it, and what you can ask us to do." parts={PARTS} />;
}
