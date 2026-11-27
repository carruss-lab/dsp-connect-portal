import type { Metadata } from "next";
import { Footer, Header } from "@/components/Chrome";
import { isUuid, secretRpc } from "@/lib/server";
import { getLang } from "@/lib/lang";
import { tr } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  return { title: tr(await getLang())("Unsubscribe", "Cancelar suscripción"), robots: { index: false, follow: false } };
}

// Opened from the link in a reminder email. Stops reminders to that address straight away.
export default async function Unsubscribe({ searchParams }: PageProps<"/[lang]/unsubscribe">) {
  const q = await searchParams;
  const t = tr(await getLang());
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
        <h1 className="h2">{ok ? t("You are unsubscribed.", "Canceló su suscripción.") : t("We could not find that link.", "No encontramos ese enlace.")}</h1>
        <p className="p">{ok
          ? partner ? t("We will not send you any more reminder emails. You will still get messages you need, such as sign-in links and payment notices.", "No le enviaremos más correos de recordatorio. Seguirá recibiendo los mensajes que necesita, como enlaces para iniciar sesión y avisos de pago.") : t("We will not send you any more reminders. If you are a client, you will still get messages about your account, such as payment receipts.", "No le enviaremos más recordatorios. Si es cliente, seguirá recibiendo mensajes sobre su cuenta, como recibos de pago.")
          : t("The link may be incomplete. Reply to any email from us and we will remove you by hand.", "Es posible que el enlace esté incompleto. Responda a cualquier correo nuestro y lo quitaremos de la lista manualmente.")}</p>
      </main>
      <Footer />
    </>
  );
}
