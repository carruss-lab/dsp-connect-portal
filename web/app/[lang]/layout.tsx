import type { Metadata } from "next";
import Script from "next/script";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import { Analytics } from "@vercel/analytics/next";
import Intercom from "@/components/Intercom";
import { SITE_URL } from "@/lib/seo";
import "../globals.css";
import { lang as rootLang } from "next/root-params";
import LanguageHint from "@/components/LanguageHint";

// Google Analytics runs on the live site only, so test visits do not count.
const GA_ID = process.env.VERCEL_ENV === "production" ? "G-EW1FDG4CE8" : "";

// PartnerStack: records which partner link a visitor came from, so their sign-up and payments are credited.
const PARTNERSTACK = `(function(){var gs=document.createElement("script");gs.src="https://get.getdspconnect.com/pr/js";gs.type="text/javascript";gs.async=true;gs.onload=gs.onreadystatechange=function(){var rs=this.readyState;if(rs&&rs!=="complete"&&rs!=="loaded")return;try{growsumo._initialize("pk_R4Vzb2YOLhyQSCiQFbeUilKCs7ACDmwL",["join.getdspconnect.com","dspconnect.partnerlinks.io","get.getdspconnect.com"]);if(typeof growsumoInit==="function"){growsumoInit();}}catch(e){}};var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(gs,s);})();`;

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const es = (await params).lang === "es";
  return {
    title: {
      default: es ? "DSP Connect | Publicidad programática empresarial, sin el contrato empresarial" : "DSP Connect | Enterprise programmatic advertising, without the enterprise contract",
      template: "%s | DSP Connect",
    },
    description: es
      ? "TV por streaming, aplicaciones y sitios web en más de 50 exchanges de anuncios, abierto a cualquier negocio desde un presupuesto de $750. Configurado para usted y activo en 14 días. Sin contrato."
      : "Streaming TV, apps and websites across 50+ ad exchanges, open to any business from a $750 ad budget. Set up for you, live within 14 days. No contract.",
    metadataBase: new URL(SITE_URL),
    openGraph: { type: "website", siteName: "DSP Connect", locale: es ? "es_US" : "en_US", images: [{ url: "/og", width: 1200, height: 630, alt: es ? "DSP Connect. Configuración hecha por nosotros." : "DSP Connect. Done-for-you setup." }] },
    twitter: { card: "summary_large_image", images: ["/og"] },
  };
}

export function generateStaticParams() { return [{ lang: "en" }, { lang: "es" }]; }
export const dynamicParams = false;

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const lang = (await rootLang()) === "es" ? "es" : "en";
  return (
    <html lang={lang}>
      <head>
        <script id="partnerstack" dangerouslySetInnerHTML={{ __html: PARTNERSTACK }} />
      </head>
      <body>
        {children}
        <LanguageHint />
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
