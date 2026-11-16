import type { Metadata } from "next";
import Demo from "@/components/Demo";
import { INDUSTRIES } from "@/lib/site";

export const metadata: Metadata = { title: "Demo account", robots: { index: false } };

export default async function DemoPage({ searchParams }: PageProps<"/demo">) {
  const q = await searchParams;
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";
  const industry = INDUSTRIES.includes(pick(q.industry)) && pick(q.industry) !== "Other" ? pick(q.industry) : "Local";
  const market = pick(q.market).replace(/[^\p{L}\p{N} ,.'-]/gu, "").slice(0, 60) || "your area";
  return <Demo industry={industry} market={market} />;
}
