"use client";
import { createClient, type Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { INDUSTRIES, SETUP_DAYS } from "@/lib/site";

type Lead = {
  id: string; created_at: string; kind: string; email: string; name: string | null; business: string | null; phone: string | null;
  industry: string | null; market: string | null; budget: number | null; formats: string | null; goals: string | null; monthly_spend: string | null;
  status: string; paid_at: string | null; amount_paid: number | null; setup_due: string | null;
  step_account_at: string | null; step_tracking_at: string | null; step_ads_at: string | null; step_audience_at: string | null; live_at: string | null;
};
type Partner = { id: string; created_at: string; status: string; name: string; email: string; phone: string | null; location: string | null; vertical: string | null; linkedin: string | null; experience: string | null; network: string | null };
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
    if (error) { setMsg("Could not save: " + error.message); load(); }
  }

  async function invite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMsg("");
    const form = e.currentTarget; const d = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const { error } = await supabase!.from("partners").insert({ name: d.name.trim(), email: d.email.trim().toLowerCase(), vertical: d.vertical, invited_by: session!.user.email });
    if (error) setMsg(error.code === "23505" ? "That email is already on the partner list." : "Could not save: " + error.message);
    else { form.reset(); load(); }
  }

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
                    <input type="checkbox" checked={!!l[k]} onChange={(e) => patch(l.id, { [k]: e.target.checked ? new Date().toISOString() : null })} style={{ width: 20, height: 20 }} /> {label}
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <button className="btn btn-blue" disabled={done < STEPS.length} onClick={() => patch(l.id, { live_at: new Date().toISOString(), status: "live" })}>Mark as live</button>
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
        <p className="small">Invite only. Adding someone here puts them on the partner list. Invitation emails, admission signing and weekly Stripe payouts are the next pieces to be built.</p>
        <form onSubmit={invite} className="card" style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end", background: "var(--ground)" }}>
          <div className="field" style={{ flex: "1 1 180px" }}><label htmlFor="inv-name">Full name</label><input id="inv-name" name="name" className="input" required /></div>
          <div className="field" style={{ flex: "1 1 220px" }}><label htmlFor="inv-email">Email</label><input id="inv-email" name="email" type="email" className="input" required /></div>
          <div className="field" style={{ flex: "1 1 180px" }}><label htmlFor="inv-vertical">Industry</label>
            <select id="inv-vertical" name="vertical" className="input">{INDUSTRIES.map((i) => <option key={i}>{i}</option>)}</select></div>
          <button className="btn btn-blue">Add to partner list</button>
        </form>
        {partners.length > 0 && (
          <div className="tablebox"><table>
            <thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Industry</th><th scope="col">Status</th><th scope="col">Added</th></tr></thead>
            <tbody>{partners.map((p) => <tr key={p.id}><th scope="row">{p.name}</th><td><a href={`mailto:${p.email}`}>{p.email}</a></td><td>{p.vertical}</td><td>{p.status[0].toUpperCase() + p.status.slice(1)}</td><td>{day(p.created_at)}</td></tr>)}</tbody>
          </table></div>
        )}
      </section>

      <section className="stack g16">
        <h2 className="h3" style={{ fontSize: 18 }}>Leads not yet paid ({others.length})</h2>
        <div className="tablebox"><table>
          <thead><tr><th scope="col">When</th><th scope="col">What</th><th scope="col">Who</th><th scope="col">Email</th><th scope="col">Details</th></tr></thead>
          <tbody>{others.map((l) => (
            <tr key={l.id}><th scope="row">{day(l.created_at)}</th><td>{KIND[l.kind] || l.kind}</td><td>{[l.name, l.business].filter(Boolean).join(", ")}</td><td><a href={`mailto:${l.email}`}>{l.email}</a></td>
              <td>{[l.industry, l.market, l.budget ? usd(l.budget) : "", l.monthly_spend].filter(Boolean).join(" · ")}</td></tr>
          ))}</tbody>
        </table></div>
      </section>
    </main>
  );
}
