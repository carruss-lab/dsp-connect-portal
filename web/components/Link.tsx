"use client";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { localePath, UNTRANSLATED } from "@/lib/i18n";

/** next/link that keeps visitors in their language: on a Spanish page, "/partners" goes to "/es/partners". */
export default function Link(props: ComponentProps<typeof NextLink>) {
  const es = usePathname()?.match(/^\/es(\/|$)/);
  const { href, ...rest } = props;
  let to = href;
  if (es && typeof href === "string" && href.startsWith("/") && !UNTRANSLATED.test(href)) to = localePath(href, "es");
  return <NextLink href={to} {...rest} />;
}
