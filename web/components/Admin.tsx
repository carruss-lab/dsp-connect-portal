"use client";
import { createClient, type Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { INDUSTRIES, SETUP_DAYS } from "@/lib/site";

type Lead = {
  id: string; created_at: string; kind: string; email: string; name: string | null; business: string | null; phone: string | null;
  industry: string | null; market: string | null; budget: number | null; formats: string | null; goals: string | null; monthly_spend: string | null; source: string | null;
  status: string; partner_id: string | null; paid_at: string | null; amount_paid: number | null; setup_due: string | null;
  step_account_at: string | null; step_tracking_at: string | null; step_ads_at: string | null; step_audience_at: string | null; live_at: string | null;
};
type Partner = { id: string; created_at: string; status: string; name: string; email: string; phone: string | null; location: string | null; vertical: string | null; linkedin: string | null; experience: string | null; network: string | null; code: string; invite_token: string; stripe_account_id: string | null; payouts_ready: boolean };
type Notice = { id: string; kind: string; to_email: string; title: string | null; created_at: string; sent_at: string | null; error: string | null };
type Line = { id: string; partner_id: string; lead_id: string; day: string; spend: number; amount: number; release_on: string; status: string };
const STEPS: [keyof Lead, string][] = [
  ["step_account_at", "Account created"], ["step_tracking_at", "Tracking placed"], ["step_ads_at", "Ads approved"], ["step_audience_at", "Audience built"],
];
const KIND: Record<string, string> = { market_check: "Opened the demo", account: "Started sign-up", agency: "Agency enquiry" };
const day = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const usd = (v: number) => "$" + Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 });

export default function Admin() {
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_KEY;
    return url && key ? createClient(url, key) : null;
  }, []);
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [ask, setAsk] = useState<{ id: string; key: keyof Lead; label: string } | null>(null);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) setMsg("Could not load: " + error.message);
    else setLeads(data as Lead[]);
    const p = await supabase.from("partners").select("*").order("created_at", { ascending: false }).limit(500);
    if (!p.error) setPartners(p.data as Partner[]);
    const c = await supabase.from("commissions").select("*").order("day", { ascending: false }).limit(1000);
    if (!c.error) setLines(c.data as Line[]);
    const n = await supabase.from("notices").select("*").order("created_at", { ascending: false }).limit(40);
    if (!n.error) setNotices(n.data as Notice[]);
  }, [supabase]);
  useEffect(() => { if (session) load(); }, [session, load]);

  if (!supabase) return <main className="wrap" style={{ padding: 64 }}><p className="note note-err">The back office is not connected yet.</p></main>;
  if (session === undefined) return null;

  if (!session) {
    return (
      <main className="wrap" style={{ padding: "96px 32px", maxWidth: 480 }}>
        <div className="card stack g16" style={{ background: "var(--ground)" }}>
          <h1 className="h2" style={{ fontSize: 24 }}>DSP Connect back office</h1>
          <p className="p">Enter your work email and we will send you a sign-in link.</p>
          <form className="stack g12" onSubmit={async (e) => {
            e.preventDefault(); setBusy(true); setMsg("");
            const { error } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { emailRedirectTo: location.origin + "/admin" } });
            setBusy(false);
            setMsg(error ? "Could not send the link: " + error.message : "Check your email for the sign-in link.");
          }}>
            <div className="field"><label htmlFor="adm-email">Work email</label><input id="adm-email" className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <button className="btn btn-ink" disabled={busy}>{busy ? "Sending…" : "Email me a sign-in link"}</button>
          </form>
          {msg && <p className="note note-ok" role="status">{msg}</p>}
        </div>
      </main>
    );
  }

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const left = (l: Lead) => (l.setup_due ? Math.round((new Date(l.setup_due + "T00:00:00").getTime() - today.getTime()) / 86400000) : null);
  const paid = (leads || []).filter((l) => l.paid_at);
  const setup = paid.filter((l) => !l.live_at).sort((a, b) => (left(a) ?? 99) - (left(b) ?? 99));
  const live = paid.filter((l) => l.live_at);
  const others = (leads || []).filter((l) => !l.paid_at);

  async function patch(id: string, change: Partial<Lead>) {
    setMsg("");
    setLeads((ls) => (ls || []).map((l) => (l.id === id ? { ...l, ...change } : l)));
    const { error } = await supabase!.from("leads").update(change).eq("id", id);
    if (error) { setMsg("Could not save: " + error.message); load(); return false; }
    return true;
  }
  /** Saves a change the client should hear about, then sends their email straight away. */
  async function patchAndTell(id: string, change: Partial<Lead>) {
    setAsk(null); setNote("");
    if (!(await patch(id, change))) return;
    await tell({ lead: id });
  }
  async function tell(body: { lead?: string; weekly?: boolean }) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/notify", { method: "POST", headers: { Authorization: `Bearer ${session!.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || "Could not send.");
      setNote(!out.emailOn ? "Saved. Email is not connected yet, so no message was sent."
        : [out.sent.length ? `Sent: ${out.sent.join("; ")}` : "Saved. No new messages were due.", out.failed.length ? `Failed: ${out.failed.join("; ")}` : ""].filter(Boolean).join(" "));
    } catch (err) { setMsg(err instanceof Error ? err.message : "Could not send."); }
    setBusy(false); load();
  }

  async function invite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMsg("");
    const form = e.currentTarget; const d = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const { error } = await supabase!.from("partners").insert({ name: d.name.trim(), email: d.email.trim().toLowerCase(), vertical: d.vertical, invited_by: session!.user.email });
    if (error) setMsg(error.code === "23505" ? "That email is already on the partner list." : "Could not save: " + error.message);
    else { form.reset(); load(); }
  }

  async function setPartnerStatus(id: string, status: string) {
    setMsg("");
    setPartners((ps) => ps.map((p) => (p.id === id ? { ...p, status } : p)));
    const { error } = await supabase!.from("partners").update({ status }).eq("id", id);
    if (error) { setMsg("Could not save: " + error.message); load(); }
  }
  async function addSpend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMsg(""); setNote("");
    const form = e.currentTarget; const d = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const amount = Number(d.amount);
    if (!d.lead_id || !d.day || !Number.isFinite(amount) || amount < 0) { setMsg("Choose a client, a date and an amount."); return; }
    const { error } = await supabase!.from("spend_entries").upsert({ lead_id: d.lead_id, day: d.day, amount, entered_by: session!.user.email }, { onConflict: "lead_id,day" });
    if (error) setMsg("Could not save: " + error.message);
    else { setNote("Spend saved."); load(); }
  }
  async function setLine(ids: string[], status: "approved" | "pending" | "reversed") {
    setMsg("");
    const { error } = await supabase!.from("commissions").update({ status, approved_by: session!.user.email }).in("id", ids);
    if (error) setMsg("Could not save: " + error.message);
    load();
  }
  async function runPayout() {
    setMsg(""); setNote(""); setBusy(true);
    try {
      const res = await fetch("/api/admin/payout", { method: "POST", headers: { Authorization: `Bearer ${session!.access_token}` } });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || "The payout run failed.");
      const paidTxt = (out.paid || []).map((x: { partner: string; amount: number }) => `${x.partner}: ${usd(x.amount)}`).join("; ");
      const skipTxt = (out.skipped || []).map((x: { partner: string; reason: string }) => `${x.partner}: ${x.reason}`).join("; ");
      setNote(out.message || [paidTxt && "Paid " + paidTxt, skipTxt && "Not paid: " + skipTxt].filter(Boolean).join(". "));
    } catch (err) { setMsg(err instanceof Error ? err.message : "The payout run failed."); }
    setBusy(false); load();
  }
  const isoToday = new Date().toISOString().slice(0, 10);
  const pname = (id: string) => partners.find((p) => p.id === id)?.name || "Unknown partner";
  const lname = (id: string) => (leads || []).find((l) => l.id === id)?.business || "Client";
  const open = lines.filter((l) => l.status === "pending" || l.status === "approved");
  const dueApproved = open.filter((l) => l.status === "approved" && l.release_on <= isoToday);
  const sum = (ls: Line[]) => ls.reduce((a, l) => a + Number(l.amount), 0);

  return (
    <main className="wrap stack g32" style={{ padding: "40px 32px 80px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="h2" style={{ fontSize: 26 }}>Back office</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span className="small">{session.user.email}</span>
          <button className="btn btn-line" onClick={load}>Refresh</button>
          <button className="btn btn-line" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </div>
      {msg && <p className="note note-err" role="alert">{msg}</p>}
      {leads && leads.length === 0 && <p className="note note-err">Nothing to show. If you expected sign-ups here, your email may not be on the staff list.</p>}

      <section className="stack g16">
        <h2 className="h3" style={{ fontSize: 18 }}>In setup ({setup.length})</h2>
        <p className="small">Paid clients who are not live yet. Each must be live within {SETUP_DAYS} days of paying. Most urgent first.</p>
        {setup.length === 0 && <p className="p">No clients in setup.</p>}
        {setup.map((l) => {
          const d = left(l); const done = STEPS.filter(([k]) => l[k]).length;
          const tone = d === null ? "" : d < 0 ? "bo-late" : d <= 3 ? "bo-soon" : "";
          return (
            <article key={l.id} className={`card stack g16 ${tone}`}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "baseline" }}>
                <div><div className="h3">{l.business || l.email}</div><div className="small">{l.name} · <a href={`mailto:${l.email}`}>{l.email}</a>{l.phone ? ` · ${l.phone}` : ""}</div></div>
                <div style={{ textAlign: "right" }}>
                  <div className="money">{d === null ? "" : d < 0 ? `${-d} days late` : d === 0 ? "Due today" : `${d} days left`}</div>
                  <div className="small">Paid {usd(l.amount_paid || 0)} on {day(l.paid_at!)} · due {l.setup_due ? day(l.setup_due + "T00:00:00") : ""}</div>
                </div>
              </div>
              <div className="small" style={{ color: "var(--body)" }}>{[l.industry, l.market, l.formats, l.goals].filter(Boolean).join(" · ")}</div>
              <div className="ticks">
                {STEPS.map(([k, label]) => (
                  <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44 }}>
                    <input type="checkbox" checked={!!l[k]} onChange={(e) => (e.target.checked ? setAsk({ id: l.id, key: k, label }) : patch(l.id, { [k]: null }))} style={{ width: 20, height: 20 }} /> {label}
                  </label>
                ))}
              </div>
              {ask?.id === l.id && (
                <div className="note note-ok" role="alertdialog" aria-label="Confirm" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <span>Mark &ldquo;{ask.label}&rdquo; as done? {l.email} will be emailed.</span>
                  <button className="btn btn-blue" style={{ minHeight: 36 }} disabled={busy} onClick={() => patchAndTell(l.id, ask.key === "live_at" ? { live_at: new Date().toISOString(), status: "live" } : { [ask.key]: new Date().toISOString() })}>Yes, save and email</button>
                  <button className="btn btn-line" style={{ minHeight: 36 }} onClick={() => setAsk(null)}>Cancel</button>
                </div>
              )}
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <button className="btn btn-blue" disabled={done < STEPS.length} onClick={() => setAsk({ id: l.id, key: "live_at", label: "Live" })}>Mark as live</button>
                <span className="small">{done} of {STEPS.length} steps done{done < STEPS.length ? ". Finish all four to mark as live." : ""}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="stack g16">
        <h2 className="h3" style={{ fontSize: 18 }}>Live clients ({live.length})</h2>
        {live.length > 0 && (
          <div className="tablebox"><table>
            <thead><tr><th scope="col">Business</th><th scope="col">Email</th><th scope="col">Paid</th><th scope="col">Went live</th><th scope="col">On time</th></tr></thead>
            <tbody>{live.map((l) => (
              <tr key={l.id}><th scope="row">{l.business}</th><td>{l.email}</td><td>{usd(l.amount_paid || 0)}</td><td>{day(l.live_at!)}</td>
                <td>{l.setup_due && l.live_at!.slice(0, 10) <= l.setup_due ? "Yes" : "No"}</td></tr>
            ))}</tbody>
          </table></div>
        )}
      </section>

      <section className="stack g16">
        <h2 className="h3" style={{ fontSize: 18 }}>Managing Partners ({partners.length})</h2>
        <p className="small">Invite only. Adding someone here puts them on the partner list. Copy their invitation link and send it to them; it lets them set up their Stripe payout account. Set the status to Admitted once their admission is signed, so their client link starts crediting them.</p>
        <form onSubmit={invite} className="card" style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end", background: "var(--ground)" }}>
          <div className="field" style={{ flex: "1 1 180px" }}><label htmlFor="inv-name">Full name</label><input id="inv-name" name="name" className="input" required /></div>
          <div className="field" style={{ flex: "1 1 220px" }}><label htmlFor="inv-email">Email</label><input id="inv-email" name="email" type="email" className="input" required /></div>
          <div className="field" style={{ flex: "1 1 180px" }}><label htmlFor="inv-vertical">Industry</label>
            <select id="inv-vertical" name="vertical" className="input">{INDUSTRIES.map((i) => <option key={i}>{i}</option>)}</select></div>
          <button className="btn btn-blue">Add to partner list</button>
        </form>
        {partners.length > 0 && (
          <div className="tablebox"><table>
            <thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Industry</th><th scope="col">Status</th><th scope="col">Payout account</th><th scope="col">Client code</th><th scope="col">Invitation link</th></tr></thead>
            <tbody>{partners.map((p) => (
              <tr key={p.id}><th scope="row">{p.name}</th><td><a href={`mailto:${p.email}`}>{p.email}</a></td><td>{p.vertical}</td>
                <td><select className="input" aria-label={`Status for ${p.name}`} value={p.status} onChange={(e) => setPartnerStatus(p.id, e.target.value)} style={{ height: 36, minWidth: 110 }}>
                  {["invited", "admitted", "active", "paused", "ended"].map((st) => <option key={st} value={st}>{st[0].toUpperCase() + st.slice(1)}</option>)}</select></td>
                <td>{p.payouts_ready ? "Ready" : p.stripe_account_id ? "Started" : "Not started"}</td>
                <td className="mono">{p.code}</td>
                <td><button className="btn btn-line" style={{ minHeight: 36 }} onClick={() => { navigator.clipboard?.writeText(`${location.origin}/partners/join/${p.invite_token}`); setNote(`Invitation link for ${p.name} copied.`); }}>Copy link</button></td></tr>
            ))}</tbody>
          </table></div>
        )}
      </section>

      <section className="stack g16">
        <h2 className="h3" style={{ fontSize: 18 }}>Ad spend and partner commission</h2>
        <p className="small">Enter each client&apos;s ad spend for a day. If a Managing Partner brought that client, 10% is added to their commission and becomes payable 7 days after the spend date. Saving the same client and date again replaces the amount.</p>
        <form onSubmit={addSpend} className="card" style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end", background: "var(--ground)" }}>
          <div className="field" style={{ flex: "2 1 240px" }}><label htmlFor="sp-lead">Client</label>
            <select id="sp-lead" name="lead_id" className="input" required defaultValue="">
              <option value="" disabled>Choose a paid client</option>
              {paid.map((l) => <option key={l.id} value={l.id}>{l.business || l.email}{l.partner_id ? ` (${pname(l.partner_id)})` : " (no partner)"}</option>)}
            </select></div>
          <div className="field" style={{ flex: "1 1 150px" }}><label htmlFor="sp-day">Date</label><input id="sp-day" name="day" type="date" className="input" required max={isoToday} /></div>
          <div className="field" style={{ flex: "1 1 150px" }}><label htmlFor="sp-amount">Spend (US dollars)</label><input id="sp-amount" name="amount" type="number" min="0" step="0.01" className="input mono" required /></div>
          <button className="btn btn-blue">Save spend</button>
        </form>
        {note && <p className="note note-ok" role="status">{note}</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
          <div className="small">Awaiting approval: <b>{usd(sum(open.filter((l) => l.status === "pending")))}</b> · Approved and due today: <b>{usd(sum(dueApproved))}</b></div>
          <button className="btn btn-ink" disabled={busy || dueApproved.length === 0} onClick={runPayout}>{busy ? "Paying…" : `Pay ${usd(sum(dueApproved))} now`}</button>
        </div>
        {open.length > 0 && (
          <div className="tablebox"><table>
            <thead><tr><th scope="col">Spend date</th><th scope="col">Partner</th><th scope="col">Client</th><th scope="col">Spend</th><th scope="col">Commission</th><th scope="col">Payable from</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead>
            <tbody>{open.map((l) => (
              <tr key={l.id}><th scope="row">{day(l.day + "T00:00:00")}</th><td>{pname(l.partner_id)}</td><td>{lname(l.lead_id)}</td><td className="mono">{usd(l.spend)}</td><td className="mono">{usd(l.amount)}</td>
                <td>{day(l.release_on + "T00:00:00")}</td><td>{l.status === "approved" ? "Approved" : "Awaiting approval"}</td>
                <td style={{ whiteSpace: "nowrap" }}>{l.status === "pending"
                  ? <button className="btn btn-line" style={{ minHeight: 36 }} onClick={() => setLine([l.id], "approved")}>Approve</button>
                  : <button className="btn btn-line" style={{ minHeight: 36 }} onClick={() => setLine([l.id], "pending")}>Undo</button>}</td></tr>
            ))}</tbody>
          </table></div>
        )}
        {lines.some((l) => l.status === "paid") && <p className="small">Paid to date: <b>{usd(sum(lines.filter((l) => l.status === "paid")))}</b></p>}
      </section>

      <section className="stack g16">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
          <h2 className="h3" style={{ fontSize: 18 }}>Messages sent by the system</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn btn-line" disabled={busy} onClick={() => tell({})}>Run today&apos;s checks now</button>
            <button className="btn btn-line" disabled={busy} onClick={() => tell({ weekly: true })}>Send weekly summaries now</button>
          </div>
        </div>
        <p className="small">Clients are emailed when a setup step is ticked, when they go live, when their budget runs low, and every Monday with a summary. Someone who starts opening an account and does not pay gets one reminder the next day. Managing Partners get a Monday brief on each of their clients. The team gets one list each morning. These run by themselves; the buttons are for running them early. Nothing is ever sent twice.</p>
        {notices.length === 0 ? <p className="p">No messages yet.</p> : (
          <div className="tablebox"><table>
            <thead><tr><th scope="col">When</th><th scope="col">To</th><th scope="col">Message</th><th scope="col">Result</th></tr></thead>
            <tbody>{notices.map((n) => (
              <tr key={n.id}><th scope="row">{day(n.created_at)}</th><td>{n.to_email}</td><td>{n.title}</td><td>{n.sent_at ? "Sent" : n.error ? `Failed: ${n.error.slice(0, 80)}` : "Sending"}</td></tr>
            ))}</tbody>
          </table></div>
        )}
      </section>

      <section className="stack g16">
        <h2 className="h3" style={{ fontSize: 18 }}>Leads not yet paid ({others.length})</h2>
        <div className="tablebox"><table>
          <thead><tr><th scope="col">When</th><th scope="col">What</th><th scope="col">Who</th><th scope="col">Email</th><th scope="col">Details</th><th scope="col">Came from</th></tr></thead>
          <tbody>{others.map((l) => (
            <tr key={l.id}><th scope="row">{day(l.created_at)}</th><td>{KIND[l.kind] || l.kind}</td><td>{[l.name, l.business].filter(Boolean).join(", ")}</td><td><a href={`mailto:${l.email}`}>{l.email}</a></td>
              <td>{[l.industry, l.market, l.budget ? usd(l.budget) : "", l.monthly_spend].filter(Boolean).join(" · ")}</td><td className="small">{l.source}</td></tr>
          ))}</tbody>
        </table></div>
      </section>
    </main>
  );
}
