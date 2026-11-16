"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import LeadForm from "./LeadForm";
import { MIN_BUDGET } from "@/lib/site";

const TABS = ["Dashboard", "Campaigns", "Analytics", "Audience", "Billing"] as const;
type Tab = (typeof TABS)[number];

// Sample figures only. Fixed numbers so every visitor sees the same consistent account.
const DAYS = [41200, 43850, 39900, 46300, 48750, 52100, 44600, 47900, 51300, 49800, 55200, 57400, 53900, 58600];
const CTR = [0.0041, 0.0043, 0.004, 0.0046, 0.0047, 0.0049, 0.0044, 0.0048, 0.005, 0.0049, 0.0052, 0.0054, 0.0051, 0.0055];
const CPM = 6.4; // sample client price per 1,000 views
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
  const names = [`${industry} · Video · ${market}`, `${industry} · Banner · Returning visitors`, `${industry} · Native · New customers`];
  const campaigns = names.map((name, i) => ({
    name, status: i === 2 ? "Paused" : "Active", format: ["Video", "Banner", "Native"][i],
    imp: tot.imp * split[i], clicks: tot.clicks * split[i], spend: tot.spend * split[i], conv: tot.conv * split[i],
  }));
  const apps = [["News and weather apps", 0.28], ["Local news websites", 0.22], ["Games", 0.19], ["Streaming and video apps", 0.17], ["Lifestyle websites", 0.14]].map(
    ([name, s]) => ({ name: name as string, imp: tot.imp * (s as number), clicks: tot.clicks * (s as number) }),
  );
  return { days, tot, campaigns, apps };
}

function Chart({ days }: { days: { imp: number }[] }) {
  const max = Math.max(...days.map((d) => d.imp));
  const W = 700, H = 180, step = W / (days.length - 1);
  const pts = days.map((d, i) => `${(i * step).toFixed(1)},${(H - (d.imp / max) * (H - 20)).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Views per day over the last 14 days, rising overall" style={{ width: "100%", height: "auto", display: "block" }}>
      {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="#DCE1E9" strokeWidth="1" />)}
      <polyline points={pts} fill="none" stroke="#0A4FD6" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

export default function Demo({ industry, market }: { industry: string; market: string }) {
  const [tab, setTab] = useState<Tab>("Dashboard");
  const [allowed, setAllowed] = useState<boolean | null>(null);
  useEffect(() => {
    let ok = false;
    try { ok = sessionStorage.getItem("demo_ok") === "1"; } catch {}
    setAllowed(ok);
  }, []);
  const { days, tot, campaigns, apps } = build(industry, market);

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

  const kpis: [string, string][] = [["Spent", usd(tot.spend)], ["Views", n(tot.imp)], ["Clicks", n(tot.clicks)], ["Click rate", pct(tot.clicks / tot.imp)], ["Leads tracked", n(tot.conv)]];
  return (
    <div className="demo">
      <aside className="demo-side">
        <Link href="/" className="brand" style={{ color: "#fff", padding: "0 8px 20px" }}>
          <Image src="/logo.png" alt="" width={26} height={26} style={{ background: "#fff", borderRadius: 6, padding: 2 }} /> DSP Connect
        </Link>
        <nav aria-label="Demo sections" className="demo-nav">
          {TABS.map((t) => (
            <button key={t} type="button" aria-current={tab === t ? "page" : undefined} onClick={() => setTab(t)}>{t}</button>
          ))}
        </nav>
      </aside>
      <div className="demo-main">
        <div className="demo-top">
          <div><strong>Demo account</strong> <span className="small">Sample data for a {industry.toLowerCase()} business in {market}. Not real results.</span></div>
          <Link className="btn btn-blue" href="/open-account">Open your account</Link>
        </div>
        <div className="demo-body stack g24">
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
            <h1 className="h2" style={{ fontSize: 24 }}>{tab}</h1>
            <span className="small mono">Last 14 days · Balance: {usd(6000 - tot.spend)}</span>
          </div>

          {tab === "Dashboard" && (
            <>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
                {kpis.map(([k, v]) => <div className="tile" key={k} style={{ background: "#fff" }}><div className="small">{k}</div><div className="money" style={{ marginTop: 4 }}>{v}</div></div>)}
              </div>
              <div className="card stack g12"><div style={{ fontSize: 14, fontWeight: 600 }}>Views per day</div><Chart days={days} /></div>
            </>
          )}

          {tab === "Campaigns" && (
            <div className="tablebox" style={{ background: "#fff" }}>
              <table>
                <thead><tr><th scope="col">Campaign</th><th scope="col">Status</th><th scope="col">Format</th><th scope="col">Spent</th><th scope="col">Views</th><th scope="col">Clicks</th><th scope="col">Leads</th></tr></thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c.name}><th scope="row">{c.name}</th><td>{c.status}</td><td>{c.format}</td><td className="mono">{usd(c.spend)}</td><td className="mono">{n(c.imp)}</td><td className="mono">{n(c.clicks)}</td><td className="mono">{n(c.conv)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "Analytics" && (
            <>
              <div className="tablebox" style={{ background: "#fff" }}>
                <table>
                  <thead><tr><th scope="col">Where your ads ran</th><th scope="col">Views</th><th scope="col">Clicks</th><th scope="col">Click rate</th></tr></thead>
                  <tbody>{apps.map((a) => <tr key={a.name}><th scope="row">{a.name}</th><td className="mono">{n(a.imp)}</td><td className="mono">{n(a.clicks)}</td><td className="mono">{pct(a.clicks / a.imp)}</td></tr>)}</tbody>
                </table>
              </div>
              <div className="tablebox" style={{ background: "#fff" }}>
                <table>
                  <thead><tr><th scope="col">Day</th><th scope="col">Spent</th><th scope="col">Views</th><th scope="col">Clicks</th><th scope="col">Leads</th></tr></thead>
                  <tbody>{days.map((d) => <tr key={d.day}><th scope="row">{d.day}</th><td className="mono">{usd(d.spend)}</td><td className="mono">{n(d.imp)}</td><td className="mono">{n(d.clicks)}</td><td className="mono">{n(d.conv)}</td></tr>)}</tbody>
                </table>
              </div>
            </>
          )}

          {tab === "Audience" && (
            <div className="grid cols-3">
              {[["Where", market], ["Who", `People likely to need a ${industry.toLowerCase()} business`], ["Devices", "Phones, tablets and computers"], ["Formats", "Video, banner and native"], ["Blocked", "Apps and sites you choose to exclude"], ["Returning visitors", "People who already visited your website"]].map(([k, v]) => (
                <div className="tile" key={k} style={{ background: "#fff" }}><div className="k">{k}</div><div className="v">{v}</div></div>
              ))}
            </div>
          )}

          {tab === "Billing" && (
            <div className="tablebox" style={{ background: "#fff" }}>
              <table>
                <thead><tr><th scope="col">Date</th><th scope="col">Description</th><th scope="col">Amount</th><th scope="col">Balance</th></tr></thead>
                <tbody>
                  <tr><th scope="row">Day 1</th><td>Ad budget added by card</td><td className="mono">{usd(6000)}</td><td className="mono">{usd(6000)}</td></tr>
                  <tr><th scope="row">Day 14</th><td>Ad spend to date</td><td className="mono">-{usd(tot.spend)}</td><td className="mono">{usd(6000 - tot.spend)}</td></tr>
                </tbody>
              </table>
            </div>
          )}

          <p className="small">This is a demonstration with sample data. Your own account shows your real campaigns. Budgets start at ${MIN_BUDGET}.</p>
        </div>
      </div>
    </div>
  );
}
