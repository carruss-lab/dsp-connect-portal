import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Legal, { type Part } from "@/components/Legal";
import { SETUP_DAYS } from "@/lib/site";

export const metadata: Metadata = pageMeta({ title: "Refund policy", description: "What happens to your ad budget if you cancel your DSP Connect account.", path: "/refunds" });

const PARTS: Part[] = [
  ["The short version", [
    "There is no long-term contract. You can cancel at any time by emailing us. Ad budget you have not spent is refunded. Ad budget already spent on ads that ran is not.",
  ]],
  ["If you cancel before your ads go live", [
    "We refund your full ad budget, less the card or bank processing fee that our payment provider keeps on the original payment.",
    `If we miss the ${SETUP_DAYS}-day setup date for reasons within our control, we refund your ad budget in full, with nothing deducted.`,
  ]],
  ["If you cancel after your ads go live", [
    "We stop your ads within 2 business days of your request. We refund the unspent part of your ad budget, less the processing fee on that amount. Money already spent on ads that ran cannot be refunded.",
  ]],
  ["How and when you are paid back", [
    "Refunds go back to the card or bank account you paid with, within 10 business days of your request. Your bank may take a few more days to show it.",
  ]],
  ["Ads that did not run as they should", [
    "If you believe ads were shown in a way that does not match your campaign settings, tell us within 30 days. We will investigate and, where the fault is ours or the ad exchange's, credit the affected amount back to your ad budget.",
  ]],
];

export default function Refunds() {
  return <Legal path="/refunds" title="Refund policy" intro="What happens to your money if you change your mind." parts={PARTS} />;
}
