import type { Metadata } from "next";
import Image from "next/image";
import ConnectButton from "@/components/ConnectButton";
import { refreshPayouts } from "@/lib/partnerStripe";
import { isUuid, secretRpc } from "@/lib/server";
import { LEGAL_ENTITY, PARTNER_PCT } from "@/lib/site";
import { getLang } from "@/lib/lang";
import { localePath, tr } from "@/lib/i18n";
import LangSwitch from "@/components/LangSwitch";

export async function generateMetadata(): Promise<Metadata> {
  return { title: tr(await getLang())("Welcome, Authorized Sales Partner", "Bienvenido, Socio de Ventas Autorizado"), robots: { index: false, follow: false } };
}
type Partner = { id: string; name: string; email: string; status: string; code: string; stripe_account_id: string | null; payouts_ready: boolean; entity_type: string | null; company_name: string | null };

export default async function Join({ params }: PageProps<"/[lang]/partners/join/[token]">) {
  const { token } = await params;
  const lang = await getLang(); const t = tr(lang); const es = lang === "es";
  let partner: Partner | null = null;
  if (isUuid(token)) {
    try { partner = (await secretRpc<Partner[]>("partner_by_token", { p_token: token }))[0] || null; } catch (err) { console.error("join lookup failed", err); }
  }
  const started = !!partner?.stripe_account_id;
  const ready = partner ? await refreshPayouts({ ...partner, invite_token: token }) : false;

  return (
    <>
      <header className="header"><div className="wrap"><span className="brand"><Image src="/logo.png" alt="" width={30} height={30} />DSP Connect</span><span className="small">{t("Authorized Sales Partner", "Socio de Ventas Autorizado")}</span><LangSwitch /></div></header>
      <main className="wrap stack g32" style={{ padding: "72px 32px 96px", maxWidth: 760 }}>
        {!partner || ["ended", "applied", "declined"].includes(partner.status) ? (
          <><h1 className="h1" style={{ fontSize: 36 }}>{t("This link is not valid.", "Este enlace no es válido.")}</h1><p className="lead">{t("Check that you opened the full link from your enrollment email. If you need it again, reply to that email or ask in the chat.", "Revise que haya abierto el enlace completo de su correo de inscripción. Si lo necesita de nuevo, responda a ese correo o pregunte en el chat.")}</p></>
        ) : (
          <>
            <div className="stack g16">
              <div className="eyebrow">{["admitted", "active"].includes(partner.status) ? t("Approved", "Aprobado") : t("Your enrollment", "Su inscripción")}</div>
              <h1 className="h1" style={{ fontSize: "clamp(30px,4.4vw,44px)" }}>{t("Welcome", "Bienvenido")}, {partner.name.split(" ")[0]}.</h1>
              <p className="lead">{["admitted", "active"].includes(partner.status) ? t("You are approved as a DSP Connect Authorized Sales Partner.", "Usted está aprobado como Socio de Ventas Autorizado de DSP Connect.") : t("Two steps to approval: sign your agreement and verify with Stripe. Once both are done you are approved automatically.", "Dos pasos para su aprobación: firme su acuerdo y verifíquese con Stripe. Cuando termine ambos, queda aprobado automáticamente.")} {t(`You earn ${PARTNER_PCT}% of the qualified ad spend of the clients you bring in, paid daily, for as long as they spend.`, `Usted gana el ${PARTNER_PCT}% del gasto publicitario calificado de los clientes que trae, pagado a diario, mientras sigan gastando.`)}</p>
            </div>
            <ol className="stack g16" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li className="card stack g8">
                <div className="num">01</div><h2 className="h3">{t("Open your partner portal", "Abra su portal de socio")}</h2>
                <p className="p">{t(`Sign in with ${partner.email} to read and sign your Sales Partner Agreement (as yourself or for your company), complete the short training, and see your clients and earnings.`, `Entre con ${partner.email} para leer y firmar su Acuerdo de Socio de Ventas (como persona o por su empresa), completar la capacitación corta y ver sus clientes y ganancias.`)}</p>
                <a className="btn btn-blue" style={{ alignSelf: "flex-start" }} href={localePath("/partner", lang)}>{partner.status === "invited" ? t("Sign your agreement", "Firmar su acuerdo") : t("Go to your portal", "Ir a su portal")}</a>
              </li>
              <li className="card stack g12" style={ready ? { borderColor: "#14532D" } : undefined}>
                <div className="num">02</div><h2 className="h3">{t("Verify with Stripe and set up payouts", "Verifíquese con Stripe y configure sus pagos")}</h2>
                {ready ? (
                  <p className="note note-ok">{t("Stripe has verified you and your payout account is set up. Commission will be paid to the bank account you gave Stripe.", "Stripe lo verificó y su cuenta de pagos está configurada. La comisión se depositará en la cuenta bancaria que le dio a Stripe.")}</p>
                ) : (
                  <>
                    <p className="p">{es ? `Los pagos se hacen por Stripe${partner.entity_type === "company" ? ", a la cuenta de su empresa" : ""}. Usted da sus datos bancarios y fiscales directamente a Stripe en su página segura; DSP Connect nunca los ve ni los guarda.` : `Payouts are made through Stripe${partner.entity_type === "company" ? ", into your company's account" : ""}. You give your bank and tax details directly to Stripe on their secure page; DSP Connect never sees or stores them.`}</p>
                    <ConnectButton token={token} label={started ? t("Finish payout setup", "Terminar la configuración de pagos") : partner.stripe_account_id ? t("Continue payout setup", "Continuar la configuración de pagos") : t("Set up payouts with Stripe", "Configurar pagos con Stripe")} />
                    {started && <p className="small">{t("Stripe is still reviewing your details. If it asks for anything more, use the button above.", "Stripe todavía está revisando sus datos. Si le pide algo más, use el botón de arriba.")}</p>}
                  </>
                )}
              </li>
              <li className="card stack g8">
                <div className="num">03</div><h2 className="h3">{t("Your client link", "Su enlace para clientes")}</h2>
                <p className="p">{t("Once you are approved (agreement signed and Stripe verified), clients who open their account through your link are credited to you automatically.", "Cuando esté aprobado (acuerdo firmado y Stripe verificado), los clientes que abran su cuenta con su enlace se le acreditan automáticamente.")}</p>
                <div className="dm-code" style={{ marginTop: 0 }}>getdspconnect.com/?p={partner.code}</div>
                {es && <div className="dm-code" style={{ marginTop: 0 }}>getdspconnect.com/es?p={partner.code} <span className="small">(en español)</span></div>}
                <p className="small">{t("Your partner code is", "Su código de socio es")} <b>{partner.code}</b>. {t("The link starts crediting you once you are approved.", "El enlace empieza a acreditarle cuando esté aprobado.")}</p>
              </li>
            </ol>
            <p className="small">{t(`Authorized Sales Partners are independent contractors of ${LEGAL_ENTITY}, not employees or resellers. There is no salary and no guaranteed income.`, `Los Socios de Ventas Autorizados son contratistas independientes de ${LEGAL_ENTITY}, no empleados ni revendedores. No hay salario ni ingresos garantizados.`)}</p>
          </>
        )}
      </main>
    </>
  );
}
