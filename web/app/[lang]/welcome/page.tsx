import type { Metadata } from "next";
import { Footer, Header } from "@/components/Chrome";
import IdentifyClient from "@/components/IdentifyClient";
import { messengerJwt } from "@/lib/chatId";
import { Remember } from "@/components/Personal";
import IntakeForm from "@/components/IntakeForm";
import PlanView from "@/components/PlanView";
import { CHANNELS, type Plan } from "@/lib/plan";
import { isUuid, secretRpc } from "@/lib/server";
import { HELP_URL, SETUP_DAYS, SUPPORT_EMAIL } from "@/lib/site";
import { getLang } from "@/lib/lang";
import { tr, type Lang } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  return { title: tr(await getLang())("Your setup", "Su configuración"), robots: { index: false, follow: false } };
}

type Status = {
  email: string; business: string | null; name: string | null; paid_at: string; amount_paid: number | null; setup_due: string | null; website: string | null;
  step_account_at: string | null; step_tracking_at: string | null; step_ads_at: string | null; step_audience_at: string | null; live_at: string | null; intake_at: string | null;
  intake: Record<string, string> | null; formats: string | null; market: string | null; goals: string | null;
  strategy_id?: string | null; plan?: Plan | null; industry?: string | null;
};

/** The brief starts from the ad plan they made before signing up, where it has an answer. */
const fromPlan = (p: Plan | null | undefined): Record<string, string> => !p ? {} : {
  promoting: p.learned.offer, ideal_customer: p.learned.customer, areas: p.targeting.locations.join(", "), result_definition: p.tracking.action,
  formats: [...new Set(p.channels.map((c) => CHANNELS[c.key].format))].join(", "),
  campaign_types: [p.channels.some((c) => c.key === "retargeting") ? "Bring back people who visited my website" : "", "Reach new people in my area"].filter(Boolean).join(", "),
};
const stepsFor = (t: ReturnType<typeof tr>): [keyof Status, string, string][] => [
  ["step_account_at", t("Account created", "Cuenta creada"), t("Your account exists and your ad budget is loaded.", "Su cuenta ya existe y su presupuesto de anuncios está cargado.")],
  ["step_tracking_at", t("Tracking placed", "Seguimiento instalado"), t("Your website counts the visits and leads your ads produce.", "Su sitio web cuenta las visitas y los contactos que producen sus anuncios.")],
  ["step_ads_at", t("Ads approved", "Anuncios aprobados"), t("Your ads are checked and accepted by the ad exchanges.", "Sus anuncios están revisados y aceptados por los exchanges de anuncios.")],
  ["step_audience_at", t("Audience built", "Audiencia creada"), t("Your ads are aimed at the right people in your area.", "Sus anuncios van dirigidos a las personas correctas en su zona.")],
];
const TODO = (s: Status, t: ReturnType<typeof tr>): [boolean, string, React.ReactNode][] => [
  [!!s.intake_at, t("Fill in your campaign brief", "Llene el resumen de su campaña"), <>{t("Your goals, customers, campaigns, ads and website.", "Sus metas, clientes, campañas, anuncios y sitio web.")} <a href="#brief">{t("Go to the brief", "Ir al resumen")}</a>. {t("Please send it within 5 days of paying.", "Envíelo en un plazo de 5 días después de pagar, por favor.")}</>],
  [false, t("Approve your campaign plan", "Apruebe el plan de su campaña"), t("Once your brief is in, we email you your campaign plan. Reply to approve it, or ask for changes.", "Cuando recibamos su resumen, le enviamos por correo el plan de su campaña. Responda para aprobarlo o pida cambios.")],
  [false, t("Watch for your login emails", "Esté atento a sus correos de acceso"), t("Once your account is approved, your login details arrive in separate emails. Keep them safe.", "Cuando se apruebe su cuenta, sus datos de acceso llegan en correos aparte. Guárdelos en un lugar seguro.")],
];
const dayFor = (lang: Lang) => (iso: string) => new Date(iso.slice(0, 10) + "T12:00:00Z").toLocaleDateString(lang === "es" ? "es-US" : "en-US", { month: "long", day: "numeric", timeZone: "UTC" });

// A paying client's private page: where their setup stands, and where they send us what we need.
export default async function Welcome({ searchParams }: PageProps<"/[lang]/welcome">) {
  const id = String((await searchParams).id || "");
  const lang = await getLang(); const t = tr(lang); const day = dayFor(lang); const STEPS = stepsFor(t);
  let s: Status | null = null;
  if (isUuid(id)) { try { s = await secretRpc<Status | null>("client_status", { p_lead: id }); } catch (err) { console.error("welcome failed", err); } }

  if (!s) {
    return (
      <>
        <Header />
        <main className="wrap stack g16" style={{ maxWidth: 640, padding: "96px 32px" }}>
          <h1 className="h2">{t("We could not find that setup page.", "No encontramos esa página de configuración.")}</h1>
          <p className="p">{t("Use the link in your payment email. If you cannot find it, email", "Use el enlace de su correo de pago. Si no lo encuentra, escriba a")} <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> {t("and we will send it again.", "y se lo enviamos de nuevo.")}</p>
        </main>
        <Footer />
      </>
    );
  }
  const done = STEPS.filter(([k]) => s![k]).length;
  return (
    <>
      <Header />
      <IdentifyClient email={s.email} name={s.name} jwt={messengerJwt(s.email, s.name)} />
      <Remember name={s.name || undefined} email={s.email} business={s.business || undefined} website={s.website || undefined} stage="paid" setup={id} />
      <main className="wrap narrow stack g32" style={{ padding: "64px 32px 80px" }}>
        <div className="stack g12">
          <div className="eyebrow">{t("Your setup", "Su configuración")}{s.business ? ` · ${s.business}` : ""}</div>
          <h1 className="h1" style={{ fontSize: "clamp(30px,4vw,42px)" }}>
            {s.live_at ? t("Your ads are live.", "Sus anuncios están activos.") : done === STEPS.length ? t("Setup is finished. Final checks before launch.", "La configuración está terminada. Últimas revisiones antes del lanzamiento.") : t(`${done} of ${STEPS.length} setup steps done.`, `${done} de ${STEPS.length} pasos de configuración listos.`)}
          </h1>
          <p className="lead">
            {s.live_at ? t(`They went live on ${day(s.live_at)}. You will get a summary every Monday.`, `Salieron al aire el ${day(s.live_at)}. Recibirá un resumen cada lunes.`)
              : s.setup_due ? t(`Your ads will be live by ${day(s.setup_due)}.`, `Sus anuncios estarán activos a más tardar el ${day(s.setup_due)}.`) : t(`Your ads will be live within ${SETUP_DAYS} days of your payment.`, `Sus anuncios estarán activos en ${SETUP_DAYS} días después de su pago.`)}
          </p>
        </div>

        <ol className="grid" style={{ listStyle: "none", padding: 0, margin: 0, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
          {STEPS.map(([k, h, d], i) => (
            <li className="step stack g8" key={k} style={{ borderTopColor: s![k] ? "var(--blue)" : "var(--line)" }}>
              <div className="num">{String(i + 1).padStart(2, "0")} · {s![k] ? `${t("Done", "Listo")} ${day(s![k] as string)}` : t("In progress", "En curso")}</div>
              <h2 className="h3">{h}</h2>
              <p className="p" style={{ fontSize: 14 }}>{d}</p>
            </li>
          ))}
        </ol>

        <section className="stack g16">
          <h2 className="h3" style={{ fontSize: 19 }}>{t("Your part: three things", "Su parte: tres cosas")}</h2>
          <ol className="stack g12" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {TODO(s, t).map(([done, h, d]) => (
              <li key={h} className="card" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 16 }}>
                <span aria-hidden="true" style={{ flex: "0 0 24px", height: 24, borderRadius: 12, border: "2px solid", borderColor: done ? "var(--blue)" : "var(--line)", background: done ? "var(--blue)" : "transparent", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{done ? "✓" : ""}</span>
                <div className="stack g8"><h3 className="h3" style={{ fontSize: 16 }}>{h}{done ? <span className="small"> · {t("done", "listo")}</span> : ""}</h3><p className="p" style={{ fontSize: 14 }}>{d}</p></div>
              </li>
            ))}
          </ol>
        </section>

        {s.plan && s.strategy_id && (
          <section className="stack g12" aria-labelledby="plan-h">
            <h2 id="plan-h" className="h3" style={{ fontSize: 19 }}>{t("Your ad plan", "Su plan de anuncios")}</h2>
            <p className="p" style={{ fontSize: 14 }}>{t("The plan you made from your website before you signed up. We use it as the starting point for your setup, and your brief below is filled in from it.", "El plan que hizo a partir de su sitio web antes de registrarse. Lo usamos como punto de partida para su configuración, y su resumen de abajo se llena a partir de él.")}</p>
            <PlanView compact saved={{ id: s.strategy_id, business: s.business || "", website: s.website || "", industry: "", market: s.market || "", plan: s.plan }} />
          </section>
        )}

        {!s.live_at && (
          <section id="brief" className="card stack g24" style={{ background: "var(--ground)", maxWidth: 820, scrollMarginTop: 80 }}>
            <div className="stack g8">
              <h2 className="h2" style={{ fontSize: 24 }}>{s.intake_at ? t("Your campaign brief", "El resumen de su campaña") : t("Your campaign brief: tell us what you want to achieve", "El resumen de su campaña: cuéntenos qué quiere lograr")}</h2>
              <p className="p">
                {s.intake_at ? t(`You sent this on ${day(s.intake_at)}. Change anything below and send it again.`, `Lo envió el ${day(s.intake_at)}. Cambie lo que quiera abajo y envíelo de nuevo.`)
                  : t("These are the questions an advertising consultant asks before building a first campaign. Your answers decide what we build, who we aim it at and what we count as a result. It takes about ten minutes, and only a few answers are required. The rest help us do a better job.", "Estas son las preguntas que hace un consultor de publicidad antes de armar una primera campaña. Sus respuestas deciden qué construimos, a quién lo dirigimos y qué contamos como resultado. Toma unos diez minutos, y solo algunas respuestas son obligatorias. Las demás nos ayudan a hacer un mejor trabajo.")}
              </p>
            </div>
            <IntakeForm lead={id} saved={s.intake} defaults={{ ...fromPlan(s.plan), landing_page: s.website || "", ...(s.market && !s.plan ? { areas: s.market } : {}), ...(s.formats ? { formats: s.formats } : {}), other_goals: s.goals || "" }} />
          </section>
        )}

        <section className="grid cols-3">
          <div className="stack g8"><h2 className="h3">{t("Emails to expect", "Correos que va a recibir")}</h2><p className="p" style={{ fontSize: 14 }}>{t("One from us each time a step is finished and when you go live. Your login details arrive in separate emails once your account is approved.", "Uno nuestro cada vez que se termina un paso y cuando sale al aire. Sus datos de acceso llegan en correos aparte cuando se apruebe su cuenta.")}</p></div>
          <div className="stack g8"><h2 className="h3">{t("Questions", "Preguntas")}</h2><p className="p" style={{ fontSize: 14 }}>{t("Use the chat on this page, read", "Use el chat de esta página, lea")} <a href={HELP_URL}>{t("the help center", "el centro de ayuda")}</a>{t(", or email", " o escriba a")} <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p></div>
          <div className="stack g8"><h2 className="h3">{t("Anything else", "Cualquier otra cosa")}</h2><p className="p" style={{ fontSize: 14 }}>{t("Ask Fin in the chat at any hour. If something needs our team, Fin passes it on and we reply by email.", "Pregúntele a Fin en el chat a cualquier hora. Si algo necesita a nuestro equipo, Fin lo pasa y le respondemos por correo.")}</p></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
