import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getLang } from "@/lib/lang";
import { TERMS_ES } from "@/lib/legal.es";
import Legal, { type Part } from "@/components/Legal";
import { LEGAL_ENTITY, MIN_BUDGET, SETUP_DAYS } from "@/lib/site";

const META = {
  en: { title: "Client terms", description: "The client terms that apply when you open a DSP Connect account: setup, your ad budget, our fee, canceling and refunds." },
  es: { title: "Términos para clientes", description: "Los términos que se aplican cuando abre una cuenta de DSP Connect: configuración, su presupuesto publicitario, nuestra tarifa, cancelación y reembolsos." },
};
export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return pageMeta({ ...META[lang], path: "/terms", lang });
}

const PARTS: Part[] = [
  ["Who these terms are between", [
    `These terms are an agreement between you (the business opening an account) and ${LEGAL_ENTITY}, which provides the DSP Connect service ("we", "us"). By ticking "I agree" and paying, you accept them.`,
  ]],
  ["What we provide", [
    "DSP Connect lets you run banner, video and native ads on apps and websites. We set up your account for you: we create the account and load your budget, place tracking on your website, review your ads, and build your first audience. After that you run your campaigns in your account, with help from us when you ask.",
  ]],
  [`Setup within ${SETUP_DAYS} days`, [
    `We will have your ads ready to go live within ${SETUP_DAYS} days of receiving your payment. To do that we need two things from you within 5 days of payment: your ads (images or video, your logo, and the web page people should land on), and access for tracking (the person who can add a small piece of code to your website).`,
    `If we receive those later, the ${SETUP_DAYS} days run from the day we have both. If we miss the date for reasons within our control, you may cancel and receive a full refund of your ad budget.`,
  ]],
  ["Your ad budget and our fee", [
    `You pay your ad budget in advance. The minimum starting budget is $${MIN_BUDGET}. Your ads run until the budget is used; they then pause until you add more. Adding budget is always your choice.`,
    "There is no monthly platform fee. Our fee is included in the price of your ads. The prices shown in your account are the prices you pay.",
    "Payments are processed by Stripe. We do not see or store your card or bank details.",
  ]],
  ["Canceling and refunds", [
    "There is no long-term contract. You can cancel at any time. What is refunded is set out in our Refund policy, which is part of these terms.",
  ]],
  ["Your ads and your website", [
    "You are responsible for your ads and the pages they lead to. They must be truthful, must be yours to use, and must follow the law and the rules of your industry (for example, rules on health, legal, financial, housing, employment, credit and political advertising).",
    "We and the ad exchanges that carry your ads may decline or remove any ad. We do not run ads for illegal products or services, ads that mislead, or ads that target people in ways the law forbids.",
  ]],
  ["Results", [
    "Advertising results depend on many things outside our control, including your offer, your ads, your website and your market. We do not promise any number of views, clicks, leads or sales. Figures in the demo account are sample data, not a forecast.",
  ]],
  ["Your data and ours", [
    "Your account data and your campaign results belong to you. We use them to provide the service, and in combined form that does not identify you to improve it. How we handle personal information is set out in our Privacy policy.",
  ]],
  ["Limits on what we are liable for", [
    "To the extent the law allows: the service is provided as it is; we are not liable for indirect losses or lost profits; and our total liability to you for any claim is limited to the amount you paid us in the three months before the claim arose.",
  ]],
  ["Changes and ending the agreement", [
    "We may update these terms. If a change affects you materially, we will email you at least 14 days before it applies. We may suspend or close an account that breaks these terms; if we do, any unspent ad budget is refunded as set out in the Refund policy.",
    `These terms are governed by the laws of the state in which ${LEGAL_ENTITY} is organized.`,
  ]],
];

export default async function Terms() {
  const lang = await getLang();
  return lang === "es"
    ? <Legal lang="es" path="/terms" title={META.es.title} intro="Términos claros para abrir y usar una cuenta de DSP Connect. Léalos antes de pagar." parts={TERMS_ES} />
    : <Legal path="/terms" title={META.en.title} intro="Plain terms for opening and using a DSP Connect account. Please read them before you pay." parts={PARTS} />;
}
