import type { Metadata } from "next";
import { Footer, Header } from "@/components/Chrome";
import { isUuid, secretRpc } from "@/lib/server";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

// Opened from the link in a reminder email. Stops reminders to that address straight away.
export default async function Unsubscribe({ searchParams }: PageProps<"/unsubscribe">) {
  const q = await searchParams;
  const id = String(q.id || "");
  const partner = String(q.partner || "");
  let ok = false;
  if (isUuid(id)) {
    try { ok = (await secretRpc<boolean>("lead_unsubscribe", { p_lead: id })) === true; } catch (err) { console.error("unsubscribe failed", err); }
  } else if (isUuid(partner)) {
    try { ok = (await secretRpc<boolean>("partner_unsubscribe", { p_partner: partner })) === true; } catch (err) { console.error("partner unsubscribe failed", err); }
  }
  return (
    <>
      <Header />
      <main className="wrap stack g16" style={{ maxWidth: 640, padding: "96px 32px" }}>
        <h1 className="h2">{ok ? "You are unsubscribed." : "We could not find that link."}</h1>
        <p className="p">{ok
          ? partner ? "We will not send you any more reminder emails. You will still get messages you need, such as sign-in links and payment notices." : "We will not send you any more reminders. If you are a client, you will still get messages about your account, such as payment receipts."
          : "The link may be incomplete. Reply to any email from us and we will remove you by hand."}</p>
      </main>
      <Footer />
    </>
  );
}
