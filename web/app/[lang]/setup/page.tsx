import type { Metadata } from "next";
import { Header, Footer } from "@/components/Chrome";
import SetupRedirect from "@/components/SetupRedirect";

import { getLang } from "@/lib/lang";
import { tr } from "@/lib/i18n";
export async function generateMetadata(): Promise<Metadata> {
  return { title: tr(await getLang())("Your setup page", "Su página de configuración"), robots: { index: false } };
}

/** A fixed address for "your setup page" (used by reminders and banners). Sends a client to their own
 *  private setup page using what this browser remembers; otherwise points them to their welcome email. */
export default function Setup() {
  return (
    <>
      <Header />
      <main className="wrap" style={{ padding: "64px 32px", maxWidth: 720 }}>
        <SetupRedirect />
      </main>
      <Footer />
    </>
  );
}
