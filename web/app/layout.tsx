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
  title: { default: "DSP Connect | Enterprise programmatic advertising, without the enterprise contract", template: "%s | DSP Connect" },
  description:
    "Streaming TV, apps and websites across 50+ ad exchanges, open to any business from a $750 ad budget. Set up for you, live within 14 days. No contract.",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "./" },
  openGraph: { type: "website", siteName: "DSP Connect", locale: "en_US", url: "./", images: [{ url: "/og", width: 1200, height: 630, alt: "DSP Connect. Done-for-you setup." }] },
  twitter: { card: "summary_large_image", images: ["/og"] },
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
