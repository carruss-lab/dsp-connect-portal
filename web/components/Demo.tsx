"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import LeadForm from "./LeadForm";
import { MIN_BUDGET, SHARE_PCT } from "@/lib/site";

/* The demo follows the layout of the client platform screen for screen.
   Every figure below is sample data, fixed so the account is consistent. */

type Sec =
  | "Clients" | "Explore" | "Dashboard" | "Campaigns" | "Audience" | "Conversion Tracking" | "Analytics" | "Traffic Funnel"
  | "Create new campaign" | "Creative Assets" | "Allowlist / Blocklist" | "Retargeting" | "Custom Locations" | "Billing" | "Media plannings" | "Autopilot";

const NAV: { label: string; sec?: Sec; icon: string; children?: Sec[] }[] = [
  { label: "Explore", sec: "Explore", icon: "M4 20l4-10 6 6-10 4zm9-11l5-5 2 2-5 5" },
  { label: "Dashboard", sec: "Dashboard", icon: "M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" },
  { label: "Campaigns", sec: "Campaigns", icon: "M4 10v4h3l6 4V6L7 10H4zm12-1a4 4 0 010 6" },
  { label: "Audience", sec: "Audience", icon: "M8 11a3 3 0 100-6 3 3 0 000 6zm8 0a3 3 0 100-6 3 3 0 000 6zM2 19c0-3 3-5 6-5s6 2 6 5zm12 0c0-2-1-3.5-2.5-4.5.8-.3 1.6-.5 2.5-.5 3 0 6 2 6 5z" },
  { label: "Conversion Tracking", sec: "Conversion Tracking", icon: "M9 8H7a4 4 0 000 8h2m6-8h2a4 4 0 010 8h-2M8 12h8" },
  { label: "Analytics", icon: "M4 20V4h16v16zM8 16v-4m4 4V8m4 8v-6", children: ["Analytics", "Traffic Funnel"] },
  { label: "Creative Assets", sec: "Creative Assets", icon: "M4 5h16v14H4zm3 10l3-4 3 3 2-2 3 3" },
  { label: "Allowlist / Blocklist", sec: "Allowlist / Blocklist", icon: "M4 5h16l-6 7v6l-4 2v-8z" },
  { label: "Retargeting", sec: "Retargeting", icon: "M5 12a7 7 0 0112-5l2-2v6h-6l2-2a4 4 0 00-7 3m14 0a7 7 0 01-12 5l-2 2v-6h6l-2 2a4 4 0 007-3" },
  { label: "Custom Locations", sec: "Custom Locations", icon: "M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zm0-8a3 3 0 100-6 3 3 0 000 6z" },
  { label: "Billing", sec: "Billing", icon: "M3 6h18v12H3zM3 10h18M7 15h4" },
  { label: "Planning", icon: "M4 6h16v14H4zM4 10h16M8 3v4m8-4v4", children: ["Media plannings"] },
  { label: "Autopilot", sec: "Autopilot", icon: "M12 21a9 9 0 100-18 9 9 0 000 18zm-2-13l6 4-6 4z" },
];

const DAYS = [41200, 43850, 39900, 46300, 48750, 52100, 44600, 47900, 51300, 49800, 55200, 57400, 53900, 58600];
const CTR = [0.0041, 0.0043, 0.004, 0.0046, 0.0047, 0.0049, 0.0044, 0.0048, 0.005, 0.0049, 0.0052, 0.0054, 0.0051, 0.0055];
const CPM = 6.4;
const FUNDED = 6000;
const n = (v: number) => Math.round(v).toLocaleString("en-US");
const usd = (v: number) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (v: number) => (v * 100).toFixed(2) + "%";

function build(industry: string, market: string) {
  const days = DAYS.map((imp, i) => {
    const clicks = Math.round(imp * CTR[i]);
    return { day: `Day ${i + 1}`, imp, clicks, spend: (imp / 1000) * CPM, conv: Math.round(clicks * 0.062) };
  });
  const sum = (k: "imp" | "clicks" | "spend" | "conv") => days.reduce((a, d) => a + d[k], 0);
  const tot = { imp: sum("imp"), clicks: sum("clicks"), spend: sum("spend"), conv: sum("conv") };
  const split = [0.52, 0.31, 0.17];
  const campaigns = [`${industry} · Video · ${market}`, `${industry} · Banner · Returning visitors`, `${industry} · Native · New customers`].map((name, i) => ({
    id: 1041 + i, name, status: i === 2 ? "Inactive" : "Active", format: ["Video", "Banner", "Native"][i], budget: [3000, 2000, 1000][i],
    imp: tot.imp * split[i], clicks: tot.clicks * split[i], spend: tot.spend * split[i], conv: tot.conv * split[i],
  }));
  const apps = [["News and weather apps", 0.28], ["Local news websites", 0.22], ["Games", 0.19], ["Streaming and video apps", 0.17], ["Lifestyle websites", 0.14]].map(
    ([name, s]) => ({ name: name as string, imp: tot.imp * (s as number), clicks: tot.clicks * (s as number), spend: tot.spend * (s as number) }),
  );
  return { days, tot, campaigns, apps };
}

function Icon({ d }: { d: string }) {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
}
function Chart({ days }: { days: { imp: number }[] }) {
  const max = Math.max(...days.map((d) => d.imp));
  const W = 700, H = 180, step = W / (days.length - 1);
  const pts = days.map((d, i) => `${(i * step).toFixed(1)},${(H - (d.imp / max) * (H - 20)).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Impressions per day over the last 14 days, rising overall" style={{ width: "100%", height: "auto", display: "block" }}>
      {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="#E3E5EC" strokeWidth="1" />)}
      <polyline points={pts} fill="none" stroke="#0A4FD6" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}
function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="dm-table">
      <table>
        <thead><tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
const Badge = ({ children, tone = "g" }: { children: React.ReactNode; tone?: "g" | "p" | "n" }) => <span className={`dm-badge dm-badge-${tone}`}>{children}</span>;

const TOUR: [Sec, string, string][] = [
  ["Dashboard", "Your results", "Spend, impressions, clicks and conversions for every campaign, updated as they run."],
  ["Analytics", "Where your ads ran", "Group results by date, campaign or the apps and sites that showed your ads."],
  ["Audience", "Who saw them", "Reusable audiences: your area, the people you want, and visitors to your website."],
  ["Billing", "What it cost", "Your ad budget, what has been spent and what is left. Every transaction is listed."],
];
const GOALS: [string, string][] = [
  ["Awareness", "Show your ads to as many relevant people as possible."],
  ["Website visits", "Drive visits and traffic to your website or landing page."],
  ["Conversions", "Get more conversions (sign-ups, purchases, leads)."],
];
const FORMATS: [string, string][] = [
  ["Banner", "Standard display ads across websites and apps."],
  ["Video", "Video ads shown in or around video content."],
  ["Native", "Ads fitting naturally with surrounding content."],
];
const STEPS = ["General", "Audience", "Price & Optimization", "Budgets", "Traffic source"];

function Builder({ industry, market, onCancel }: { industry: string; market: string; onCancel: () => void }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ name: `${industry} · ${market}`, goal: "Conversions", format: "Banner", audience: `${market} · Adults 25 to 64`, optimize: true, budget: String(MIN_BUDGET), source: "All exchanges" });
  const set = (k: keyof typeof f, v: string | boolean) => setF((o) => ({ ...o, [k]: v }));
  const budget = Number(f.budget);
  const badBudget = !Number.isFinite(budget) || budget < MIN_BUDGET;
  const Choice = ({ k, items }: { k: "goal" | "format" | "audience" | "source"; items: [string, string][] }) => (
    <div className="dm-choices" role="radiogroup">
      {items.map(([t, d]) => (
        <button key={t} type="button" role="radio" aria-checked={f[k] === t} className="dm-choice" data-on={f[k] === t || undefined} onClick={() => set(k, t)}>
          <strong>{t}</strong><span>{d}</span>
        </button>
      ))}
    </div>
  );
  const q = new URLSearchParams({ budget: String(badBudget ? MIN_BUDGET : budget), formats: f.format, goals: f.goal, market, industry });

  if (step === 5) {
    return (
      <div className="dm-card" style={{ padding: 32, maxWidth: 640 }}>
        <h1>That is a campaign, set up.</h1>
        <p style={{ marginTop: 10 }}>In the demo nothing is saved. Open your account and we build this for real: {f.format.toLowerCase()} ads for {f.goal.toLowerCase()} in {market}, starting at {usd(badBudget ? MIN_BUDGET : budget)}.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
          <Link className="dm-btn dm-btn-blue" href={`/open-account?${q}`}>Open your account with these settings</Link>
          <button type="button" className="dm-btn dm-btn-line" onClick={onCancel}>Back to campaigns</button>
        </div>
      </div>
    );
  }
  return (
    <div className="dm-builder">
      <div className="dm-col" style={{ paddingTop: 0 }}>
        <ol className="dm-stepper">{STEPS.map((t, i) => <li key={t} data-on={i === step || undefined} data-done={i < step || undefined}><span>{i + 1}</span>{t}</li>)}</ol>
        {step === 0 && (
          <>
            <div className="dm-card stack g12"><h3>Basic Info</h3>
              <label className="dm-k" htmlFor="b-name">Name *</label>
              <input id="b-name" className="dm-input" value={f.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="dm-card stack g12"><h3>Goal *</h3><Choice k="goal" items={GOALS} /></div>
            <div className="dm-card stack g12"><h3>Ad Format *</h3><Choice k="format" items={FORMATS} /></div>
          </>
        )}
        {step === 1 && <div className="dm-card stack g12"><h3>Audience *</h3><p>Pick who should see this campaign. In your own account we build these for you.</p>
          <Choice k="audience" items={[[`${market} · Adults 25 to 64`, "Everyone in your area in the age range you choose."], ["Website visitors · last 30 days", "People who already visited your website."], [`${industry} intent · ${market}`, `People showing interest in ${industry.toLowerCase()} services.`]]} /></div>}
        {step === 2 && <div className="dm-card stack g12"><h3>Price &amp; Optimization</h3><p>You are charged per 1,000 impressions, and you pay just above the next-highest bid, not your maximum.</p>
          <label style={{ display: "flex", gap: 10, alignItems: "center", minHeight: 44 }}><input type="checkbox" checked={f.optimize} onChange={(e) => set("optimize", e.target.checked)} style={{ width: 20, height: 20 }} /> Optimize automatically toward {f.goal.toLowerCase()}</label></div>}
        {step === 3 && <div className="dm-card stack g12"><h3>Budgets</h3>
          <label className="dm-k" htmlFor="b-budget">Total budget (US dollars) *</label>
          <input id="b-budget" className="dm-input" type="number" min={MIN_BUDGET} step={50} value={f.budget} onChange={(e) => set("budget", e.target.value)} style={{ maxWidth: 240 }} />
          {badBudget ? <p role="alert" style={{ color: "#9A3B00" }}>The smallest budget is ${MIN_BUDGET}.</p> : <p>Spend is paced evenly across the campaign.</p>}</div>}
        {step === 4 && <div className="dm-card stack g12"><h3>Traffic source</h3>
          <Choice k="source" items={[["All exchanges", "Run across every connected ad exchange."], ["Allowlist only", "Run only on the apps and sites you approve."]]} /></div>}
        <div className="dm-card" style={{ display: "flex", justifyContent: "flex-end", gap: 12, flexWrap: "wrap" }}>
          <button type="button" className="dm-btn dm-btn-line" onClick={step === 0 ? onCancel : () => setStep(step - 1)}>{step === 0 ? "Cancel" : "Back"}</button>
          <button type="button" className="dm-btn dm-btn-dark" disabled={step === 3 && badBudget} onClick={() => setStep(step + 1)}>{step === 4 ? "Finish" : "Next"}</button>
        </div>
      </div>
      <aside className="dm-summary"><h3>Summary</h3>
        <dl>{[["Status", "On"], ["Name", f.name], ["Goal", f.goal], ["Ad Format", f.format], ["Audience", f.audience], ["Budget", badBudget ? "" : usd(budget)], ["Traffic source", f.source]].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v || "Not set"}</dd></div>)}</dl>
      </aside>
    </div>
  );
}

const CLIENTS_ICON = "M4 20V8l8-4 8 4v12zM9 20v-6h6v6";

export default function Demo({ industry, market, agency = false }: { industry: string; market: string; agency?: boolean }) {
  const [sec, setSec] = useState<Sec>(agency ? "Clients" : "Explore");
  const [open, setOpen] = useState<Record<string, boolean>>({ Analytics: false, Planning: false });
  const [toast, setToast] = useState(false);
  const [tour, setTour] = useState<number | null>(-1);
  const [group, setGroup] = useState<"Date" | "Campaign" | "App">("Date");
  const [allowed, setAllowed] = useState<boolean | null>(null);
  useEffect(() => {
    let ok = false;
    try { ok = sessionStorage.getItem("demo_ok") === "1"; } catch {}
    setAllowed(ok);
  }, []);
  const { days, tot, campaigns, apps } = build(industry, market);
  const balance = usd(FUNDED - tot.spend);
  const locked = () => setToast(true);
  const Act = ({ children, kind = "dark" }: { children: React.ReactNode; kind?: "dark" | "line" }) => (
    <button type="button" className={`dm-btn dm-btn-${kind}`} onClick={locked}>{children}</button>
  );
  const Head = ({ title, action }: { title: string; action?: React.ReactNode }) => (
    <div className="dm-head"><h1>{title} <span className="dm-help" aria-hidden="true">?</span></h1>{action}</div>
  );
  const Search = () => <input className="dm-input" placeholder="Search" aria-label="Search" style={{ maxWidth: 320 }} />;

  if (allowed === null) return null;
  if (!allowed) {
    return (
      <main className="wrap" style={{ padding: "72px 32px", maxWidth: 560 }}>
        <div className="card stack g16" style={{ background: "var(--ground)" }}>
          <h1 className="h2" style={{ fontSize: 26 }}>See the demo</h1>
          <p className="p">Tell us your industry and area and we will open a sample account set up for a business like yours.</p>
          <LeadForm kind="market_check" cta="Open the demo" />
        </div>
      </main>
    );
  }

  const go = (s: Sec) => { setSec(s); setToast(false); };
  const stop = (i: number) => {
    setTour(i); setToast(false); setSec(TOUR[i][0]);
    if (TOUR[i][0] === "Analytics") { setOpen((o) => ({ ...o, Analytics: true })); setGroup("App"); }
  };
  const quick: [string, string, Sec | null, string][] = [
    ["1. Add a Tracking pixel URL", "Add a Tracking pixel URL to measure campaign performance accurately.", "Conversion Tracking", "Add the Tracking pixel URL"],
    ["2. Create a Campaign", "Start by creating your first Campaign to launch ads.", "Create new campaign", "Create a Campaign"],
    ["3. Find an Audience", "Build your first Audience using targeting segments, demographics, interests, and other data to improve campaign performance.", "Audience", "Create an Audience"],
    ["4. Set the Budgets", "Set daily and total Budgets so your spend is paced across the campaign.", null, ""],
    ["5. Add a Creative", "Upload or select a Creative from a 3rd Party Ad Tag, Creative Library, HTML5, or upload a file.", "Creative Assets", "Add a Creative"],
  ];

  return (
    <div className="dm">
      <aside className="dm-side">
        <div className="dm-logo"><Image src="/logo.png" alt="" width={28} height={28} style={{ background: "#fff", borderRadius: 6, padding: 2 }} /> DSP Connect</div>
        <nav aria-label="Platform sections">
          {(agency ? [{ label: "Clients", sec: "Clients" as Sec, icon: CLIENTS_ICON }, ...NAV] : NAV).map((item) =>
            item.children ? (
              <div key={item.label}>
                <button type="button" className="dm-nav" aria-expanded={!!open[item.label]} data-on={item.children.includes(sec) || undefined}
                  onClick={() => setOpen((o) => ({ ...o, [item.label]: !o[item.label] }))}>
                  <Icon d={item.icon} /><span>{item.label}</span><span aria-hidden="true" style={{ marginLeft: "auto" }}>{open[item.label] ? "▾" : "▸"}</span>
                </button>
                {open[item.label] && item.children.map((c) => (
                  <button key={c} type="button" className="dm-nav dm-sub" data-on={sec === c || undefined} aria-current={sec === c ? "page" : undefined} onClick={() => go(c)}><span>{c}</span></button>
                ))}
              </div>
            ) : (
              <button key={item.label} type="button" className="dm-nav" data-on={sec === item.sec || undefined} aria-current={sec === item.sec ? "page" : undefined} onClick={() => go(item.sec!)}>
                <Icon d={item.icon} /><span>{item.label}</span>
              </button>
            ),
          )}
        </nav>
      </aside>

      <div className="dm-main">
        <header className="dm-top">
          <div className="dm-crumb"><span aria-hidden="true">⌂</span> / {sec}</div>
          <div className="dm-top-r">
            <span>Balance: <strong style={{ color: "#0B7A3B" }}>{balance}</strong></span>
            <span>UTC-07:00</span><span>EN</span><span>{agency ? "Demo Agency" : "Demo User"}</span>
            <Link className="dm-btn dm-btn-blue" href={agency ? "/agencies" : "/open-account"}>{agency ? "Ask about an agreement" : "Open your account"}</Link>
          </div>
        </header>
        <div className="dm-note">{agency ? "Demo agency account with sample clients and sample data. Not real results." : `Demo account with sample data for a ${industry.toLowerCase()} business in ${market}. Not real results.`}</div>

        <div className="dm-body">
          {tour !== null && !agency && sec !== "Create new campaign" && (
            <div className="dm-tour" role="region" aria-label="Guided tour">
              {tour === -1 ? (
                <>
                  <div><strong>New here?</strong> Take the one-minute tour of what you get.</div>
                  <div className="dm-tour-b"><button type="button" className="dm-btn dm-btn-line" onClick={() => setTour(null)}>No thanks</button><button type="button" className="dm-btn dm-btn-blue" onClick={() => stop(0)}>Start the tour</button></div>
                </>
              ) : (
                <>
                  <div><span className="dm-k">Stop {tour + 1} of {TOUR.length}</span><br /><strong>{TOUR[tour][1]}.</strong> {TOUR[tour][2]}</div>
                  <div className="dm-tour-b">
                    {tour > 0 && <button type="button" className="dm-btn dm-btn-line" onClick={() => stop(tour - 1)}>Back</button>}
                    {tour < TOUR.length - 1
                      ? <button type="button" className="dm-btn dm-btn-blue" onClick={() => stop(tour + 1)}>Next</button>
                      : <button type="button" className="dm-btn dm-btn-blue" onClick={() => { setTour(null); go("Create new campaign"); }}>Now build a campaign</button>}
                  </div>
                </>
              )}
            </div>
          )}
          {sec === "Create new campaign" && <Builder industry={industry} market={market} onCancel={() => go("Campaigns")} />}

          {toast && <div className="dm-toast" role="status">This is a demo, so nothing is saved. <Link href="/open-account">Open your account</Link> to do this for real.</div>}

          {sec === "Clients" && (() => {
            const rows: [string, string, number][] = [[`${industry} client · ${market}`, industry, tot.spend], ["Auto dealer client", "Automotive", 12640], ["Dental practice client", "Healthcare", 8930.4], ["Home repair client", "Home Services", 6105.3], ["Real estate client", "Real Estate", 2210.75]];
            const total = rows.reduce((a, r) => a + r[2], 0);
            return (
              <>
                <Head title="Clients" action={<Act>⊕ Add client</Act>} />
                <div className="dm-kpis">
                  {[["Clients", String(rows.length)], ["Managed spend, last 14 days", usd(total)], [`Your ${SHARE_PCT}% revenue share`, usd((total * SHARE_PCT) / 100)]].map(([k, v]) => (
                    <div className="dm-card" key={k}><div className="dm-k">{k}</div><div className="dm-v">{v}</div></div>
                  ))}
                </div>
                <p>Every client has their own login and sees only their own campaigns. You see all of them here.</p>
                <Table head={["Client", "Industry", "Own login", "Status", "Spend, last 14 days", `Your ${SHARE_PCT}% share`]}
                  rows={rows.map(([name, ind, spend]) => [name, ind, "Yes", "Active", usd(spend), usd((spend * SHARE_PCT) / 100)])} />
                <div><button type="button" className="dm-btn dm-btn-line" onClick={() => go("Dashboard")}>Open the first client&apos;s account</button></div>
              </>
            );
          })()}

          {sec === "Explore" && (
            <>
              <div className="dm-card" style={{ padding: 32 }}>
                <h1 style={{ fontSize: 22 }}>Welcome to DSP Connect!</h1>
                <p style={{ maxWidth: 520, marginTop: 12 }}>Here you&apos;ll find diverse ad formats and top-quality traffic. This demo account shows what yours looks like once we have set it up.</p>
                <button type="button" className="dm-link" onClick={() => go("Dashboard")} style={{ marginTop: 16 }}>View the dashboard</button>
              </div>
              <div><h2 className="dm-h2">Quick Start Guide</h2><p>How a campaign goes from zero to live. In your own account we do these steps for you.</p></div>
              {quick.map(([t, d, to, cta], i) => (
                <div className="dm-card dm-step" key={t}>
                  <div className="dm-step-art" aria-hidden="true">{i + 1}</div>
                  <div><h3>{t}</h3><p style={{ marginTop: 6 }}>{d}</p>
                    {to && <button type="button" className="dm-btn dm-btn-line" style={{ marginTop: 12 }} onClick={() => go(to)}>⊕ {cta}</button>}
                  </div>
                </div>
              ))}
              <div><h2 className="dm-h2">What&apos;s new?</h2></div>
              <div className="dm-card" style={{ padding: 32, maxWidth: 480 }}>
                <h3>Audiences</h3>
                <p style={{ marginTop: 8 }}>Targeting decoupled from campaigns — create reusable Audiences with full targeting setups, then link them to campaigns.</p>
                <button type="button" className="dm-link" onClick={() => go("Audience")} style={{ marginTop: 12 }}>Read more</button>
              </div>
            </>
          )}

          {sec === "Dashboard" && (
            <>
              <Head title="Dashboard" action={<span className="dm-date">Last 14 days</span>} />
              <div className="dm-kpis">
                {[["Spend", usd(tot.spend)], ["Impressions", n(tot.imp)], ["Clicks", n(tot.clicks)], ["CTR", pct(tot.clicks / tot.imp)], ["Conversions", n(tot.conv)]].map(([k, v]) => (
                  <div className="dm-card" key={k}><div className="dm-k">{k}</div><div className="dm-v">{v}</div></div>
                ))}
              </div>
              <div className="dm-card"><div className="dm-k" style={{ marginBottom: 12 }}>Impressions by day</div><Chart days={days} /></div>
              <Table head={["Campaign", "Status", "Spend", "Impressions", "Clicks", "CTR", "Conversions"]}
                rows={campaigns.map((c) => [c.name, c.status, usd(c.spend), n(c.imp), n(c.clicks), pct(c.clicks / c.imp), n(c.conv)])} />
            </>
          )}

          {sec === "Campaigns" && (
            <div className="dm-split">
              <div className="dm-folders">
                <div className="dm-folder" data-on>All campaigns ({campaigns.length})</div>
                <div className="dm-k" style={{ margin: "16px 0 8px" }}>Folders</div>
                <div className="dm-folder">{industry} ({campaigns.length})</div>
                <div className="dm-folder">Unsorted (0)</div>
              </div>
              <div className="dm-col">
                <Head title="All campaigns" action={<button type="button" className="dm-btn dm-btn-dark" onClick={() => go("Create new campaign")}>⊕ Create new Campaign</button>} />
                <div className="dm-card dm-filters"><Search /><span className="dm-pill">Status: Active, Inactive</span><span className="dm-pill">Budget: All</span></div>
                <Table head={["ID", "Name", "Status", "Media type", "Total budget", "Spend", "Impressions", "Clicks"]}
                  rows={campaigns.map((c) => [c.id, c.name, c.status, c.format, usd(c.budget), usd(c.spend), n(c.imp), n(c.clicks)])} />
                <p className="dm-count">{campaigns.length} items</p>
              </div>
            </div>
          )}

          {sec === "Audience" && (
            <>
              <Head title="Audience" action={<Act>⊕ Create new Audience</Act>} />
              <div className="dm-card dm-filters"><Search /><span className="dm-pill">Status: Active</span></div>
              <Table head={["Name", "Linked Campaigns", "Created", "Edited", "Status"]} rows={[
                [`${market} · Adults 25 to 64`, 2, "Day 1", "Day 6", "Active"],
                ["Website visitors · last 30 days", 1, "Day 1", "Day 1", "Active"],
                [`${industry} intent · ${market}`, 1, "Day 3", "Day 9", "Active"],
              ]} />
              <p className="dm-count">3 items</p>
            </>
          )}

          {sec === "Conversion Tracking" && (
            <>
              <Head title="Conversion Tracking" />
              <p>Track conversions using S2S Postbacks or Client-Side browser scripts.</p>
              <div className="dm-info">Three default conversion events are tracked: landing page click, registration and purchase. Events are flexible and can be renamed to match your business.</div>
              <div className="dm-tabs"><span data-on>S2S Tracking</span><span>Client-Side Tracking</span></div>
              <div className="dm-card">
                <h3>TL;DR</h3>
                <p style={{ marginTop: 10 }}>You can use any tracking platform to track conversions. The postback URL lets you see those conversions in Analytics.</p>
                <ol style={{ margin: "12px 0 0", paddingLeft: 18, lineHeight: 1.8, fontSize: 14 }}>
                  <li>Add the click ID to your ad&apos;s target URL.</li><li>Set up your tracking platform to capture it.</li><li>Fire the postback URL when a conversion happens.</li>
                </ol>
                <div className="dm-code">https://track.getdspconnect.example/postback?token=[CLICK_ID]&amp;event=[EVENT]</div>
              </div>
            </>
          )}

          {sec === "Analytics" && (
            <>
              <Head title="Analytics" action={<span className="dm-date">Last 14 days</span>} />
              <div className="dm-card dm-filters">
                <span>Group by:</span>
                {(["Date", "Campaign", "App"] as const).map((g) => <button key={g} type="button" className="dm-pill" data-on={group === g || undefined} aria-pressed={group === g} onClick={() => setGroup(g)}>{g === "App" ? "App or site" : g}</button>)}
                <span style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}><Act kind="line">Export to CSV</Act><Act>Get Report</Act></span>
              </div>
              {group === "Date" && <div className="dm-card"><Chart days={days} /></div>}
              <Table head={[group === "App" ? "App or site" : group, "Impressions", "Clicks", "CTR", "Spend"]}
                rows={(group === "Date" ? days.map((d) => ({ name: d.day, ...d })) : group === "Campaign" ? campaigns : apps).map((r) => [r.name, n(r.imp), n(r.clicks), pct(r.clicks / r.imp), usd(r.spend)])} />
            </>
          )}

          {sec === "Traffic Funnel" && (
            <>
              <Head title="Traffic Funnel" action={<span className="dm-date">Last 14 days</span>} />
              <div className="dm-card">
                {[["Bids placed", 1], ["Auctions won", 0.46], ["Impressions", 0.44], ["Clicks", 0.44 * (tot.clicks / tot.imp) * 40]].map(([k, w], i) => (
                  <div key={k as string} style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0" }}>
                    <div style={{ width: 130, fontSize: 14 }}>{k}</div>
                    <div style={{ flexGrow: 1, background: "#EEF0F5", borderRadius: 3 }}><div style={{ width: `${Math.max(4, (w as number) * 100)}%`, height: 16, background: "#0A4FD6", borderRadius: 3 }} /></div>
                    <div className="dm-mono" style={{ width: 110, textAlign: "right" }}>{n([tot.imp / 0.44, (tot.imp / 0.44) * 0.46, tot.imp, tot.clicks][i])}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {sec === "Creative Assets" && (
            <div className="dm-split">
              <div className="dm-folders"><div className="dm-folder" data-on>All assets</div><div className="dm-k" style={{ margin: "16px 0 8px" }}>Folders</div><div className="dm-folder">Unsorted</div></div>
              <div className="dm-col">
                <Head title="Creative Assets" action={<Act>Upload Asset</Act>} />
                <div className="dm-tabs"><span data-on>Images (3)</span><span>Videos (1)</span><span>HTML5 (0)</span></div>
                <div className="dm-card dm-filters"><Search /></div>
                <Table head={["Name", "Dimensions", "File Size (KB)", "Type"]} rows={[
                  [`${industry.toLowerCase()}-banner-300x250`, "300 × 250", 48, "JPG"], [`${industry.toLowerCase()}-banner-728x90`, "728 × 90", 39, "JPG"], [`${industry.toLowerCase()}-native-1200x627`, "1200 × 627", 112, "PNG"],
                ]} />
              </div>
            </div>
          )}

          {sec === "Allowlist / Blocklist" && (
            <>
              <Head title="Allowlist / Blocklist" action={<Act>⊕ Create new Allowlist / Blocklist</Act>} />
              <div className="dm-card dm-filters"><Search /><span className="dm-pill">Type: All</span><span className="dm-pill">Category: All</span></div>
              <Table head={["Name", "Type", "Category", "Linked Campaigns", "Items", "Status"]} rows={[
                ["Top performers", "Allowlist", "Site Domain / App Bundle", 2, 18, "Published"], ["Low CTR", "Blocklist", "Site Domain / App Bundle", 3, 42, "Published"], [`${market} only`, "Allowlist", "Region", 3, 1, "Published"],
              ]} />
            </>
          )}

          {sec === "Retargeting" && (
            <>
              <Head title="Retargeting" action={<Act>⊕ Create new list</Act>} />
              <Table head={["Name", "Type", "Linked Campaigns", "Users", "Status"]} rows={[["Website visitors · last 30 days", "Pixel", 1, n(4180), "Active"], ["Clicked an ad · last 14 days", "Campaign", 1, n(tot.clicks), "Active"]]} />
            </>
          )}

          {sec === "Custom Locations" && (
            <>
              <Head title="Custom Locations" action={<Act>⊕ Add Location</Act>} />
              <div className="dm-card dm-filters"><Search /></div>
              <Table head={["Name", "Type", "Linked Audiences", "Items"]} rows={[[`${market} service area`, "Geo-fence", 2, 1], ["Competitor locations", "Geo-fence", 1, 6]]} />
              <p className="dm-count">2 items</p>
            </>
          )}

          {sec === "Billing" && (
            <>
              <Head title="Billing" action={<Act>Add funds</Act>} />
              <div className="dm-card"><div className="dm-k">Payment Method</div><div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}><span className="dm-pill" data-on>Card</span><span className="dm-pill">Bank transfer</span></div></div>
              <h2 className="dm-h2" style={{ fontSize: 16 }}>Transaction history</h2>
              <Table head={["ID", "Date", "Description", "Type", "Amount", "Balance", "Payment Method", "Status"]} rows={[
                [20311, "Day 1", "Ad budget", "Deposit", usd(FUNDED), usd(FUNDED), "Card", "Completed"],
                [20388, "Day 14", "Ad spend to date", "Spend", "-" + usd(tot.spend), balance, "", "Completed"],
              ]} />
            </>
          )}

          {sec === "Media plannings" && (
            <>
              <Head title="Media plannings" action={<span className="dm-date">Today</span>} />
              <div className="dm-card dm-filters"><span className="dm-pill">Group by: Type</span><span className="dm-pill">Add filter</span>
                <span style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}><Act kind="line">Export to CSV</Act><Act>Get Report</Act></span></div>
              <Table head={["Type", "Bid Requests"]} rows={[["Banner", n(18400000)], ["Video", n(6900000)], ["Native", n(4200000)]]} />
              <p className="dm-count">3 items · {market}</p>
            </>
          )}

          {sec === "Autopilot" && (
            <>
              <Head title="Autopilot" action={<Act>⊕ Create new Rule</Act>} />
              <p>Bidding Rules apply changes to your campaign automatically, on a simple if-then formula.</p>
              <Table head={["Rule", "If", "Then", "Checks", "Status"]} rows={[
                ["Remove Low CTR", "Impressions > 100 and CTR < 0.2%", "Add app or site to Low CTR blocklist", "Every hour", "Active"],
                ["Boost top performers", "Conversions > 3", "Raise bid by 20%", "Every 3 hours", "Active"],
              ]} />
              <div className="dm-card"><div className="dm-k">Autopilot Log</div><p style={{ marginTop: 8 }}>Day 12: 4 apps added to the Low CTR blocklist. Day 9: bid raised on 2 sites.</p></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
