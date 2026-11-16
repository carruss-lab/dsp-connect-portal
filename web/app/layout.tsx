import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "DSP Connect | See what you get before you spend", template: "%s | DSP Connect" },
  description:
    "Advertising on apps and websites for business owners and agencies. Done-for-you setup, live within 14 days, from $750.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
