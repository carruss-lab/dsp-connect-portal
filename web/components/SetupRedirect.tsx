"use client";
import { useEffect, useState } from "react";
import { readProfile } from "@/lib/profile";
import { useLang } from "@/lib/useLang";
import { localePath, tr } from "@/lib/i18n";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function SetupRedirect() {
  const [missing, setMissing] = useState(false);
  const lang = useLang(); const t = tr(lang);
  useEffect(() => {
    const id = readProfile().setup;
    if (id && ID.test(id)) window.location.replace(`${localePath("/welcome", lang)}?id=${id}${window.location.hash}`);
    else setMissing(true);
  }, [lang]);
  if (!missing) return <p>{t("Opening your setup page…", "Abriendo su página de configuración…")}</p>;
  return (
    <>
      <h1>{t("Your setup page", "Su página de configuración")}</h1>
      <p>{t("Your setup page has a private link that we emailed to you when you paid, in the message titled “Payment received. Your DSP Connect setup has started”. Open that link to finish your campaign brief.", "Su página de configuración tiene un enlace privado que le enviamos por correo cuando pagó, en el mensaje titulado “Pago recibido. Su configuración de DSP Connect ya empezó”. Abra ese enlace para terminar el resumen de su campaña.")}</p>
      <p>{t("Can’t find it? Ask us in the chat and we will send it again.", "¿No lo encuentra? Pregúntenos en el chat y se lo enviamos de nuevo.")}</p>
    </>
  );
}
