import type { Metadata } from "next";
import Demo from "@/components/Demo";
import { Remember } from "@/components/Personal";
import { INDUSTRIES } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/demo">): Promise<Metadata> {
  return { title: (await params).lang === "es" ? "Cuenta de demostración" : "Demo account", robots: { index: false } };
}

export default async function DemoPage({ searchParams }: PageProps<"/[lang]/demo">) {
  const q = await searchParams;
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";
  const industry = INDUSTRIES.includes(pick(q.industry)) && pick(q.industry) !== "Other" ? pick(q.industry) : "Local";
  const market = pick(q.market).replace(/[^\p{L}\p{N} ,.'-]/gu, "").slice(0, 60) || "your area";
  const real = industry !== "Local" && market !== "your area";
  return <>{real && <Remember industry={industry} market={market} />}<Demo industry={industry} market={market} agency={pick(q.view) === "agency"} /></>;
}
