import type { Metadata } from "next";
import { getLang } from "@/lib/lang";
import { tr, localePath, type Lang } from "@/lib/i18n";
import Image from "next/image";
import ConnectButton from "@/components/ConnectButton";
import LangSwitch from "@/components/LangSwitch";
import IdentifyClient from "@/components/IdentifyClient";
import { messengerJwt } from "@/lib/chatId";
import { CopyLink, CopyTemplate, LessonDone, LoginForm, RemoveRep, SignDocs, TeamInvite } from "@/components/partner/PartnerBits";
import { loadPortal, type Client, type MemberPortal, type Portal } from "@/lib/partner";
import { refreshPayouts } from "@/lib/partnerStripe";
import { docsFor, VERSION } from "@/lib/partnerDocs";
import { LEGAL_ENTITY, SETUP_DAYS, PARTNER_PCT, SUPPORT_EMAIL, siteOrigin } from "@/lib/site";
import { LESSONS, lessonsFor } from "@/lib/training";
import { industryName } from "@/lib/i18n";
import VideoEmbed from "@/components/VideoEmbed";
import { VIDEOS, forLang } from "@/lib/videos";
import { callScriptFor, emailsFor, objectionsFor, fill } from "@/lib/salesKit";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: tr(lang)("Partner portal", "Portal de socios"), robots: { index: false, follow: false } };
}
export const dynamic = "force-dynamic";

const usd = (v: number) => "$" + Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const day = (iso: string | null, lang: Lang = "en") => (iso ? new Date(iso.length === 10 ? iso + "T12:00:00Z" : iso).toLocaleDateString(lang === "es" ? "es-US" : "en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Phoenix" }) : "");

function Top({ name, lang }: { name?: string; lang: Lang }) {
  const t = tr(lang);
  return (
    <header className="header"><div className="wrap">
      <span className="brand"><Image src="/logo.png" alt="" width={30} height={30} />DSP Connect</span>
      <span className="small" style={{ flexGrow: 1 }}>{t("Sales Partner portal", "Portal del Socio de Ventas")}</span>
      <LangSwitch />
      {name && <form action="/api/partner/logout" method="post"><span className="small" style={{ marginRight: 12 }}>{name}</span><button className="btn btn-line" style={{ minHeight: 34 }}>{t("Sign out", "Cerrar sesión")}</button></form>}
    </div></header>
  );
}

function clientStatus(c: Client, today: string, lang: Lang) {
  const t = tr(lang);
  if (c.live_at) return { text: t("Live", "Activo"), tone: "#14532D" };
  if (!c.paid_at) return { text: t("Not paid yet", "Aún sin pagar"), tone: "#5B6577" };
  const late = c.setup_due && c.setup_due < today;
  return { text: `${t("In setup", "En configuración")}: ${c.steps_done} ${t("of", "de")} 4${c.brief_sent ? "" : t(", brief not sent", ", resumen sin enviar")}${c.setup_due ? `, ${t("due", "fecha límite")} ${day(c.setup_due, lang)}` : ""}`, tone: late ? "#8A1C0E" : "#7A4B00" };
}

export default async function PartnerPortal({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const lang = await getLang(); const t = tr(lang);
  const portal = await loadPortal();
  if (!portal) {
    return (
      <>
        <Top lang={lang} />
        <main className="wrap stack g24" style={{ padding: "72px 32px 96px", maxWidth: 520 }}>
          <div className="eyebrow">{t("Authorized Sales Partners", "Socios de Ventas Autorizados")}</div>
          <h1 className="h1" style={{ fontSize: 36 }}>{t("Sign in to your partner portal.", "Inicie sesión en su portal de socio.")}</h1>
          <p className="lead">{t("Enter the email address you applied with. We will email you a link to sign in; no password needed.", "Escriba el correo electrónico con el que se registró. Le enviaremos un enlace para iniciar sesión; no necesita contraseña.")}</p>
          <LoginForm expired={sp.link === "expired"} />
          {lang === "es"
            ? <p className="small">¿Aún no es Socio de Ventas? <a href="/es/partners">Solicite ser Socio de Ventas Autorizado</a>. Los dueños de negocio pueden <a href="/es/open-account">abrir una cuenta aquí</a>.</p>
            : <p className="small">Not a Sales Partner yet? <a href="/partners">Apply to become an Authorized Sales Partner</a>. Business owners can <a href="/open-account">open an account here</a>.</p>}
        </main>
      </>
    );
  }
  if (portal.role === "member") return <RepDashboard portal={portal} lang={lang} />;
  if (portal.partner.stripe_started && !portal.partner.payouts_ready) {
    portal.partner.payouts_ready = await refreshPayouts({ invite_token: portal.partner.invite_token, stripe_account_id: portal.partner.stripe_account_id, payouts_ready: false });
  }
  return <Dashboard portal={portal} lang={lang} />;
}

function Dashboard({ portal, lang }: { portal: Portal; lang: Lang }) {
  const t = tr(lang);
  const d = (x: string | null) => day(x, lang);
  const { partner: p, clients, earnings: e, payouts, training, today, team = [] } = portal;
  const signed = !!p.signed_at;
  const trained = !!p.training_done_at;
  const first = p.name.split(" ")[0];
  const steps = [
    { t: t("Sign your Sales Partner Agreement", "Firme su Acuerdo de Socio de Ventas"), done: signed },
    { t: t("Set up payouts with Stripe", "Configure sus pagos con Stripe"), done: p.payouts_ready },
    { t: t("Complete the training", "Complete la capacitación"), done: trained },
    { t: t("Bring your first client", "Traiga a su primer cliente"), done: clients.some((c) => c.paid_at) },
  ];
  const ended = p.status === "paused";
  const live = clients.filter((c) => c.live_at).length;
  const week = clients.reduce((s, c) => s + Number(c.spent_7d || 0), 0);

  return (
    <>
      <Top name={p.name} lang={lang} />
      <IdentifyClient email={p.email} name={p.name} jwt={messengerJwt(p.email, p.name)} />
      <main className="wrap stack g32" style={{ padding: "48px 32px 96px", maxWidth: 1040 }}>
        <div className="stack g8">
          <div className="eyebrow">{t("Authorized Sales Partner", "Socio de Ventas Autorizado")}{p.vertical ? ` · ${p.vertical}` : ""}</div>
          <h1 className="h1" style={{ fontSize: "clamp(30px,4vw,42px)" }}>{t("Welcome", "Bienvenido")}, {first}.</h1>
          {ended && <p className="note note-err">{t("Your partner link is paused. New clients are not being credited to you. Contact DSP Connect for details.", "Su enlace de socio está en pausa. Los nuevos clientes no se le están acreditando. Comuníquese con DSP Connect para más detalles.")}</p>}
        </div>

        <section className="card stack g16" aria-labelledby="prog">
          <h2 id="prog" className="h3">{t("Your progress", "Su progreso")}</h2>
          <ol className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", listStyle: "none", padding: 0, margin: 0 }}>
            {steps.map((s, i) => (
              <li key={s.t} className="stack g8" style={{ padding: 14, borderRadius: 8, background: s.done ? "#E8F3EC" : "var(--ground, #F5F6F8)" }}>
                <span className="num">{s.done ? "✓" : `0${i + 1}`}</span><span style={{ fontWeight: 600 }}>{s.t}</span>
              </li>
            ))}
          </ol>
        </section>

        {!signed ? (
          <section className="stack g24" aria-labelledby="docs">
            <div className="stack g8">
              <h2 id="docs" className="h2">{t("Step 1: your Sales Partner Agreement", "Paso 1: su Acuerdo de Socio de Ventas")}</h2>
              <p className="lead">{t("Read each document, accept it, and sign, as yourself or for your company. You will get a signed copy by email.", "Lea cada documento, acéptelo y firme, a su nombre o en nombre de su empresa. Recibirá una copia firmada por correo electrónico.")}</p>
            </div>
            {docsFor(lang).map((d) => (
              <details key={d.id} className="card stack g12" open={d.id === "agreement"}>
                <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 18 }}>{d.tag}: {d.title}</summary>
                <div className="stack g12" style={{ marginTop: 12, maxHeight: 520, overflowY: "auto", paddingRight: 8 }}>
                  {d.sections.map((s, i) => (
                    <div key={i} className="stack g8">
                      {s.h && <h3 className="h3" style={{ fontSize: 16 }}>{s.h}</h3>}
                      {s.p.map((t, j) => <p key={j} className="p" style={{ fontSize: 15 }}>{t}</p>)}
                    </div>
                  ))}
                </div>
              </details>
            ))}
            <div className="card stack g16">
              <SignDocs docs={docsFor(lang).map((d) => ({ id: d.id, label: `${d.tag} (${d.title})` }))} defaultName={p.name} entity={p.entity_type || "individual"} company={p.company_name || ""} />
              <p className="small">{t("Document version", "Versión del documento")} {VERSION}. {LEGAL_ENTITY}.</p>
            </div>
          </section>
        ) : (
          <>
            <section className="grid cols-4" aria-label={t("Your numbers", "Sus cifras")}>
              <div className="card stack g8"><span className="small">{t("Clients", "Clientes")}</span><span className="h2">{clients.filter((c) => c.paid_at).length}</span><span className="small">{live} {t("live", "activos")}</span></div>
              <div className="card stack g8"><span className="small">{t("Client spend, last 7 days", "Gasto de clientes, últimos 7 días")}</span><span className="h2">{usd(week)}</span></div>
              <div className="card stack g8"><span className="small">{t("Commission on hold", "Comisión retenida")}</span><span className="h2">{usd(e.holding)}</span><span className="small">{e.next_release ? `${t("Next release", "Próxima liberación")} ${d(e.next_release)}` : t("7-day hold", "Retención de 7 días")}</span></div>
              <div className="card stack g8"><span className="small">{t("Paid to you", "Pagado a usted")}</span><span className="h2">{usd(e.paid)}</span><span className="small">{Number(e.ready) > 0 ? `${usd(e.ready)} ${t("ready to pay", "listo para pagar")}` : t("Paid daily through Stripe", "Pagado a diario por Stripe")}</span></div>
            </section>

            {!p.payouts_ready && (
              <section className="card stack g12" aria-labelledby="pay">
                <h2 id="pay" className="h3">{t("Verify with Stripe to get approved", "Verifíquese con Stripe para ser aprobado")}</h2>
                <p className="p">{t("This is your last step to approval: once Stripe verifies you, you are approved automatically and your client links start crediting you. Commission is paid daily to your bank through Stripe, after a 7-day hold. You give your bank and tax details to Stripe directly; DSP Connect never sees them.", "Este es su último paso para la aprobación: en cuanto Stripe lo verifique, queda aprobado automáticamente y sus enlaces de clientes empiezan a acreditarle. La comisión se paga a diario a su banco a través de Stripe, después de una retención de 7 días. Usted da sus datos bancarios y fiscales directamente a Stripe; DSP Connect nunca los ve.")}</p>
                <ConnectButton token={p.invite_token} label={p.stripe_started ? t("Finish payout setup", "Terminar la configuración de pagos") : t("Set up payouts with Stripe", "Configurar pagos con Stripe")} />
                {p.stripe_started && <p className="small">{t("If Stripe is still reviewing your details this can take a day. Use the button if Stripe asks for anything more.", "Si Stripe todavía está revisando sus datos, puede tardar un día. Use el botón si Stripe le pide algo más.")}</p>}
              </section>
            )}

            <section className="card stack g16" aria-labelledby="team">
              <div className="stack g8">
                <h2 id="team" className="h3">{t("Your team", "Su equipo")}</h2>
                <p className="p">{t("Add the reps who sell for you. Each one gets their own sign-in and their own links, so you can see which rep brought each client. Every client is credited to you and your commission is paid to you as usual; reps are not paid by DSP Connect. Reps only see their own clients, never yours or each other’s.", "Agregue a los representantes que venden para usted. Cada uno tiene su propio inicio de sesión y sus propios enlaces, así puede ver qué representante trajo a cada cliente. Cada cliente se le acredita a usted y su comisión se le paga a usted como siempre; DSP Connect no les paga a los representantes. Los representantes solo ven sus propios clientes, nunca los suyos ni los de otros representantes.")}</p>
              </div>
              {team.length > 0 && (
                <div className="tablebox"><table>
                  <thead><tr><th scope="col">{t("Rep", "Representante")}</th><th scope="col">{t("Code", "Código")}</th><th scope="col">{t("Training", "Capacitación")}</th><th scope="col">{t("Clients", "Clientes")}</th><th scope="col">{t("Spend, 7 days", "Gasto, 7 días")}</th><th scope="col">{t("Spend, total", "Gasto, total")}</th><th scope="col">{t("Commission", "Comisión")}</th><th scope="col" aria-label={t("Actions", "Acciones")}></th></tr></thead>
                  <tbody>{team.map((m) => (
                    <tr key={m.id} style={m.status === "removed" ? { opacity: 0.6 } : undefined}>
                      <th scope="row"><div>{m.name}</div><div className="small">{m.email}{m.status === "removed" ? t(" · removed", " · eliminado") : ""}</div></th>
                      <td className="mono">{m.code}</td>
                      <td>{m.training_done >= LESSONS.length ? t("Done", "Completa") : `${m.training_done} ${t("of", "de")} ${LESSONS.length}`}</td>
                      <td>{m.clients}</td>
                      <td className="mono">{usd(m.spent_7d)}</td>
                      <td className="mono">{usd(m.spent_total)}</td>
                      <td className="mono">{usd(m.earned)}</td>
                      <td>{m.status === "active" ? <RemoveRep id={m.id} name={m.name} /> : null}</td>
                    </tr>
                  ))}</tbody>
                </table></div>
              )}
              <details className="card stack g12" style={{ background: "var(--ground)" }} open={team.length === 0}>
                <summary style={{ cursor: "pointer", fontWeight: 600 }}>{t("Watch: build your sales team", "Vea: arme su equipo de ventas")} <span className="small" style={{ fontWeight: 400 }}>· 1 min 37 s</span></summary>
                <VideoEmbed id={VIDEOS.teamOwners.id} title={VIDEOS.teamOwners.title} poster={VIDEOS.teamOwners.poster} />
              </details>
              <TeamInvite />
              <p className="small">{t("You are responsible for your reps following the Operating Rules. Removing a rep stops their sign-in and their links; clients they already brought stay credited to you.", "Usted es responsable de que sus representantes sigan las Reglas de Operación. Al eliminar a un representante se desactivan su inicio de sesión y sus enlaces; los clientes que ya trajo siguen acreditados a usted.")}</p>
            </section>

            <Selling code={p.code} me={p.name} company={p.company_name} credited={p.status !== "invited"} clients={clients} training={training} trained={trained} today={today} lang={lang} />

            <section className="stack g16" aria-labelledby="po">
              <h2 id="po" className="h3">{t("Payments to you", "Pagos a usted")}</h2>
              {payouts.length === 0 ? <p className="p">{t("No payments yet. Commission on each day’s qualified spend is paid 7 days later.", "Aún no hay pagos. La comisión sobre el gasto calificado de cada día se paga 7 días después.")}</p> : (
                <div className="tablebox"><table style={{ minWidth: 360 }}>
                  <thead><tr><th scope="col">{t("Date", "Fecha")}</th><th scope="col">{t("Amount", "Monto")}</th></tr></thead>
                  <tbody>{payouts.map((x, i) => <tr key={i}><th scope="row">{d(x.created_at)}</th><td className="mono">{usd(x.amount)}</td></tr>)}</tbody>
                </table></div>
              )}
              {Number(e.reversed) > 0 && <p className="small">{t("Reversed commission (refunds or chargebacks)", "Comisión revertida (reembolsos o contracargos)")}: {usd(e.reversed)}.{Number(e.owed) > 0 ? ` ${usd(e.owed)} ${t("of it was already paid and will be deducted from your next payment.", "ya se había pagado y se descontará de su próximo pago.")}` : ""}</p>}
            </section>

            <section className="card stack g8">
              <h2 className="h3">{t("Help", "Ayuda")}</h2>
              <p className="p">{t("Use the chat button at the bottom of this page. Fin can help you prepare advice for a client, and anything about payouts, commission or your clients goes to our Sales Partner Support team.", "Use el botón de chat al final de esta página. Fin puede ayudarle a preparar recomendaciones para un cliente, y todo lo relacionado con pagos, comisiones o sus clientes pasa a nuestro equipo de Soporte para Socios de Ventas. Puede escribir en español.")}</p>
              {lang === "es"
                ? <p className="small">Firmó su Acuerdo de Socio de Ventas el {d(p.signed_at)} como {p.legal_name}{p.entity_type === "company" && p.company_name ? `, ${p.signer_title || "firmante autorizado"} de ${p.company_name}` : ""}. Gana el {PARTNER_PCT}% del gasto publicitario calificado, con comisiones recurrentes mientras sus clientes sigan invirtiendo. ¿Necesita otra copia? Pídala en el chat.</p>
                : <p className="small">You signed your Sales Partner Agreement on {d(p.signed_at)} as {p.legal_name}{p.entity_type === "company" && p.company_name ? `, ${p.signer_title || "authorized signer"} of ${p.company_name}` : ""}. You earn {PARTNER_PCT}% of qualified ad spend, with residuals for as long as your clients spend. Need another copy? Ask in the chat.</p>}
            </section>
          </>
        )}
      </main>
    </>
  );
}

/** The client links, planner, sales kit, client list and training: the same for a partner and for each rep, with their own code. */
function Selling({ code, me, company, credited, clients, training, trained, today, rep, lang }: {
  code: string; me: string; company: string | null; credited: boolean; clients: Client[]; training: string[]; trained: boolean; today: string; rep?: string; lang: Lang;
}) {
  const t = tr(lang);
  const origin = siteOrigin();
  const L = (p: string) => origin + localePath(p, lang);
  const emails = emailsFor(lang), script = callScriptFor(lang), objections = objectionsFor(lang), lessons = lessonsFor(lang);
  const showRep = !rep && clients.some((c) => c.member_name);
  return (
    <>
      <section className="card stack g16" aria-labelledby="links">
        <h2 id="links" className="h3">{t("Your client links", "Sus enlaces para clientes")}</h2>
        {lang === "es"
          ? <p className="p">{rep
            ? <>Los dueños de negocio que abran su cuenta con estos enlaces se acreditan a {rep} y aparecen bajo su nombre. Su código es <b>{code}</b>.</>
            : <>Los clientes que abran su cuenta con estos enlaces se le acreditan a usted{credited ? "" : " en cuanto sea aprobado (verificado por Stripe)"}. Su código de socio es <b>{code}</b>.</>} Estos enlaces abren el sitio en español; los enlaces en inglés funcionan igual quitando <span className="mono">/es</span>.</p>
          : <p className="p">{rep
            ? <>Business owners who open their account through these links are credited to {rep} and show up under your name. Your code is <b>{code}</b>.</>
            : <>Clients who open their account through these links are credited to you{credited ? "" : " once you are approved (Stripe verified)"}. Your partner code is <b>{code}</b>.</>}</p>}
        <CopyLink label={t("Open an account", "Abrir una cuenta")} url={`${L("/open-account")}?p=${code}`} />
        <CopyLink label={t("Free ad plan from their website", "Plan de anuncios gratis desde su sitio web")} url={`${L("/planner")}?p=${code}`} />
        <CopyLink label={t("Show the demo", "Mostrar la demostración")} url={`${L("/demo")}?p=${code}`} />
        <CopyLink label={t("Home page", "Página de inicio")} url={`${L("/")}?p=${code}`} />
        {!trained && <p className="note" style={{ background: "#FFF6E5", color: "#7A4B00" }}>{t("Please finish the training below before you introduce clients.", "Termine la capacitación de abajo antes de presentar clientes.")}</p>}
      </section>

      <section className="card stack g16" aria-labelledby="planner-h">
        <h2 id="planner-h" className="h3">{t("Your sales tool: the free ad planner", "Su herramienta de ventas: el planificador de anuncios gratis")}</h2>
        <p className="p">{lang === "es"
          ? `Escriba el sitio web de un dueño de negocio y entréguele un plan de anuncios en TV por streaming y publicidad programática para su negocio en unos 30 segundos. Use su enlace del planificador de arriba: los planes y registros que vengan de él se acreditan ${rep ? `a ${rep} bajo su nombre` : "a usted"}, aunque el dueño termine más tarde en su propio dispositivo.`
          : `Type in a business owner’s website and hand them a streaming TV and programmatic ad plan for their business in about 30 seconds. Use your planner link above: plans and sign-ups from it are credited ${rep ? `to ${rep} under your name` : "to you"}, even if the owner finishes later on their own device.`}</p>
        <VideoEmbed id={forLang(VIDEOS.plannerPartners, lang).id} title={forLang(VIDEOS.plannerPartners, lang).title} poster={forLang(VIDEOS.plannerPartners, lang).poster} />
        <p className="small">{t("Never promise results or quote what an ad will produce. The plan doesn’t, and neither should you.", "Nunca prometa resultados ni diga lo que producirá un anuncio. El plan no lo hace, y usted tampoco debe hacerlo.")}</p>
      </section>

      <section className="stack g16" aria-labelledby="kit">
        <div className="stack g8">
          <h2 id="kit" className="h3">{t("Your sales kit", "Su kit de ventas")}</h2>
          <p className="p">{t("Everything here already has your links in it. Replace the words in [brackets] before you send.", "Todo aquí ya incluye sus enlaces. Reemplace las palabras entre [corchetes] antes de enviar.")}</p>
        </div>
        <div className="card stack g12" style={{ background: "var(--ground)" }}>
          <h3 className="h3" style={{ fontSize: 16 }}>{t("Leave-behind", "Hoja informativa")}</h3>
          <p className="p" style={{ fontSize: 15 }}>{t("A one-page sheet for business owners with your name, your demo link and a QR code. Print it or save it as a PDF to attach to emails.", "Una hoja de una página para dueños de negocio con su nombre, su enlace a la demostración y un código QR. Imprímala o guárdela como PDF para adjuntarla a sus correos.")}</p>
          <a className="btn btn-blue" href={localePath("/partner/leave-behind", lang)} target="_blank" rel="noopener" style={{ alignSelf: "flex-start" }}>{t("Open your leave-behind", "Abrir su hoja informativa")}</a>
        </div>
        <h3 className="h3" style={{ fontSize: 16 }}>{t("Emails to prospects", "Correos para prospectos")}</h3>
        {emails.map((m) => {
          const v = lang === "es"
            ? { first: "[nombre]", business: "[nombre del negocio]", me, company: company || "Socio de Ventas Autorizado, DSP Connect", demo: `${L("/demo")}?p=${code}`, open: `${L("/open-account")}?p=${code}` }
            : { first: "[first name]", business: "[business name]", me, company: company || "Authorized Sales Partner, DSP Connect", demo: `${L("/demo")}?p=${code}`, open: `${L("/open-account")}?p=${code}` };
          return <CopyTemplate key={m.id} title={m.title} when={m.when} subject={fill(m.subject, v)} body={fill(m.body, v)} />;
        })}
        <details className="card stack g8">
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>{t("First-call script", "Guion para la primera llamada")} <span className="small" style={{ fontWeight: 400 }}>· {t("about 20 minutes", "unos 20 minutos")}</span></summary>
          <ol className="stack g12" style={{ marginTop: 8 }}>{script.map((c) => (
            <li key={c.step} className="stack g4"><b>{c.step}</b><ul className="list">{c.say.map((x) => <li key={x}>{x}</li>)}</ul></li>
          ))}</ol>
        </details>
        <details className="card stack g8">
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>{t("Answers to common questions", "Respuestas a preguntas comunes")}</summary>
          <div className="stack g12" style={{ marginTop: 8 }}>{objections.map((o) => (
            <div key={o.q} className="stack g4"><b>&ldquo;{o.q}&rdquo;</b><p className="p" style={{ fontSize: 15 }}>{o.a}</p></div>
          ))}</div>
        </details>
      </section>

      <section className="stack g16" aria-labelledby="cl">
        <h2 id="cl" className="h3">{t("Your clients", "Sus clientes")}</h2>
        {clients.length === 0 ? (
          <p className="p">{t("No clients yet. When someone opens an account through your links, they appear here with their setup progress and spend.", "Aún no tiene clientes. Cuando alguien abra una cuenta con sus enlaces, aparecerá aquí con el avance de su configuración y su gasto.")}</p>
        ) : (
          <div className="tablebox"><table>
            <thead><tr><th scope="col">{t("Client", "Cliente")}</th>{showRep && <th scope="col">{t("Brought by", "Traído por")}</th>}<th scope="col">{t("Status", "Estado")}</th><th scope="col">{t("Budget paid", "Presupuesto pagado")}</th><th scope="col">{t("Spend, 7 days", "Gasto, 7 días")}</th><th scope="col">{t("Spend, total", "Gasto, total")}</th>{!rep && <th scope="col">{t("Your commission", "Su comisión")}</th>}</tr></thead>
            <tbody>{clients.map((c) => {
              const st = clientStatus(c, today, lang);
              return (
                <tr key={c.id}>
                  <th scope="row"><div>{c.business || c.name || c.email}</div><div className="small">{[c.industry ? industryName(c.industry, lang) : "", c.market].filter(Boolean).join(" · ")}</div></th>
                  {showRep && <td>{c.member_name || t("You", "Usted")}</td>}
                  <td style={{ color: st.tone }}>{st.text}</td>
                  <td className="mono">{c.amount_paid ? usd(c.amount_paid) : "—"}</td>
                  <td className="mono">{usd(c.spent_7d)}</td>
                  <td className="mono">{usd(c.spent_total)}</td>
                  {!rep && <td className="mono">{usd(c.earned)}</td>}
                </tr>
              );
            })}</tbody>
          </table></div>
        )}
        <p className="small">{lang === "es"
          ? `La configuración toma ${SETUP_DAYS} días desde el pago. El retraso más común es el resumen de campaña del cliente; ayúdelo a enviarlo pronto. Para facturación, reembolsos o acceso, envíe a los clientes a ${SUPPORT_EMAIL}.`
          : `Setup takes ${SETUP_DAYS} days from payment. The most common delay is the client’s campaign brief; help them send it early. For billing, refunds or access, send clients to ${SUPPORT_EMAIL}.`}</p>
      </section>

      <section className="stack g16" aria-labelledby="tr">
        <div className="stack g8">
          <h2 id="tr" className="h3">{t("Training", "Capacitación")} {trained ? t("(complete)", "(completa)") : `(${LESSONS.filter((l) => training.includes(l.id)).length} ${t("of", "de")} ${LESSONS.length} ${t("done", "terminadas")})`}</h2>
          <p className="p">{t("Fourteen short video lessons, about 25 minutes in all: the program, the product, selling, after the sale and the rules. Watch them in order and tick each checklist only when it is true.", "Catorce lecciones cortas en video, unos 25 minutos en total: el programa, el producto, cómo vender, después de la venta y las reglas. Véalas en orden y marque cada lista solo cuando sea cierto.")}</p>
        </div>
        {lessons.map((l, i) => {
          const done = training.includes(l.id);
          return (
            <details key={l.id} className="card stack g12" open={!trained && !done && lessons.slice(0, i).every((x) => training.includes(x.id))}>
              <summary style={{ cursor: "pointer", fontWeight: 600 }}>{done ? "✓ " : `${i + 1}. `}{l.title} <span className="small" style={{ fontWeight: 400 }}>· {l.minutes} min</span></summary>
              <VideoEmbed id={l.video} title={`${t("Lesson", "Lección")} ${i + 1}: ${l.title}`} />
              <ul className="list" style={{ marginTop: 12 }}>{l.points.map((t, j) => <li key={j}>{t}</li>)}</ul>
              <LessonDone id={l.id} check={l.check} done={done} />
            </details>
          );
        })}
      </section>
    </>
  );
}

/** A rep on a Sales Partner's team: their own links, their own clients and the training. No earnings, agreement or payouts. */
function RepDashboard({ portal, lang }: { portal: MemberPortal; lang: Lang }) {
  const t = tr(lang);
  const { member: m, company, clients, training, today } = portal;
  const trained = LESSONS.every((l) => training.includes(l.id));
  const live = clients.filter((c) => c.live_at).length;
  const week = clients.reduce((s, c) => s + Number(c.spent_7d || 0), 0);
  return (
    <>
      <Top name={m.name} lang={lang} />
      <IdentifyClient email={m.email} name={m.name} jwt={messengerJwt(m.email, m.name)} />
      <main className="wrap stack g32" style={{ padding: "48px 32px 96px", maxWidth: 1040 }}>
        <div className="stack g8">
          <div className="eyebrow">{company.name} · {t("Authorized Sales Partner team", "Equipo de Socio de Ventas Autorizado")}</div>
          <h1 className="h1" style={{ fontSize: "clamp(30px,4vw,42px)" }}>{t("Welcome", "Bienvenido")}, {m.name.split(" ")[0]}.</h1>
          <p className="lead">{lang === "es"
            ? `Usted vende para ${company.name}, Socio de Ventas Autorizado de DSP Connect. Los clientes que traiga con sus enlaces se acreditan a ${company.name} y aparecen bajo su nombre. La comisión se le paga a ${company.name}; su pago lo acuerda usted con ${company.owner}.`
            : `You sell for ${company.name}, an Authorized Sales Partner of DSP Connect. Clients you bring through your links are credited to ${company.name} and show up under your name. Commission is paid to ${company.name}; your pay is between you and ${company.owner}.`}</p>
          <VideoEmbed id={forLang(VIDEOS.teamReps, lang).id} title={forLang(VIDEOS.teamReps, lang).title} poster={forLang(VIDEOS.teamReps, lang).poster} />
          {!company.credited && <p className="note" style={{ background: "#FFF6E5", color: "#7A4B00" }}>{lang === "es" ? `${company.name} todavía está terminando su aprobación con DSP Connect. Sus enlaces empezarán a acreditar clientes en cuanto termine.` : `${company.name} is still finishing its approval with DSP Connect. Your links start crediting clients as soon as that is done.`}</p>}
        </div>
        <section className="grid cols-3" aria-label={t("Your numbers", "Sus cifras")}>
          <div className="card stack g8"><span className="small">{t("Your clients", "Sus clientes")}</span><span className="h2">{clients.filter((c) => c.paid_at).length}</span><span className="small">{live} {t("live", "activos")}</span></div>
          <div className="card stack g8"><span className="small">{t("Client spend, last 7 days", "Gasto de clientes, últimos 7 días")}</span><span className="h2">{usd(week)}</span></div>
          <div className="card stack g8"><span className="small">{t("Training", "Capacitación")}</span><span className="h2">{LESSONS.filter((l) => training.includes(l.id)).length} {t("of", "de")} {LESSONS.length}</span><span className="small">{trained ? t("Complete", "Completa") : t("Finish before you introduce clients", "Termínela antes de presentar clientes")}</span></div>
        </section>
        <Selling code={m.code} me={m.name} company={company.name} credited={company.credited} clients={clients} training={training} trained={trained} today={today} rep={company.name} lang={lang} />
        <section className="card stack g8">
          <h2 className="h3">{t("Help", "Ayuda")}</h2>
          <p className="p">{lang === "es" ? `Use el botón de chat al final de esta página para recibir ayuda con el planificador, la demostración o un cliente. Puede escribir en español. Para su pago, hable con ${company.owner}.` : `Use the chat button at the bottom of this page for help with the planner, the demo or a client. For your pay, talk to ${company.owner}.`}</p>
        </section>
      </main>
    </>
  );
}
