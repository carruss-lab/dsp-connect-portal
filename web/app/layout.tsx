import type { Metadata } from "next";
import Script from "next/script";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import { Analytics } from "@vercel/analytics/next";
import Intercom from "@/components/Intercom";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

// Google Analytics runs on the live site only, so test visits do not count.
const GA_ID = process.env.VERCEL_ENV === "production" ? "G-EW1FDG4CE8" : "";

export const metadata: Metadata = {
  title: { default: "DSP Connect | See what you get before you spend", template: "%s | DSP Connect" },
  description:
    "Advertising on apps and websites for business owners and agencies. Done-for-you setup, live within 14 days, from $750.",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "./" },
  openGraph: { type: "website", siteName: "DSP Connect", locale: "en_US", url: "./" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        {children}
        <Intercom />
        <Analytics />
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
