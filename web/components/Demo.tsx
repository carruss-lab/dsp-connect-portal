"use client";
import Image from "next/image";
import Link from "@/components/Link";
import { useEffect, useMemo, useState } from "react";
import LeadForm from "./LeadForm";
import PlanView from "./PlanView";
import PlannerForm, { PlanProgress } from "./PlannerForm";
import { builderPreset, type BuilderPreset, type SavedPlan } from "@/lib/plan";
import { accountHref, askAboutPlan, loadPlan, requestPlan, storedPlan, type PlanRequest } from "@/lib/planClient";
import { readProfile } from "@/lib/profile";
import { useLang } from "@/lib/useLang";
import { industryName, tr } from "@/lib/i18n";
import { PARTNERSTACK_AGENCY_URL, SHARE_PCT } from "@/lib/site";
import Builder from "./demo/Builder";
import Chart from "./demo/Chart";
import { DATE_PRESETS, GROUP_BY, type Dim, type Row, account, dmy, n, pct, usd } from "./demo/data";
// Open Sans and Material Icons, as the platform uses, served from this site.
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/700.css";
import "material-icons/iconfont/filled.css";
import "./demo/demo.css";

/* The demo account follows the client platform screen for screen: the same sidebar, top bar, sections, labels,
   columns and campaign builder. Every figure is sample data, labeled as such on every screen. */

type Sec =
  | "Your ad plan" | "Clients" | "Explore" | "Dashboard" | "Campaigns" | "Create new campaign" | "Audience" | "Conversion Tracking" | "Analytics"
  | "Traffic Funnel" | "Creative Assets" | "Allowlist / Blocklist" | "Segments" | "IFA Lists" | "User IDs" | "Custom Locations"
  | "Billing" | "Media plannings" | "Demand Analytics" | "Bidding Rules" | "Autopilot Log" | "Bid Modifiers" | "Tag Manager";

type NavItem = { label: string; icon: string; sec?: Sec; hot?: boolean; children?: { sec: Sec; icon: string }[] };
const NAV: NavItem[] = [
  { label: "Your ad plan", icon: "auto_awesome", sec: "Your ad plan", hot: true },
  { label: "Explore", icon: "rocket_launch", sec: "Explore" },
  { label: "Dashboard", icon: "dashboard", sec: "Dashboard" },
  { label: "Campaigns", icon: "campaign", sec: "Campaigns" },
  { label: "Audience", icon: "groups", sec: "Audience" },
  { label: "Conversion Tracking", icon: "link", sec: "Conversion Tracking" },
  { label: "Analytics", icon: "assessment", children: [{ sec: "Analytics", icon: "assessment" }, { sec: "Traffic Funnel", icon: "leaderboard" }] },
  { label: "Creative Assets", icon: "image", sec: "Creative Assets" },
  { label: "Allowlist / Blocklist", icon: "filter_alt", sec: "Allowlist / Blocklist" },
  { label: "Retargeting", icon: "sync", children: [{ sec: "Segments", icon: "segment" }, { sec: "IFA Lists", icon: "adjust" }, { sec: "User IDs", icon: "person_pin_circle" }] },
  { label: "Custom Locations", icon: "location_on", sec: "Custom Locations" },
  { label: "Billing", icon: "credit_card", sec: "Billing" },
  { label: "Planning", icon: "calendar_month", children: [{ sec: "Media plannings", icon: "bar_chart" }, { sec: "Demand Analytics", icon: "data_usage" }] },
  { label: "Autopilot", icon: "play_circle", children: [{ sec: "Bidding Rules", icon: "device_hub" }, { sec: "Autopilot Log", icon: "published_with_changes" }, { sec: "Bid Modifiers", icon: "price_change" }, { sec: "Tag Manager", icon: "sell" }] },
];
const PARENT: Partial<Record<Sec, string>> = { "Create new campaign": "Campaigns" };

type Col = { key: string; label: string; get: (r: Row) => string; video?: boolean };
const COLS: Col[] = [
  { key: "imp", label: "Impressions", get: (r) => n(r.imp) },
  { key: "clicks", label: "Clicks", get: (r) => n(r.clicks) },
  { key: "ctr", label: "CTR", get: (r) => pct(r.clicks / r.imp) },
  { key: "conv", label: "Conversions", get: (r) => n(r.conv) },
  { key: "spend", label: "Spend", get: (r) => usd(r.spend) },
  { key: "ecpm", label: "eCPM", get: (r) => usd(r.imp ? (r.spend / r.imp) * 1000 : 0) },
  { key: "ecpc", label: "eCPC", get: (r) => usd(r.clicks ? r.spend / r.clicks : 0) },
  { key: "bids", label: "Bid Responses", get: (r) => n(r.bids) },
  { key: "win", label: "Win Rate", get: (r) => pct(r.bids ? r.wins / r.bids : 0) },
  { key: "cpa", label: "CPA Action 0", get: (r) => usd(r.conv ? r.spend / r.conv : 0) },
  { key: "q1", label: "First Quartile", get: (r) => n(r.q1), video: true },
  { key: "q2", label: "Midpoint", get: (r) => n(r.q2), video: true },
  { key: "q3", label: "Third Quartile", get: (r) => n(r.q3), video: true },
  { key: "q4", label: "Video 100%", get: (r) => n(r.q4), video: true },
];
const DEFAULT_COLS = ["imp", "clicks", "ctr", "conv", "spend", "ecpm", "ecpc", "win", "q4"];

const TOUR: [Sec, string, string][] = [
  ["Dashboard", "Your results", "Spend, impressions, clicks and conversions for every campaign, by day."],
  ["Analytics", "Where your ads ran", "Group results by SSP, app, site, device, country and more, with video completion for video ads."],
  ["Create new campaign", "How a campaign is built", "Goal, ad format, audience, price, budget and the SSP endpoints that send it traffic."],
  ["Billing", "What it cost", "Every deposit and what has been spent, with your balance."],
];
// The tour in Spanish. The platform's own screens keep their English names, as in the real account.
const TOUR_ES: [string, string][] = [
  ["Sus resultados (Dashboard)", "Gasto, impresiones, clics y conversiones de cada campaña, por día."],
  ["Dónde se mostraron sus anuncios (Analytics)", "Agrupe los resultados por SSP, app, sitio, dispositivo, país y más, con la reproducción completa de los anuncios en video."],
  ["Cómo se crea una campaña (Create new campaign)", "Objetivo, formato de anuncio, audiencia, precio, presupuesto y los endpoints de SSP que le envían tráfico."],
  ["Lo que costó (Billing)", "Cada depósito y lo que se ha gastado, con su saldo."],
];

function Mi({ i, s, label }: { i: string; s?: 16 | 18 | 24; label?: string }) {
  return <span className={`mi${s ? ` s${s}` : ""}`} aria-hidden={label ? undefined : true} aria-label={label} role={label ? "img" : undefined}>{i}</span>;
}
function Table({ head, rows, foot, num = [] }: { head: string[]; rows: React.ReactNode[][]; foot?: React.ReactNode[]; num?: number[] }) {
  return (
    <div className="dm-table">
      <table>
        <thead><tr>{head.map((h, i) => <th key={h + i} scope="col" className={num.includes(i) ? "dm-n" : undefined}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j} className={num.includes(j) ? "dm-n" : undefined}>{c}</td>))}</tr>
          )) : <tr><td colSpan={head.length} className="dm-muted">No available data to show.</td></tr>}
        </tbody>
        {foot && <tfoot><tr>{foot.map((c, j) => <td key={j} className={num.includes(j) ? "dm-n" : undefined}>{c}</td>)}</tr></tfoot>}
      </table>
    </div>
  );
}
const Status = ({ on, children }: { on: boolean; children?: React.ReactNode }) => <span><span className={`dm-dot${on ? "" : " off"}`} />{children ?? (on ? "Active" : "Inactive")}</span>;

export default function Demo({ industry, market, agency = false }: { industry: string; market: string; agency?: boolean }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [sec, setSec] = useState<Sec>(agency ? "Clients" : "Explore");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [mini, setMini] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [menu, setMenu] = useState<"" | "lang" | "user" | "date" | "group" | "cols">("");
  const [tour, setTour] = useState<number | null>(-1);
  const [preset, setPreset] = useState<string>("Last 7 days");
  const [group, setGroup] = useState<Dim>("Date");
  const [cols, setCols] = useState<string[]>(DEFAULT_COLS);
  const [metric, setMetric] = useState<"imp" | "clicks" | "conv" | "spend">("imp");
  const [chart, setChart] = useState(true);
  const [folder, setFolder] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState("Active, Inactive");
  const [search, setSearch] = useState("");
  const [assetTab, setAssetTab] = useState<"Images" | "Videos" | "HTML5">("Images");
  const [ctTab, setCtTab] = useState<"S2S" | "Client">("S2S");
  const [funnelCamp, setFunnelCamp] = useState("");
  const [planGroup, setPlanGroup] = useState("SSP Endpoint");
  const [tz, setTz] = useState("UTC+00:00");
  // The visitor's own ad plan, written from their website: the first thing in the menu, highlighted everywhere.
  const [plan, setPlan] = useState<SavedPlan | null>(null);
  const [planBusy, setPlanBusy] = useState(false);
  const [planErr, setPlanErr] = useState("");
  const [planPreset, setPlanPreset] = useState<BuilderPreset | null>(null);
  const [known, setKnown] = useState<{ email?: string; industry?: string; market?: string }>({});
  const lang = useLang(); const t = tr(lang); const es = lang === "es";
  const tourText = (i: number) => (es ? TOUR_ES[i] : [TOUR[i][1], TOUR[i][2]]);

  useEffect(() => {
    let ok = false;
    try { ok = sessionStorage.getItem("demo_ok") === "1"; } catch {}
    // The agency demo is sample clients only, so it opens straight away (agencies ask about the program on /agencies).
    if (agency) ok = true;
    setAllowed(ok);
    if (ok && !agency) {
      const prof = readProfile();
      setKnown({ email: prof.email, industry: industry === "Local" ? undefined : industry, market: market === "your area" ? undefined : market });
      const id = new URLSearchParams(location.search).get("plan");
      let req: PlanRequest | null = null;
      try { req = JSON.parse(sessionStorage.getItem("plan_req") || "null"); sessionStorage.removeItem("plan_req"); } catch {}
      const mine = storedPlan();
      if (id) { setSec("Your ad plan"); loadPlan(id).then((p) => p && setPlan(p)); }
      else if (req?.website && req.email) {
        // They gave their website at the demo sign-in: write the plan while they look around.
        setSec("Your ad plan"); setPlanBusy(true);
        requestPlan(req).then(setPlan).catch((e) => setPlanErr(e instanceof Error ? e.message : t("We could not make your plan.", "No pudimos crear su plan."))).finally(() => setPlanBusy(false));
      } else if (mine) { setPlan(mine); }
    }
    if (window.innerWidth < 760) setMini(true); // on phones the menu opens from the button
    const off = -new Date().getTimezoneOffset();
    setTz(`UTC${off >= 0 ? "+" : "-"}${String(Math.floor(Math.abs(off) / 60)).padStart(2, "0")}:${String(Math.abs(off) % 60).padStart(2, "0")}`);
  }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 6000); return () => clearTimeout(t); }, [toast]);

  const acc = useMemo(() => account(industry, market), [industry, market]);
  const [a, b] = acc.presetRange(preset);
  const range = a <= b ? `${dmy(acc.dates[a])} - ${dmy(acc.dates[b])}` : `${dmy(new Date())} - ${dmy(new Date())}`;
  const sum = a <= b ? acc.totals(a, b) : null;
  const prevSum = a <= b && a - (b - a + 1) >= 0 ? acc.totals(a - (b - a + 1), a - 1) : null;
  // Never show a visitor's own name in the demo: it is always the sample user.
  const name = agency ? "Demo Agency" : "Demo User";

  if (allowed === null) return null;
  if (!allowed) {
    return (
      <main className="wrap" style={{ padding: "72px 32px", maxWidth: 560 }}>
        <div className="card stack g16" style={{ background: "var(--ground)" }}>
          <h1 className="h2" style={{ fontSize: 26 }}>{t("See the demo", "Vea la demostración")}</h1>
          <p className="p">{t("Tell us your industry and area and we will open a sample account set up for a business like yours.", "Díganos su industria y su zona y le abriremos una cuenta de ejemplo configurada para un negocio como el suyo.")}</p>
          <LeadForm kind="market_check" cta={t("Open the demo", "Abrir la demostración")} />
        </div>
      </main>
    );
  }

  const locked = (what = "This") => setToast(es ? `“${what}” no está disponible en la cuenta de demostración, así que no se guarda nada.` : `${what} is not available in the demo account, so nothing is saved.`);
  const go = (s: Sec) => { setSec(s); setMenu(""); setSearch(""); if (window.innerWidth < 760) setMini(true); window.scrollTo({ top: 0 }); };
  const stop = (i: number) => { setTour(i); go(TOUR[i][0]); if (TOUR[i][0] === "Analytics") { setOpen((o) => ({ ...o, Analytics: true })); setGroup("SSP Endpoint"); } };
  const parentOf = (s: Sec) => NAV.find((x) => x.children?.some((c) => c.sec === s))?.label;

  const Head = ({ title, help = true, children }: { title: string; help?: boolean; children?: React.ReactNode }) => (
    <div className="dm-head"><h1>{title}{help && <span className="dm-help"><Mi i="help_outline" s={18} /></span>}</h1>{children && <div className="dm-row">{children}</div>}</div>
  );
  const Add = ({ label, onClick }: { label: string; onClick?: () => void }) => (
    <button type="button" className="dm-btn dm-btn-dark" onClick={onClick ?? (() => locked(label))}><Mi i="add_circle_outline" s={18} />{label}</button>
  );
  const Search = ({ w = 280 }: { w?: number }) => (
    <div className="dm-field" style={{ width: w }}><input aria-label="Search" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} /><Mi i="search" /></div>
  );
  const DatePicker = () => (
    <div className="dm-rel">
      <button type="button" className="dm-date" aria-expanded={menu === "date"} onClick={() => setMenu(menu === "date" ? "" : "date")}>{range}<Mi i="event" /></button>
      {menu === "date" && (
        <div className="dm-pop" role="menu">{DATE_PRESETS.map((p) => <button key={p} type="button" role="menuitemradio" aria-checked={preset === p} onClick={() => { setPreset(p); setMenu(""); }}>{preset === p ? <Mi i="check" s={18} /> : <span style={{ width: 18 }} />}{p}</button>)}</div>
      )}
    </div>
  );
  const match = (s: string) => s.toLowerCase().includes(search.toLowerCase());

  const campaigns = acc.campaigns.map((c) => ({ ...c, r: a <= b ? acc.sumDays(c, a, b) : null }));
  const shownCampaigns = campaigns.filter((c) => (statusFilter === "Active, Inactive" || statusFilter.includes(c.status)) && match(c.name));
  const audiences: [string, number, Date, Date][] = [
    [`${acc.city} · Adults 25-64`, 2, acc.campaigns[0].created, acc.dates[acc.LEN - 20]],
    ["Website visitors · 30 days", 1, acc.campaigns[1].created, acc.dates[acc.LEN - 9]],
    [`${acc.short} intent · ${acc.city}`, 1, acc.campaigns[2].created, acc.dates[acc.LEN - 31]],
  ];
  const visibleCols = COLS.filter((c) => cols.includes(c.key));
  // Two deposits: the first covers the first month's spend with room to spare; the second tops the account up.
  const firstMonthSpend = acc.totals(0, acc.LEN - 31).spend;
  const deposits = [Math.ceil((firstMonthSpend + 450) / 250) * 250, 0];
  deposits[1] = acc.funded - deposits[0];

  return (
    <div className="dm">
      <aside className="dm-side" data-mini={mini || undefined}>
        <div className="dm-side-top">
          <div className="dm-brand"><Image src="/logo.png" alt="" width={28} height={28} /><span>DSP Connect</span></div>
          <button type="button" className="dm-iconbtn" aria-label={mini ? "Expand menu" : "Collapse menu"} aria-expanded={!mini} onClick={() => setMini(!mini)}><Mi i="start" /></button>
        </div>
        <nav className="dm-nav-wrap" aria-label="Platform sections">
          {agency && <button type="button" className="dm-nav" data-on={sec === "Clients" || undefined} aria-current={sec === "Clients" ? "page" : undefined} onClick={() => go("Clients")}><Mi i="apartment" /><span>Clients</span></button>}
          {NAV.map((item) => item.children ? (
            <div key={item.label}>
              <button type="button" className="dm-nav" aria-expanded={!!open[item.label]} data-on={item.children.some((c) => c.sec === sec) || undefined}
                onClick={() => { if (mini) setMini(false); setOpen((o) => ({ ...o, [item.label]: !o[item.label] })); }}>
                <Mi i={item.icon} /><span>{item.label}</span><span className="mi dm-caret" aria-hidden="true">arrow_right</span>
              </button>
              {open[item.label] && item.children.map((c) => (
                <button key={c.sec} type="button" className="dm-nav dm-sub" data-on={sec === c.sec || undefined} aria-current={sec === c.sec ? "page" : undefined} onClick={() => go(c.sec)}><Mi i={c.icon} /><span>{c.sec}</span></button>
              ))}
            </div>
          ) : (
            item.hot ? (agency ? null : (
              <button key={item.label} type="button" className="dm-nav dm-hot" data-on={sec === item.sec || undefined} aria-current={sec === item.sec ? "page" : undefined} onClick={() => go(item.sec!)}>
                <Mi i={item.icon} /><span>{item.label}</span>{!mini && <span className="dm-hot-badge">{planBusy ? "Writing" : plan ? "Ready" : "Free"}</span>}
              </button>
            )) :
            <button key={item.label} type="button" className="dm-nav" data-on={sec === item.sec || (item.sec === "Campaigns" && sec === "Create new campaign") || undefined} aria-current={sec === item.sec ? "page" : undefined} onClick={() => go(item.sec!)}><Mi i={item.icon} /><span>{item.label}</span></button>
          ))}
        </nav>
        <div className="dm-side-foot"><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms and Conditions</Link></div>
      </aside>

      <div className="dm-main">
        <header className="dm-top">
          <div className="dm-crumb">
            <button type="button" className="dm-iconbtn" style={{ width: 28, height: 28 }} aria-label="Dashboard" onClick={() => go("Dashboard")}><Mi i="home" s={18} /></button>
            <span>/</span>
            {PARENT[sec] && <><button type="button" className="dm-link" style={{ textDecoration: "none" }} onClick={() => go("Campaigns")}>{PARENT[sec]}</button><span>/</span></>}
            {!PARENT[sec] && parentOf(sec) && <><span>{parentOf(sec)}</span><span>/</span></>}
            <span>{sec}</span>
          </div>
          <div className="dm-top-r">
            <span className="dm-bal">Balance: <span>{usd(acc.balance)}</span></span>
            <span>{tz}</span>
            <div className="dm-rel">
              <button type="button" className="dm-menu-btn" aria-expanded={menu === "lang"} onClick={() => setMenu(menu === "lang" ? "" : "lang")}>EN<Mi i="arrow_drop_down" /></button>
              {menu === "lang" && <div className="dm-pop" role="menu">{["EN", "中文", "UA", "DE", "FR", "ES", "PT"].map((l) => <button key={l} type="button" role="menuitem" onClick={() => { setMenu(""); if (l !== "EN") locked("Changing the language"); }}>{l}</button>)}</div>}
            </div>
            <div className="dm-rel">
              <button type="button" className="dm-menu-btn" aria-expanded={menu === "user"} onClick={() => setMenu(menu === "user" ? "" : "user")}><Mi i="person" s={18} />{name}<Mi i="arrow_drop_down" /></button>
              {menu === "user" && (
                <div className="dm-pop" role="menu">
                  <button type="button" role="menuitem" onClick={() => locked("Edit profile")}>Edit profile</button>
                  <a role="menuitem" href="https://help.getdspconnect.com" target="_blank" rel="noopener">Help center</a>
                  <Link role="menuitem" href="/">Sign out</Link>
                </div>
              )}
            </div>
            {agency
              ? <a className="dm-cta" href={PARTNERSTACK_AGENCY_URL} target="_blank" rel="noopener noreferrer">{t("Join the agency program", "Únase al programa para agencias")}</a>
              : <Link className="dm-cta" href="/open-account">{t("Open your account", "Abra su cuenta")}</Link>}
          </div>
        </header>
        <div className="dm-note">{es
          ? (agency ? "Cuenta de agencia de demostración con clientes y datos de ejemplo. No son resultados reales." : `Cuenta de demostración con datos de ejemplo para un negocio en ${market === "your area" ? "su zona" : market}${industry === "Local" ? "" : ` (${industryName(industry, "es")})`}. No son resultados reales.`) + " La plataforma de anuncios está en inglés; el chat le ayuda en español."
          : agency ? "Demo agency account with sample clients and sample data. Not real results." : `Demo account with sample data for a ${industry.toLowerCase()} business in ${market}. Not real results.`}</div>

        <div className="dm-body">
          {!agency && sec !== "Your ad plan" && (
            <button type="button" className="dm-planbar" onClick={() => go("Your ad plan")}>
              <Mi i="auto_awesome" />
              <span><b>{plan ? t("Your ad plan is ready.", "Su plan de anuncios está listo.") : planBusy ? t("We are writing your ad plan from your website.", "Estamos escribiendo su plan de anuncios a partir de su sitio web.") : t("Get your free ad plan.", "Obtenga su plan de anuncios gratis.")}</b>{" "}
                {plan ? t("Streaming TV, video, display, native and retargeting, split for your budget.", "TV por streaming, video, display, nativos y retargeting, repartidos según su presupuesto.") : planBusy ? t("It takes about 30 seconds. Keep looking around.", "Toma unos 30 segundos. Siga explorando.") : t("Enter your website and we plan your streaming TV, video, display, native and retargeting ads.", "Escriba su sitio web y planeamos sus anuncios en TV por streaming, video, display, nativos y retargeting.")}</span>
              <span className="dm-planbar-go">{plan ? t("View your plan", "Ver su plan") : planBusy ? t("Open", "Abrir") : t("Build my plan", "Crear mi plan")}<Mi i="arrow_forward" s={18} /></span>
            </button>
          )}

          {sec === "Your ad plan" && (
            <div className="dm-plan">
              {plan ? (
                <PlanView saved={plan} actions={<>
                  <button type="button" className="btn btn-white" onClick={() => { setPlanPreset(builderPreset(plan.plan, market)); go("Create new campaign"); }}>{t("Build this campaign", "Crear esta campaña")}</button>
                  <Link className="btn btn-line" style={{ borderColor: "#fff", color: "#fff" }} href={accountHref(plan)}>{t("Open your account with this plan", "Abra su cuenta con este plan")}</Link>
                  <button type="button" className="btn btn-line" style={{ borderColor: "#A9C1F5", color: "#A9C1F5" }} onClick={() => askAboutPlan(plan)}>{t("Ask about this plan", "Preguntar sobre este plan")}</button>
                </>} />
              ) : (
                <div className="dm-plan-start">
                  <div className="dm-plan-art"><Mi i="auto_awesome" /></div>
                  <h1>{planBusy ? t("Writing your ad plan", "Escribiendo su plan de anuncios") : t("Your free ad plan", "Su plan de anuncios gratis")}</h1>
                  <p>{planBusy ? t("We are reading your website and planning your channels, audience, ads and tracking.", "Estamos leyendo su sitio web y planeando sus canales, audiencia, anuncios y seguimiento.") : t("Enter your website. We read it the way a media planner would and write a plan for streaming TV, online video, display, native and retargeting ads, split for your budget. Then build the campaign right here.", "Escriba su sitio web. Lo leemos como lo haría un planificador de medios y escribimos un plan de anuncios en TV por streaming, video en línea, display, nativos y retargeting, repartido según su presupuesto. Después cree la campaña aquí mismo.")}</p>
                  {planErr && <p className="note note-err" role="alert">{planErr}</p>}
                  <div className="dm-plan-form">{planBusy ? <PlanProgress /> : <PlannerForm known={known} dark onPlan={(p) => { setPlan(p); setPlanErr(""); }} />}</div>
                </div>
              )}
            </div>
          )}

          {tour !== null && !agency && sec !== "Create new campaign" && sec !== "Your ad plan" && (
            <div className="dm-tour" role="region" aria-label={t("Guided tour", "Recorrido guiado")}>
              {tour === -1 ? (
                <><div><strong>{t("New here?", "¿Es nuevo?")}</strong> {t("Take the one-minute tour of the platform.", "Haga el recorrido de un minuto por la plataforma.")}</div>
                  <div className="dm-row"><button type="button" className="dm-btn" onClick={() => setTour(null)}>{t("No thanks", "No, gracias")}</button><button type="button" className="dm-btn dm-btn-blue" onClick={() => stop(0)}>{t("Start the tour", "Empezar el recorrido")}</button></div></>
              ) : (
                <><div><span className="dm-k">{t("Stop", "Parada")} {tour + 1} {t("of", "de")} {TOUR.length}</span><br /><strong>{tourText(tour)[0]}.</strong> {tourText(tour)[1]}</div>
                  <div className="dm-row">
                    {tour > 0 && <button type="button" className="dm-btn" onClick={() => stop(tour - 1)}>{t("Back", "Atrás")}</button>}
                    {tour < TOUR.length - 1 ? <button type="button" className="dm-btn dm-btn-blue" onClick={() => stop(tour + 1)}>{t("Next", "Siguiente")}</button>
                      : <button type="button" className="dm-btn dm-btn-blue" onClick={() => setTour(null)}>{t("Finish the tour", "Terminar el recorrido")}</button>}
                  </div></>
              )}
            </div>
          )}

          {sec === "Create new campaign" && (
            <>
              {tour === 2 && <div className="dm-tour" role="region" aria-label={t("Guided tour", "Recorrido guiado")} style={{ margin: "-16px -16px 16px" }}><div><span className="dm-k">{t("Stop", "Parada")} 3 {t("of", "de")} {TOUR.length}</span><br /><strong>{tourText(2)[0]}.</strong> {tourText(2)[1]} {t("The Traffic source step lists the SSP endpoints.", "El paso Traffic source muestra los endpoints de SSP.")}</div><div className="dm-row"><button type="button" className="dm-btn" onClick={() => stop(1)}>{t("Back", "Atrás")}</button><button type="button" className="dm-btn dm-btn-blue" onClick={() => stop(3)}>{t("Next", "Siguiente")}</button></div></div>}
              <Builder key={planPreset ? "plan" : "blank"} industry={acc.short} market={market} audiences={audiences.map((x) => x[0])} onCancel={() => go("Campaigns")} preset={planPreset || undefined} />
            </>
          )}

          {sec === "Clients" && (() => {
            const own = acc.totals(acc.LEN - 14, acc.LEN - 1).spend;
            const rows: [string, string, number][] = [[`${industry} client · ${market}`, industry, own], ["Auto dealer client", "Automotive", own * 2.7], ["Dental practice client", "Healthcare", own * 1.9], ["Home repair client", "Home Services", own * 1.3], ["Real estate client", "Real Estate", own * 0.6]];
            const total = rows.reduce((x, r) => x + r[2], 0);
            return (
              <>
                <Head title="Clients"><Add label="Add client" /></Head>
                <div className="dm-kpis">
                  {[["Clients", String(rows.length)], ["Managed spend, last 14 days", usd(total)], [`Your ${SHARE_PCT}% revenue share`, usd((total * SHARE_PCT) / 100)]].map(([k, v]) => (
                    <div className="dm-kpi" key={k}><div className="dm-k">{k}</div><div className="dm-v">{v}</div></div>
                  ))}
                </div>
                <p>Every client has their own login and sees only their own campaigns. You see all of them here.</p>
                <Table head={["Client", "Industry", "Own login", "Status", "Spend, last 14 days", `Your ${SHARE_PCT}% share`]} num={[4, 5]}
                  rows={rows.map(([nm, ind, sp]) => [nm, ind, "Yes", <Status key="s" on />, usd(sp), usd((sp * SHARE_PCT) / 100)])} />
                <div><button type="button" className="dm-btn" onClick={() => go("Dashboard")}>Open the first client&apos;s account</button></div>
              </>
            );
          })()}

          {sec === "Explore" && (
            <>
              <div className="dm-card dm-hero">
                <h1 style={{ fontSize: 22 }}>Welcome to DSP Connect!</h1>
                <p style={{ maxWidth: 560 }}>Thanks for choosing DSP Connect. Here you&apos;ll find diverse ad formats and top-quality traffic! Explore a help center to see how it works.</p>
                <div><a className="dm-link" href="https://help.getdspconnect.com" target="_blank" rel="noopener">View guide</a></div>
              </div>
              <div style={{ marginTop: 16 }}><h1>Quick Start Guide</h1><p style={{ marginTop: 6 }}>Learn how to set up your first campaign in a DSP from zero to completion.</p></div>
              {([
                ["link", "1. Add a Tracking pixel URL", "Add a Tracking pixel URL to measure campaign performance accurately.", "Add the Tracking pixel URL", "Conversion Tracking", "visibility"],
                ["campaign", "2. Create a Campaign", "Start by creating your first Campaign to launch ads. You can also explore our guide to learn the basics.", "Create a Campaign", "Create new campaign", "rocket_launch"],
                ["groups", "3. Find an Audience", "Build your first Audience using targeting segments, demographics, interests, and other data to improve campaign performance.", "Create an Audience", "Audience", "group_add"],
                ["groups", "4. Set the Budgets", "Optimize your Budgets to increase the completed view rate as much as possible for your chosen audience.", "", "", "savings"],
                ["photo_library", "5. Add a Creative", "Upload or select a Creative from a 3rd Party Ad Tag, Creative Library, HTML5, or upload a file.", "", "Creative Assets", "photo_library"],
              ] as [string, string, string, string, Sec | "", string][]).map(([ic, t, d, cta, to, art]) => (
                <div className="dm-card dm-step" key={t}>
                  <div className="dm-step-art"><Mi i={art} /></div>
                  <div>
                    <h3><Mi i={ic} />{t}</h3><p>{d}</p>
                    <div className="dm-row">
                      {cta && to && <button type="button" className="dm-btn" onClick={() => go(to)}><Mi i="add_circle_outline" s={18} />{cta}</button>}
                      <a className="dm-link" href="https://help.getdspconnect.com" target="_blank" rel="noopener">View guide</a>
                    </div>
                  </div>
                </div>
              ))}
              <h1 style={{ marginTop: 16 }}>What&apos;s new?</h1>
              <div className="dm-card" style={{ maxWidth: 520 }}>
                <h3>Audiences</h3>
                <p style={{ marginTop: 8 }}>Targeting decoupled from campaigns — create reusable Audiences with full targeting setups, then link them to campaigns.</p>
                <button type="button" className="dm-link" onClick={() => go("Audience")} style={{ marginTop: 12 }}>Read more</button>
              </div>
            </>
          )}

          {sec === "Dashboard" && (
            <>
              <Head title="Dashboard"><DatePicker /></Head>
              {!sum ? <div className="dm-card" style={{ textAlign: "center", padding: 56 }}><h3>No data yet</h3><p className="dm-muted" style={{ marginTop: 6 }}>Today&apos;s statistics appear as campaigns deliver.</p></div> : (
                <>
                  <div className="dm-kpis">
                    {([["spend", "Spend", usd(sum.spend)], ["imp", "Impressions", n(sum.imp)], ["clicks", "Clicks", n(sum.clicks)], ["ctr", "CTR", pct(sum.clicks / sum.imp)], ["conv", "Conversions", n(sum.conv)]] as const).map(([k, label, v]) => {
                      const cur = k === "ctr" ? sum.clicks / sum.imp : sum[k];
                      const prev = prevSum ? (k === "ctr" ? prevSum.clicks / prevSum.imp : prevSum[k]) : 0;
                      const d = prev ? (cur - prev) / prev : 0;
                      const pick = k === "ctr" ? null : k;
                      return (
                        <button type="button" key={k} className="dm-kpi" data-on={metric === pick || undefined} aria-pressed={metric === pick} onClick={() => pick && setMetric(pick)}>
                          <div className="dm-k">{label}</div><div className="dm-v">{v}</div>
                          {prevSum && <div className={`dm-delta${d < 0 ? " dn" : ""}`}>{d >= 0 ? "▲" : "▼"} {Math.abs(d * 100).toFixed(1)}% vs previous period</div>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="dm-card">
                    <Chart label={{ imp: "Impressions", clicks: "Clicks", conv: "Conversions", spend: "Spend" }[metric]} fmt={metric === "spend" ? (v) => "$" + n(v) : n}
                      points={acc.daily.slice(a, b + 1).map((d) => ({ x: dmy(d.date), y: d.row[metric] }))} />
                  </div>
                  <Table head={["Campaign", "Status", "Impressions", "Clicks", "CTR", "Conversions", "Spend", "eCPM"]} num={[2, 3, 4, 5, 6, 7]}
                    rows={campaigns.filter((c) => c.r && (c.r.imp > 0 || c.status === "Active")).map((c) => [c.name, <Status key="s" on={c.status === "Active"} />, n(c.r!.imp), n(c.r!.clicks), pct(c.r!.clicks / c.r!.imp), n(c.r!.conv), usd(c.r!.spend), usd(c.r!.imp ? (c.r!.spend / c.r!.imp) * 1000 : 0)])}
                    foot={["Total", "", n(sum.imp), n(sum.clicks), pct(sum.clicks / sum.imp), n(sum.conv), usd(sum.spend), usd((sum.spend / sum.imp) * 1000)]} />
                </>
              )}
            </>
          )}

          {sec === "Campaigns" && (
            <div className="dm-split">
              <div className="dm-folders">
                <button type="button" className="dm-folder" data-on={folder === "all" || undefined} onClick={() => setFolder("all")}><span>All campaigns ({acc.campaigns.length})</span><Mi i="first_page" s={18} /></button>
                <h4>Folders <button type="button" className="dm-iconbtn" aria-label="Add folder" onClick={() => locked("Adding a folder")}><Mi i="add_circle_outline" /></button></h4>
                <div style={{ padding: "0 24px 8px" }}><div className="dm-field"><input aria-label="Search folders" placeholder="Search" /><Mi i="search" /></div></div>
                <button type="button" className="dm-folder" data-on={folder === acc.short || undefined} onClick={() => setFolder(acc.short)}><span>{acc.short} ({acc.campaigns.length})</span></button>
                <button type="button" className="dm-folder" data-on={folder === "Unsorted" || undefined} onClick={() => setFolder("Unsorted")}><span>Unsorted (0)</span></button>
              </div>
              <div className="dm-col">
                <Head title={folder === "all" ? "All campaigns" : folder}><button type="button" className="dm-btn dm-btn-dark" onClick={() => go("Create new campaign")}><Mi i="add_circle_outline" s={18} />Create new Campaign</button></Head>
                <div className="dm-card dm-filters">
                  <Search />
                  <div className="dm-field" style={{ width: 230 }}><label htmlFor="c-st">Status:</label><select id="c-st" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option>Active, Inactive</option><option>Active</option><option>Inactive</option></select><Mi i="arrow_drop_down" /></div>
                  <div className="dm-field" style={{ width: 160 }}><label htmlFor="c-bu">Budget:</label><select id="c-bu"><option>All</option></select><Mi i="arrow_drop_down" /></div>
                  <button type="button" className="dm-iconbtn" style={{ marginLeft: "auto" }} aria-label="Table configuration" onClick={() => locked("Table configuration")}><Mi i="filter_list" s={24} /></button>
                </div>
                {folder === "Unsorted" ? <Table head={["ID", "Name", "Status"]} rows={[]} /> : (
                  <Table head={["ID", "Name", "Status", "Media type", "Total budget", "Spend", "Impressions", "Clicks"]} num={[4, 5, 6, 7]}
                    rows={shownCampaigns.map((c) => [c.id, c.name, <Status key="s" on={c.status === "Active"} />, c.format, usd(c.budget), usd(c.tot.spend), n(c.tot.imp), n(c.tot.clicks)])} />
                )}
                <div className="dm-pager">{folder === "Unsorted" ? 0 : shownCampaigns.length} items</div>
              </div>
            </div>
          )}

          {sec === "Audience" && (
            <>
              <Head title="Audience"><Add label="Create new Audience" onClick={() => go("Create new campaign")} /></Head>
              <div className="dm-card dm-filters"><Search /><div className="dm-field" style={{ width: 180 }}><label htmlFor="a-st">Status:</label><select id="a-st"><option>Active</option></select><Mi i="arrow_drop_down" /></div></div>
              <Table head={["Name", "Linked Campaigns", "Created", "Edited", "Status", ""]}
                rows={audiences.filter((x) => match(x[0])).map(([nm, l, c, e]) => [nm, l, dmy(c), dmy(e), <Status key="s" on />, <button key="e" type="button" className="dm-iconbtn" aria-label={`Edit ${nm}`} onClick={() => locked("Editing an Audience")}><Mi i="edit" s={18} /></button>])} />
              <div className="dm-pager">{audiences.length} items</div>
            </>
          )}

          {sec === "Conversion Tracking" && (
            <>
              <Head title="Conversion Tracking" />
              <p>Track conversions using S2S Postbacks or Client-Side browser scripts.</p>
              <div className="dm-info"><Mi i="info" /><span>Three default conversion events are tracked: LP click (0 event), Registration (1 event), Purchase/FTD (2 event). Events are flexible and can be renamed to match your business.</span></div>
              <div className="dm-tabs"><button type="button" data-on={ctTab === "S2S" || undefined} onClick={() => setCtTab("S2S")}>S2S Tracking</button><button type="button" data-on={ctTab === "Client" || undefined} onClick={() => setCtTab("Client")}>Client-Side Tracking</button></div>
              <div className="dm-card dm-stack">
                {ctTab === "S2S" ? (
                  <>
                    <h3>Postback URL</h3>
                    <p>Fire this URL from your tracking platform when a conversion happens. Add the click ID macro to your ad&apos;s target URL so it can be passed back.</p>
                    <div className="dm-field" style={{ height: "auto", padding: 12, fontFamily: "monospace", fontSize: 13, overflowWrap: "anywhere" }}>https://track.getdspconnect.com/postback?clickid=[CLICK_ID]&amp;event=[EVENT_ID]&amp;payout=[PAYOUT]</div>
                    <Table head={["Event", "Event ID", "Last fired", "Conversions, last 7 days"]} num={[3]} rows={[["LP click", 0, dmy(acc.dates[acc.LEN - 1]), n(acc.totals(acc.LEN - 7, acc.LEN - 1).clicks * 0.81)], ["Registration", 1, dmy(acc.dates[acc.LEN - 1]), n(acc.totals(acc.LEN - 7, acc.LEN - 1).conv * 0.64)], ["Purchase/FTD", 2, dmy(acc.dates[acc.LEN - 2]), n(acc.totals(acc.LEN - 7, acc.LEN - 1).conv * 0.36)]]} />
                  </>
                ) : (
                  <>
                    <h3>Tracking pixel</h3>
                    <p>Place this script on your website&apos;s conversion page, or add it through your tag manager.</p>
                    <div className="dm-field" style={{ height: "auto", padding: 12, fontFamily: "monospace", fontSize: 13, overflowWrap: "anywhere" }}>&lt;script async src=&quot;https://track.getdspconnect.com/px.js?id=DC-{10412 + industry.length}&amp;event=2&quot;&gt;&lt;/script&gt;</div>
                  </>
                )}
              </div>
            </>
          )}

          {sec === "Analytics" && (() => {
            const rows = a <= b ? acc.breakdown(group, a, b).filter((r) => match(r.name)) : [];
            const total = rows.reduce((x, r) => ({ ...x, ...Object.fromEntries(Object.entries(r.row).map(([k, v]) => [k, typeof v === "number" ? (x[k as keyof Row] as number) + v : v])) }), { imp: 0, clicks: 0, conv: 0, spend: 0, bids: 0, wins: 0, q1: 0, q2: 0, q3: 0, q4: 0, video: false } as Row);
            const shown = visibleCols.filter((c) => !c.video || rows.some((r) => r.row.q4 > 0));
            return (
              <>
                <Head title="Analytics"><DatePicker /></Head>
                <div className="dm-card dm-filters">
                  <div className="dm-rel">
                    <button type="button" className="dm-date" aria-expanded={menu === "group"} onClick={() => setMenu(menu === "group" ? "" : "group")}>Group by: <b>{group}</b><Mi i="arrow_drop_down" /></button>
                    {menu === "group" && <div className="dm-pop" role="menu" style={{ left: 0, right: "auto", maxHeight: 360, overflowY: "auto" }}>{GROUP_BY.map((g) => <button key={g} type="button" role="menuitemradio" aria-checked={group === g} onClick={() => { setGroup(g); setMenu(""); }}>{g}</button>)}</div>}
                  </div>
                  <div className="dm-field" style={{ width: 300 }}><label htmlFor="an-tz">Time offset:</label><select id="an-tz" defaultValue={tz}><option>{tz}</option></select><Mi i="arrow_drop_down" /></div>
                  <button type="button" className="dm-link" style={{ textDecoration: "none" }} onClick={() => setChart(!chart)}>{chart ? "↑ Hide Chart" : "↓ Show Chart"}</button>
                  <div className="dm-row" style={{ marginLeft: "auto" }}>
                    <button type="button" className="dm-btn" onClick={() => locked("Export to CSV")}>Export to CSV</button>
                    <button type="button" className="dm-btn dm-btn-dark" onClick={() => setToast("Report updated.")}>Get Report</button>
                  </div>
                  <div className="dm-row" style={{ flexBasis: "100%" }}>
                    <button type="button" className="dm-btn dm-btn-sm" onClick={() => locked("Add Dimension Filter")}><Mi i="add_circle_outline" s={18} />Add Dimension Filter</button>
                    <div className="dm-search dm-field" style={{ width: 240, height: 32 }}><input aria-label={`Search ${group}`} placeholder={`Search ${group}`} value={search} onChange={(e) => setSearch(e.target.value)} /><Mi i="search" s={18} /></div>
                  </div>
                </div>
                {chart && a <= b && (
                  <div className="dm-card dm-stack">
                    <div className="dm-row"><span className="dm-muted">Metric:</span>{(["imp", "clicks", "conv", "spend"] as const).map((m) => <button key={m} type="button" className="dm-chip" data-on={metric === m || undefined} aria-pressed={metric === m} onClick={() => setMetric(m)}>{{ imp: "Impressions", clicks: "Clicks", conv: "Conversions", spend: "Spend" }[m]}</button>)}</div>
                    <Chart label={{ imp: "Impressions", clicks: "Clicks", conv: "Conversions", spend: "Spend" }[metric]} fmt={metric === "spend" ? (v) => "$" + n(v) : n}
                      points={acc.daily.slice(a, b + 1).map((d) => ({ x: dmy(d.date), y: d.row[metric] }))} />
                  </div>
                )}
                <div className="dm-row" style={{ justifyContent: "flex-end" }}>
                  <div className="dm-rel">
                    <button type="button" className="dm-btn dm-btn-sm" aria-expanded={menu === "cols"} onClick={() => setMenu(menu === "cols" ? "" : "cols")}><Mi i="view_column" s={18} />Table configuration</button>
                    {menu === "cols" && <div className="dm-pop" style={{ padding: 8, minWidth: 220 }}>{COLS.map((c) => <label key={c.key} className="dm-check" style={{ display: "flex", padding: "4px 8px" }}><input type="checkbox" checked={cols.includes(c.key)} onChange={() => setCols(cols.includes(c.key) ? cols.filter((x) => x !== c.key) : [...cols, c.key])} />{c.label}</label>)}</div>}
                  </div>
                </div>
                <Table head={[group, ...shown.map((c) => c.label)]} num={shown.map((_, i) => i + 1)}
                  rows={rows.map((r) => [r.name, ...shown.map((c) => c.get(r.row))])}
                  foot={rows.length ? ["Total", ...shown.map((c) => c.get(total))] : undefined} />
                <div className="dm-pager"><span>{rows.length} items</span><span>Rows per page: 25</span></div>
              </>
            );
          })()}

          {sec === "Traffic Funnel" && (() => {
            const c = acc.campaigns.find((x) => String(x.id) === funnelCamp);
            const r = c ? acc.sumDays(c, Math.max(a, 0), b) : null;
            const steps: [string, number][] = r ? [["Bid Requests", r.bids * 3.4], ["Bid Responses", r.bids], ["Wins", r.wins], ["Impressions", r.imp], ["Clicks", r.clicks], ["Conversions", r.conv]] : [];
            return (
              <>
                <Head title="Traffic Funnel" help={false} />
                <div className="dm-card dm-stack">
                  <div><button type="button" className="dm-btn" onClick={() => locked("Add Filter")}>Add Filter<Mi i="arrow_drop_down" /></button></div>
                  <div className="dm-row" style={{ alignItems: "flex-end" }}>
                    <div style={{ width: 360 }}><label className="dm-lbl" htmlFor="tf-c">Campaign <i>*</i></label>
                      <div className="dm-field"><select id="tf-c" value={funnelCamp} onChange={(e) => setFunnelCamp(e.target.value)}><option value="">Select option</option>{acc.campaigns.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select><Mi i="arrow_drop_down" /></div></div>
                  </div>
                </div>
                <div className="dm-row" style={{ justifyContent: "space-between" }}>
                  <span style={{ color: r ? "#0B8A3E" : "#C62828" }}>{r ? `Data gathered for ${range}` : "Data is not gathering"}</span>
                  <button type="button" className="dm-btn" onClick={() => setFunnelCamp("")}><Mi i="restart_alt" s={18} />Reset data</button>
                </div>
                <div className="dm-card">
                  {!r ? <p style={{ textAlign: "center", padding: 24 }}><b>No Data</b><br /><span className="dm-muted">Select a campaign to see where its traffic drops off.</span></p> : (
                    <div className="dm-funnel">
                      {steps.map(([k, v], i) => (
                        <div className="dm-funnel-row" key={k}>
                          <span>{k}</span>
                          <div className="dm-funnel-bar"><div style={{ width: `${Math.max(1.5, (v / steps[0][1]) * 100)}%` }} /></div>
                          <span className="dm-n" style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{n(v)}</span>
                          <span className="dm-muted dm-sm">{i ? pct(v / steps[i - 1][1]) : ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            );
          })()}

          {sec === "Creative Assets" && (
            <div className="dm-split">
              <div className="dm-folders">
                <button type="button" className="dm-folder" data-on><span>All assets</span></button>
                <h4>Folders <button type="button" className="dm-iconbtn" aria-label="Create new Folder" onClick={() => locked("Create new Folder")}><Mi i="add_circle_outline" /></button></h4>
                <div style={{ padding: "0 24px 8px" }}><div className="dm-field"><input aria-label="Search folders" placeholder="Search" /><Mi i="search" /></div></div>
                <button type="button" className="dm-folder"><span>{acc.short}</span><Mi i="more_horiz" s={18} /></button>
                <button type="button" className="dm-folder"><span>Unsorted</span><Mi i="more_horiz" s={18} /></button>
              </div>
              <div className="dm-col">
                <Head title="Creative Assets"><Add label="Upload" /></Head>
                <div className="dm-tabs">{(["Images", "Videos", "HTML5"] as const).map((t) => <button key={t} type="button" data-on={assetTab === t || undefined} onClick={() => setAssetTab(t)}>{t} ({{ Images: 5, Videos: 2, HTML5: 0 }[t]})</button>)}</div>
                <Table head={["Image", "Name", "Preview", "Dimensions", "File Size (KB)", "Type"]} num={[4]}
                  rows={(assetTab === "Images" ? [["300x250", 46, "JPG"], ["320x50", 18, "PNG"], ["728x90", 39, "JPG"], ["160x600", 52, "JPG"], ["1200x627", 112, "PNG"]] : assetTab === "Videos" ? [["1920x1080", 14200, "MP4", "30s"], ["1920x1080", 7400, "MP4", "15s"]] : []).map(([dim, kb, type, len], i) => [
                    <span key="t" className="dm-thumb" style={{ background: ["#1A1C1E", "#0A4FD6", "#2E7D32", "#6D5BD0", "#C2185B"][i] }}>{type === "MP4" ? "▶" : dim}</span>,
                    `${acc.short.toLowerCase().replace(/\s+/g, "-")}-${type === "MP4" ? `spot-${len}` : dim}.${String(type).toLowerCase()}`,
                    <button key="p" type="button" className="dm-link" onClick={() => locked("Preview")}>Preview</button>, String(dim).replace("x", " × "), n(Number(kb)), type,
                  ])} />
              </div>
            </div>
          )}

          {sec === "Allowlist / Blocklist" && (
            <>
              <Head title="Allowlist / Blocklist"><Add label="Create new" /></Head>
              <div className="dm-card dm-filters"><Search /><div className="dm-field" style={{ width: 150 }}><label htmlFor="f-t">Type:</label><select id="f-t"><option>All</option><option>Allowlist</option><option>Blocklist</option></select><Mi i="arrow_drop_down" /></div><div className="dm-field" style={{ width: 200 }}><label htmlFor="f-c">Category:</label><select id="f-c"><option>All</option></select><Mi i="arrow_drop_down" /></div></div>
              <Table head={["Name", "Type", "Category", "Linked Campaigns", "Items", ""]} num={[4]} rows={[
                ["Top performers — Allowlist", "Allowlist", "Site Domain / App Bundle", 2, 24], ["Low CTR — Blocklist", "Blocklist", "Site Domain / App Bundle", 3, 57],
                ["Made for advertising — Blocklist", "Blocklist", "Site Domain / App Bundle", 4, 312], [`${acc.city} only`, "Allowlist", "Region", 3, 1], ["Low viewability placements", "Blocklist", "Site ID / App ID", 2, 41],
              ].filter((x) => match(String(x[0]))).map((r) => [...r, <button key="m" type="button" className="dm-iconbtn" aria-label="More actions" onClick={() => locked("Editing a list")}><Mi i="more_vert" s={18} /></button>])} />
              <div className="dm-pager">1 – 5 of 5</div>
            </>
          )}

          {sec === "Segments" && (
            <>
              <Head title="Segments"><Add label="Create new" /></Head>
              <div className="dm-card dm-filters"><Search /></div>
              <Table head={["Name", "Type", "Owner", "Code", "Linked Audiences", "items", "Public"]} num={[5]} rows={[
                ["Website visitors · 30 days", "Pixel", name, "SEG-4471", 1, n(acc.totals(acc.LEN - 30, acc.LEN - 1).clicks * 3.2), "No"],
                ["Clicked an ad · 14 days", "Campaign", name, "SEG-4472", 1, n(acc.totals(acc.LEN - 14, acc.LEN - 1).clicks), "No"],
                ["Converted · 90 days (exclude)", "Pixel", name, "SEG-4473", 2, n(acc.tot.conv), "No"],
              ]} />
            </>
          )}
          {sec === "IFA Lists" && (
            <>
              <Head title="IFA Lists"><Add label="Create new" /></Head>
              <div className="dm-card dm-filters"><Search /></div>
              <Table head={["Name", "Type", "Linked Audiences", "items", "Uploaded"]} num={[3]} rows={[["Past customers (device IDs)", "IFA", 1, n(1840), dmy(acc.dates[acc.LEN - 40])]]} />
            </>
          )}
          {sec === "User IDs" && (
            <div className="dm-card" style={{ textAlign: "center", padding: 56 }}>
              <h3>Create an User IDs list</h3>
              <p className="dm-muted" style={{ maxWidth: 520, margin: "8px auto 20px" }}>Create user IDs list to uniquely identify, track, and target individual users across devices and campaigns in a DSP.</p>
              <Add label="Create new" />
            </div>
          )}

          {sec === "Custom Locations" && (
            <>
              <Head title="Custom Locations"><Add label="Geo-fence" /><button type="button" className="dm-btn" onClick={() => locked("Polygon Area")}><Mi i="add_circle_outline" s={18} />Polygon Area</button></Head>
              <div className="dm-card dm-filters"><Search /></div>
              <Table head={["Name", "Type", "Linked Audiences", "items", ""]} num={[3]}
                rows={[[`${acc.city} service area`, "Polygon Area", 2, 1], ["Competitor locations", "Geo-fence", 1, 6], ["Event venues", "Geo-fence", 0, 3]].filter((x) => match(String(x[0]))).map((r) => [...r, <span key="a" className="dm-actions"><button type="button" className="dm-iconbtn" aria-label="Edit" onClick={() => locked("Editing a location")}><Mi i="mode_edit_outline" s={18} /></button><button type="button" className="dm-iconbtn" aria-label="Delete" onClick={() => locked("Deleting a location")}><Mi i="delete" s={18} /></button></span>])} />
            </>
          )}

          {sec === "Billing" && (
            <>
              <Head title="Billing" />
              <div className="dm-card dm-stack">
                <h3>Payment Method</h3>
                <div className="dm-row"><span className="dm-chip" data-on><Mi i="credit_card" s={18} />Card</span><span className="dm-chip"><Mi i="account_balance" s={18} />Wire transfer</span></div>
                <div className="dm-row"><button type="button" className="dm-btn dm-btn-dark" onClick={() => locked("Adding funds")}>Add funds</button><span className="dm-muted">Balance: <b style={{ color: "#0B8A3E" }}>{usd(acc.balance)}</b></span></div>
              </div>
              <h3 style={{ marginTop: 8 }}>Transaction history</h3>
              <div className="dm-card dm-filters"><DatePicker /><Search /><div className="dm-field" style={{ width: 170 }}><select aria-label="Select type"><option>Select type</option><option>Deposit</option><option>Spend</option></select><Mi i="arrow_drop_down" /></div><div className="dm-field" style={{ width: 240 }}><select aria-label="Select payment method"><option>Select payment method</option><option>Card</option><option>Wire transfer</option></select><Mi i="arrow_drop_down" /></div><button type="button" className="dm-btn dm-btn-dark" onClick={() => setToast("Transactions updated.")}>Get transactions</button></div>
              {(() => {
                const m1 = acc.LEN - 31;
                const s1 = acc.totals(0, m1).spend, s2 = acc.tot.spend - s1;
                const rows: [number, Date, string, string, number, number, string][] = [
                  [20311, acc.dates[0], "Ad budget deposit", "Deposit", deposits[0], deposits[0], "Card"],
                  [20388, acc.dates[m1], "Ad spend", "Spend", -s1, deposits[0] - s1, ""],
                  [20402, acc.dates[m1 + 1], "Ad budget deposit", "Deposit", deposits[1], acc.funded - s1, "Card"],
                  [20457, acc.dates[acc.LEN - 1], "Ad spend", "Spend", -s2, acc.balance, ""],
                ];
                return <Table head={["ID", "Date", "Description", "Type", "Amount", "Balance", "Status", "Invoice"]} num={[4, 5]}
                  rows={rows.reverse().map(([id, d, desc, t, amt, bal, pm]) => [id, dmy(d), desc + (pm ? ` (${pm})` : ""), t, (amt < 0 ? "-" : "") + usd(Math.abs(amt)), usd(bal), <Status key="s" on>Completed</Status>, t === "Deposit" ? <button key="i" type="button" className="dm-iconbtn" aria-label="Download invoice" onClick={() => locked("Invoice download")}><Mi i="receipt_long" s={18} /></button> : "-"])} />;
              })()}
            </>
          )}

          {sec === "Media plannings" && (() => {
            const dims = ["SSP", "SSP Endpoint", "Type", "Size", "Country", "Browser", "OS", "App Bundle", "Site URL"];
            const base: Record<string, [string, number, number][]> = {
              "SSP": [["Google", 41.2e6, 0.62], ["Pubmatic", 33.8e6, 0.71], ["Appnexus", 27.5e6, 0.58], ["OpenX", 22.1e6, 0.66], ["SmartyAds", 14.9e6, 0.44], ["AdKernel", 9.7e6, 0.39]],
              "SSP Endpoint": [["Google", 31.4e6, 0.61], ["Pubmatic", 33.8e6, 0.71], ["Appnexus", 27.5e6, 0.58], ["OpenX", 22.1e6, 0.66], ["DoubleClick", 9.8e6, 0.74], ["Verve_Video_Inapp", 6.2e6, 2.85], ["Adinmo Video", 3.9e6, 2.4], ["ContentIgnite", 5.6e6, 0.52], ["SmartyAds", 14.9e6, 0.44]],
              "Type": [["Banner", 96.4e6, 0.55], ["Video", 31.7e6, 2.9], ["Native", 21.2e6, 0.61]],
              "Size": [["300x250", 39.6e6, 0.58], ["320x50", 33.1e6, 0.41], ["728x90", 17.3e6, 0.62], ["1920x1080", 22.8e6, 3.1], ["1200x627", 15.4e6, 0.6]],
              "Country": [["USA", 149.3e6, 0.84]],
              "Browser": [["Chrome", 58.2e6, 0.6], ["Safari", 47.9e6, 0.71], ["Samsung Internet", 9.1e6, 0.46], ["Other", 34.1e6, 1.9]],
              "OS": [["iOS", 52.6e6, 0.78], ["Android", 49.8e6, 0.55], ["Roku OS", 12.4e6, 3.4], ["Tizen", 7.3e6, 3.1], ["Fire OS", 6.4e6, 2.8], ["Windows", 20.8e6, 0.62]],
              "App Bundle": [["com.dailyforecast.radar", 6.8e6, 0.66], ["tv.streamhub.live", 4.1e6, 3.6], ["com.citynews.reader", 3.9e6, 0.58], ["com.puzzlequest.free", 3.4e6, 0.4], ["com.freecast.tvapp", 2.9e6, 3.2]],
              "Site URL": [["localnewsdaily.com", 2.6e6, 0.74], ["weatherwatchnow.com", 2.2e6, 0.69], ["homeandgardenhub.com", 1.5e6, 0.81], ["cityguideonline.com", 1.3e6, 0.66]],
            };
            const scale = preset === "Yesterday" || preset === "Today" ? 1 : preset === "Last 7 days" ? 7 : preset === "Last 30 days" ? 30 : Math.max(1, b - a + 1);
            return (
              <>
                <Head title="Media plannings"><DatePicker /></Head>
                <div className="dm-card dm-filters">
                  {dims.map((d) => <button key={d} type="button" className="dm-chip" data-on={planGroup === d || undefined} aria-pressed={planGroup === d} onClick={() => setPlanGroup(d)}>{d}</button>)}
                  <div className="dm-row" style={{ marginLeft: "auto" }}><button type="button" className="dm-btn" onClick={() => locked("Export to CSV")}>Export to CSV</button><button type="button" className="dm-btn dm-btn-dark" onClick={() => setToast(`Report for ${market} updated.`)}>Get Report</button></div>
                </div>
                <Table head={[planGroup, "Bid Requests", "Floor CPM"]} num={[1, 2]} rows={base[planGroup].map(([k, req, floor]) => [k, n((req / 30) * scale * (market === "your area" ? 1 : 0.018)), usd(floor)])} />
                <div className="dm-info"><Mi i="info" /><span>Bid Requests and Floor CPM are stored for a limited period. If the selected period includes dates outside it, these values show –. Figures are available traffic in {market}, for planning.</span></div>
              </>
            );
          })()}

          {sec === "Demand Analytics" && (() => {
            const cards: [string, [string, number][]][] = [
              ["SSP Endpoint", [["Google", 31], ["Pubmatic", 27], ["Appnexus", 22], ["OpenX", 19], ["DoubleClick", 14], ["Verve_Video_Inapp", 9], ["ContentIgnite", 7]]],
              ["App Store Categories", [["News", 9], ["Weather", 7], ["Games puzzle", 6], ["Food & drink", 5], ["Lifestyle", 5], ["Entertainment", 4]]],
              ["Play Store Categories", [["News & magazines", 8], ["Weather", 6], ["Casual", 6], ["Lifestyle", 5], ["Music & audio", 3]]],
              ["Connection Type", [["Wifi", 48], ["Cellular_nw_5g", 21], ["Cellular_nw_4g", 17], ["Ethernet", 11], ["Unknown", 3]]],
              ["Browser", [["Chrome", 39], ["Safari", 34], ["Samsung Internet", 8], ["Firefox", 4], ["Edge", 3]]],
              ["Device Type", [["Mobile", 58], ["Connected TV", 17], ["Desktop", 14], ["Tablet", 8], ["Set Top Box", 3]]],
              ["Video Protocol", [["Vast_4_0", 14], ["Vast_3_0_wrapper", 9], ["Vast_2_0", 4], ["Vast_4_0_wrapper", 6]]],
              ["Fold Position", [["Above_the_fold", 31], ["Header", 19], ["Below_the_fold", 12], ["Fullscreen", 8], ["Footer", 7], ["Sidebar", 4]]],
              ["Carrier", [["Verizon", 12], ["T-Mobile", 11], ["AT&T", 9], ["Unknown", 4]]],
              ["Interstitial", [["False", 88], ["True", 12]]],
              ["Content Keywords", [["News", 7], ["Local", 6], ["Weather", 5], ["Home", 4], ["Sports", 4], ["Food", 3]]],
              ["Geo Fence", [[`${acc.city} service area`, 1], ["Competitor locations", 6], ["Event venues", 3]]],
            ];
            return (
              <>
                <Head title="Demand Analytics" />
                <div className="dm-cards">
                  {cards.map(([t, items]) => (
                    <div className="dm-dcard" key={t}>
                      <div className="dm-dcard-h">{t}<span className="sq"><Mi i="menu" s={18} /></span><Mi i="schedule" s={18} /></div>
                      <ul>{items.map(([k, v]) => <li key={k}><span>{k}</span><span>{v}</span></li>)}<li><span>Total</span><span>{items.reduce((x, i) => x + i[1], 0)}</span></li></ul>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}

          {sec === "Bidding Rules" && (
            <>
              <Head title="Bidding Rules"><Add label="Create new" /></Head>
              <div className="dm-card dm-filters"><Search /><div className="dm-field" style={{ width: 240 }}><select aria-label="Select Campaign"><option>Select Campaign</option>{acc.campaigns.map((c) => <option key={c.id}>{c.name}</option>)}</select><Mi i="arrow_drop_down" /></div></div>
              <Table head={["Name", "Owner", "Frequency", "Analyze Data", "Linked Campaigns", "Preview"]} rows={[
                ["Block low CTR placements", name, "Every hour", "Last 3 days", 3, "IF Impressions > 2000 AND CTR < 0.08% THEN add Site Domain / App Bundle to Low CTR — Blocklist"],
                ["Raise bid on converting apps", name, "Every 3 hours", "Last 7 days", 2, "IF Conversions ≥ 3 AND eCPA < $40 THEN increase bid by 15%"],
                ["Pause high CPA sources", name, "Every 6 hours", "Last 7 days", 2, "IF Spend > $60 AND Conversions = 0 THEN exclude SSP Endpoint"],
              ].filter((x) => match(String(x[0])))} />
            </>
          )}
          {sec === "Autopilot Log" && (
            <>
              <Head title="Autopilot Log"><DatePicker /></Head>
              <div className="dm-card dm-filters"><Search /><button type="button" className="dm-btn dm-btn-dark" onClick={() => setToast("Logs updated.")}>Get logs</button></div>
              <Table head={["Date", "Action", "Type", "Description"]} rows={[
                [dmy(acc.dates[acc.LEN - 1]) + " 14:00", "Added to blocklist", "Bidding Rule", "Block low CTR placements: 3 apps added to Low CTR — Blocklist"],
                [dmy(acc.dates[acc.LEN - 2]) + " 09:00", "Bid increased", "Bidding Rule", "Raise bid on converting apps: bid +15% on 2 app bundles"],
                [dmy(acc.dates[acc.LEN - 3]) + " 18:00", "SSP Endpoint excluded", "Bidding Rule", "Pause high CPA sources: 1 SSP endpoint excluded from 1 campaign"],
                [dmy(acc.dates[acc.LEN - 5]) + " 11:00", "Added to blocklist", "Bidding Rule", "Block low CTR placements: 5 sites added to Low CTR — Blocklist"],
              ].filter((x) => match(x.join(" ")))} />
            </>
          )}
          {sec === "Bid Modifiers" && (
            <>
              <Head title="Bid Modifiers"><Add label="Create new" /></Head>
              <div className="dm-card dm-filters"><Search /><button type="button" className="dm-btn" style={{ marginLeft: "auto" }} onClick={() => locked("Link all campaigns")}>Link all campaigns</button></div>
              <Table head={["Name", "Owner", "Type", "Operation", "Linked campaigns", "Items"]} num={[5]} rows={[
                ["Evening hours boost", name, "Hour of day", "Multiply × 1.2", 3, 5], ["Connected TV premium", name, "Device type", "Multiply × 1.15", 1, 1], ["Weekend reduce", name, "Day of week", "Multiply × 0.85", 2, 2],
              ]} />
            </>
          )}
          {sec === "Tag Manager" && (
            <>
              <Head title="Tag Manager" help={false}><Add label="Create new" /></Head>
              <div className="dm-card dm-filters"><Search /></div>
              <Table head={["Tag", "Linked campaigns", "Date created"]} rows={[["Prospecting", 2, dmy(acc.campaigns[0].created)], ["Retargeting", 1, dmy(acc.campaigns[1].created)], ["Q4", 3, dmy(acc.campaigns[2].created)]]} />
            </>
          )}
        </div>
      </div>

      {toast && (
        <div className="dm-toast" role="status">
          <Mi i={/demo|demostración/.test(toast) ? "warning" : "check_circle"} />
          <span>{toast} {/demo|demostración/.test(toast) && (agency ? <a href={PARTNERSTACK_AGENCY_URL} target="_blank" rel="noopener noreferrer">{t("Join the agency program", "Únase al programa para agencias")}</a> : <Link href="/open-account">{t("Open your account", "Abra su cuenta")}</Link>)}</span>
          <button type="button" className="dm-iconbtn" aria-label="Close" onClick={() => setToast(null)}><Mi i="close" s={18} /></button>
        </div>
      )}
    </div>
  );
}
