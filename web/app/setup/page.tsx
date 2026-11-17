import type { Metadata } from "next";
import { Header, Footer } from "@/components/Chrome";
import SetupRedirect from "@/components/SetupRedirect";

export const metadata: Metadata = { title: "Your setup page", robots: { index: false } };

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
