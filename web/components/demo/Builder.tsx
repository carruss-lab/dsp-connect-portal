"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MIN_BUDGET } from "@/lib/site";
import { TAXONOMIES, type BuilderPreset } from "@/lib/plan";
import { SSP_ENDPOINTS, SSP_LABELS, usd } from "./data";

// The campaign builder, step for step as the client platform has it: General, Audience, Price & Optimization,
// Budgets, Traffic source, with the running Summary on the right. Nothing is saved; the last step hands the
// choices to the account sign-up form.

const STEPS = ["General", "Audience", "Price & Optimization", "Budgets", "Traffic source"] as const;
const GOALS = [
  { t: "Awareness", icon: "groups", d: "Show your ads to as many relevant people as possible.", star: "Best for brand visibility and reach.", metric: "Impressions" },
  { t: "Website visits", icon: "ads_click", d: "Drive visits and traffic to your website or landing page.", star: "Best when you want clicks and sessions.", metric: "Clicks" },
  { t: "Conversions", icon: "fact_check", d: "Get more conversions (sign-ups, purchases, leads).", star: "Best when you track actions on your site/app (pixel/SDK) and want cost-efficient results.", metric: "Conversions" },
];
const FORMATS = [
  { t: "Banner", icon: "image", d: "Standard display ads across websites and apps." },
  { t: "Video", icon: "smart_display", d: "Video ads shown in or around video content." },
  { t: "Native", icon: "article", d: "Ads fitting naturally with surrounding content.", star: "Best for Conversions" },
  { t: "Push", icon: "notifications", d: "Clickable notification-style ads delivered directly to users' devices.", star: "Best for Conversions" },
  { t: "Pop-Under", icon: "tab", d: "Full-page ads opening in a new tab." },
  { t: "Interstitial", icon: "fullscreen", d: "Full-screen ads overlaying content." },
];
const DEVICES = ["Desktop", "Mobile", "Tablet", "Connected TV", "Connected Device", "Set Top Box"];
const OSES = ["Android", "iOS", "Windows", "macOS", "Roku OS", "Tizen", "Fire OS", "webOS", "tvOS"];
const BROWSERS = ["Chrome", "Safari", "Firefox", "Edge", "Samsung Internet", "Opera"];

type Sel = Record<string, "inc" | "exc">;

function Opt({ on, onClick, title, icon, desc, star }: { on: boolean; onClick: () => void; title: string; icon?: string; desc: string; star?: string }) {
  return (
    <button type="button" role="radio" aria-checked={on} className="dm-opt" data-on={on || undefined} onClick={onClick}>
      <span className="dm-radio" aria-hidden="true" />
      <span style={{ minWidth: 0 }}>
        <span className="dm-opt-t">{icon && <span className="mi s24" aria-hidden="true">{icon}</span>}{title}</span>
        <span className="dm-opt-d" style={{ display: "block" }}>{desc}</span>
        {star && <span className="dm-star"><span className="mi" aria-hidden="true">star</span>{star}</span>}
      </span>
    </button>
  );
}
function Select({ id, value, onChange, options, placeholder }: { id: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  return (
    <div className="dm-field">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <span className="mi dm-sel-caret" aria-hidden="true">arrow_drop_down</span>
    </div>
  );
}
function Multi({ label, items, value, onChange, incExc }: { label: string; items: string[]; value: string[]; onChange: (v: string[]) => void; incExc?: boolean }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"Include" | "Exclude">("Include");
  return (
    <div className="dm-stack" style={{ gap: 8 }}>
      <div className="dm-row" style={{ justifyContent: "space-between" }}>
        <span className="dm-lbl" style={{ margin: 0 }}>{label}</span>
        {incExc && <div className="dm-seg">{(["Include", "Exclude"] as const).map((m) => <button key={m} type="button" data-on={mode === m || undefined} onClick={() => setMode(m)}>{m}</button>)}</div>}
      </div>
      <button type="button" className="dm-field" style={{ cursor: "pointer", justifyContent: "space-between", font: "inherit", width: "100%" }} aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="dm-muted">Select {label} ({value.length})</span><span className="mi" aria-hidden="true">arrow_drop_down</span>
      </button>
      {open && (
        <div className="dm-card" style={{ padding: 12, border: "1px solid #E0E2EA", display: "flex", flexWrap: "wrap", gap: 8 }}>
          {items.map((i) => (
            <button key={i} type="button" className="dm-chip" data-on={value.includes(i) || undefined} aria-pressed={value.includes(i)}
              onClick={() => onChange(value.includes(i) ? value.filter((x) => x !== i) : [...value, i])}>{i}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Builder({ industry, market, audiences, onCancel, preset }: { industry: string; market: string; audiences: string[]; onCancel: () => void; preset?: BuilderPreset }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [f, setF] = useState({
    status: true, name: "", folder: industry, tags: "", goal: "", conversion: "", cpa: "", format: "",
    audMode: "create" as "create" | "saved", savedAudience: "", saveAud: false, audName: "",
    geo: market === "your area" ? "" : market, geoType: "Any", env: "Any", missingId: false, devices: [] as string[], os: [] as string[], browsers: [] as string[],
    lang: "", schedule: "", conn: "Any", taxonomies: [] as string[],
    model: "", price: "", decay: "0", floorInc: "", cap24: "", cap30: "", recency: "", maxBid: "", fraud: "High", pixalate: false,
    budgetStart: "", budgetEnd: "", limitType: "Total limits", spend: "", impLimit: "", pacing: true, budgetSaved: false,
    // Opened from the visitor's ad plan: its first campaign is filled in.
    ...(preset ? { name: preset.name, goal: preset.goal, conversion: preset.goal === "Conversions" ? "Registration (1 event)" : "", format: preset.format, geo: preset.geo || (market === "your area" ? "" : market), devices: preset.devices, taxonomies: preset.taxonomies, spend: preset.spend } : {}),
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((o) => ({ ...o, [k]: v }));
  const [ssp, setSsp] = useState<Sel>({});
  const [q, setQ] = useState("");
  const [label, setLabel] = useState("");
  const [moreAud, setMoreAud] = useState<Record<string, boolean>>({});

  const goal = GOALS.find((g) => g.t === f.goal);
  const spend = Number(f.spend);
  const budgetOk = f.limitType === "Daily limits" ? spend > 0 : spend >= MIN_BUDGET;
  const valid = [
    f.name.trim() && f.folder && f.goal && f.format && (f.goal !== "Conversions" || (f.conversion && Number(f.cpa) > 0)),
    f.audMode === "create" || f.savedAudience,
    f.model && Number(f.price) > 0,
    f.budgetSaved,
    true,
  ];
  const linked = Object.entries(ssp);
  const list = useMemo(() => SSP_ENDPOINTS.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()) && (!label || s.labels.includes(label as "Native"))), [q, label]);
  const qs = new URLSearchParams({
    budget: String(f.limitType === "Total limits" && spend >= MIN_BUDGET ? spend : MIN_BUDGET), formats: f.format || "Banner", goals: f.goal || "Conversions", market, industry,
  });

  if (done) {
    return (
      <div className="dm-card" style={{ padding: 40, maxWidth: 680 }}>
        <h1>Campaign saved in the demo</h1>
        <p style={{ marginTop: 12 }}>
          In the demo nothing is sent to the exchanges. Open your account and we set this up for real: {(f.format || "Banner").toLowerCase()} ads for {(f.goal || "Conversions").toLowerCase()}
          {f.geo ? ` in ${f.geo}` : ""}, {linked.length ? `on ${linked.filter(([, v]) => v === "inc").length || "all"} selected SSP endpoints` : "across all SSP endpoints"}.
        </p>
        <div className="dm-row" style={{ marginTop: 24 }}>
          <Link className="dm-cta" style={{ height: 40 }} href={`/open-account?${qs}`}>Open your account with these settings</Link>
          <button type="button" className="dm-btn" onClick={onCancel}>Back to campaigns</button>
        </div>
      </div>
    );
  }

  const Summary = (
    <aside className="dm-summary" aria-label="Summary">
      <h3>Summary</h3>
      <div className="kv" style={{ marginTop: 12 }}>Status: <span className="dm-toggle"><button type="button" role="switch" aria-checked={f.status} aria-label="Status" className="dm-switch" onClick={() => set("status", !f.status)} />{f.status ? "On" : "Off"}</span></div>
      {(f.name || f.goal || f.format) && (
        <section><h4>General</h4>
          {f.name && <><h5>Basic info</h5><div className="kv">Name: <b>{f.name}</b></div><div className="kv">Folder: <b>{f.folder}</b></div>{f.tags && <div className="kv">Tags: <b>{f.tags}</b></div>}</>}
          {goal && <><h5>Goal</h5><div className="kv">Main Goal: <span className="mi s18" aria-hidden="true">{goal.icon}</span><b>{goal.t}</b></div><div className="kv">Success Metric: <b>{goal.metric}</b></div></>}
          {f.format && <><h5>Ad Format</h5><div className="kv"><span className="mi s18" aria-hidden="true">{FORMATS.find((x) => x.t === f.format)?.icon}</span><b>{f.format}</b></div></>}
        </section>
      )}
      {step >= 1 && (
        <section><h4>Audience</h4>
          {f.audMode === "saved" ? <div className="kv">Saved Audience: <b>{f.savedAudience || "-"}</b></div> : <>
            <div className="kv">Geo position: <b>{f.geo || "Any"}</b></div>
            <div className="kv">Device Type: <b>{f.devices.join(", ") || "Any"}</b></div>
            <div className="kv">Traffic environment: <b>{f.env}</b></div>
          </>}
        </section>
      )}
      {(f.model || f.price) && (
        <section><h4>Price &amp; Optimization</h4><h5>Pricing</h5>
          <div className="kv">Pricing Model: <b>{f.model || "-"}</b></div><div className="kv">Default Price: <b>{f.price || "-"}</b></div>
          <div className="kv">Fraud Risk Filter: <b>{f.fraud}</b></div>
        </section>
      )}
      {f.budgetSaved && (
        <section><h4>Budgets</h4><div className="kv">{f.limitType === "Total limits" ? "Total" : "Daily"} spend limit: <b>{usd(spend)}</b></div><div className="kv">Even Pacing: <b>{f.pacing ? "On" : "Off"}</b></div></section>
      )}
      {step >= 4 && (
        <section><h4>Traffic source</h4><div className="kv">SSP Endpoints: <b>{linked.length ? linked.map(([k, v]) => `${k}${v === "exc" ? " (excluded)" : ""}`).join(", ") : "All SSP Endpoints"}</b></div></section>
      )}
    </aside>
  );

  return (
    <div className="dm-builder">
      <div className="dm-b-main">
        <nav className="dm-stepper" aria-label="Campaign steps">
          {STEPS.map((t, i) => {
            const ok = i < step && valid[i];
            const reachable = i <= step || valid.slice(0, i).every(Boolean);
            return (
              <button key={t} type="button" data-on={i === step || undefined} data-done={ok || undefined} disabled={!reachable} aria-current={i === step ? "step" : undefined} onClick={() => reachable && setStep(i)}>
                {ok ? <span className="mi" aria-hidden="true">check_circle</span> : <span className="dm-num">{i + 1}</span>}{t}
              </button>
            );
          })}
        </nav>

        <div className={`dm-b-scroll${step === 4 ? " wide" : ""}`}>
          {preset && step === 0 && <div className="dm-info" style={{ marginBottom: 12, background: "#EAF1FF", borderColor: "#0A4FD6" }}><span className="mi" aria-hidden="true">auto_awesome</span><span>Filled in from your ad plan: the first campaign, its goal, format, location and devices. Add a CPA and price, then step through.</span></div>}
          {step === 0 && (
            <>
              <div className="dm-card dm-stack">
                <h3>Basic Info</h3>
                <div><label className="dm-lbl" htmlFor="b-name">Name <i>*</i></label><input id="b-name" className="dm-input" placeholder="Enter Name" value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
                <div className="dm-grid2">
                  <div><label className="dm-lbl" htmlFor="b-folder">Folder <i>*</i></label><Select id="b-folder" value={f.folder} onChange={(v) => set("folder", v)} options={[industry, "Unsorted"]} placeholder="Select Folder" /></div>
                  <div><label className="dm-lbl" htmlFor="b-tags">Tags</label><input id="b-tags" className="dm-input" placeholder="Enter tags" value={f.tags} onChange={(e) => set("tags", e.target.value)} /><div className="dm-sm dm-muted" style={{ marginTop: 6 }}>Max 3 tags</div></div>
                </div>
              </div>
              <div className="dm-card dm-stack" role="radiogroup" aria-label="Goal">
                <h3>Goal <span style={{ color: "#C62828" }}>*</span></h3>
                {GOALS.map((g) => <Opt key={g.t} on={f.goal === g.t} onClick={() => set("goal", g.t)} title={g.t} icon={g.icon} desc={g.d} star={g.star} />)}
                {f.goal === "Conversions" && (
                  <>
                    <div className="dm-grid2">
                      <div><label className="dm-lbl" htmlFor="b-conv">Conversion <i>*</i></label><Select id="b-conv" value={f.conversion} onChange={(v) => set("conversion", v)} options={["LP click (0 event)", "Registration (1 event)", "Purchase/FTD (2 event)"]} placeholder="Select conversion" /></div>
                      <div><label className="dm-lbl" htmlFor="b-cpa">CPA <i>*</i></label><div className="dm-field"><span className="mi s18" aria-hidden="true">attach_money</span><input id="b-cpa" inputMode="decimal" placeholder="Enter CPA" value={f.cpa} onChange={(e) => set("cpa", e.target.value)} /></div></div>
                    </div>
                    <div className="dm-info"><span className="mi" aria-hidden="true">info</span><span>Conversion tracking must be configured to enable optimization and track performance effectively.</span></div>
                  </>
                )}
              </div>
              <div className="dm-card dm-stack" role="radiogroup" aria-label="Ad Format">
                <h3>Ad Format <span style={{ color: "#C62828" }}>*</span></h3>
                {FORMATS.map((x) => <Opt key={x.t} on={f.format === x.t} onClick={() => set("format", x.t)} title={x.t} icon={x.icon} desc={x.d} star={x.star} />)}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="dm-ab" role="radiogroup" aria-label="Audience source">
                <button type="button" role="radio" aria-checked={f.audMode === "create"} data-on={f.audMode === "create" || undefined} onClick={() => set("audMode", "create")}><span className="mi" aria-hidden="true">groups</span>Create Audience</button>
                <button type="button" role="radio" aria-checked={f.audMode === "saved"} data-on={f.audMode === "saved" || undefined} onClick={() => set("audMode", "saved")}><span className="mi" aria-hidden="true">folder_open</span>Saved Audience</button>
              </div>
              {f.audMode === "saved" ? (
                <div className="dm-card dm-stack" role="radiogroup" aria-label="Saved audiences">
                  <h3>Saved Audience</h3>
                  {audiences.map((a) => <Opt key={a} on={f.savedAudience === a} onClick={() => set("savedAudience", a)} title={a} desc="Reusable Audience with its full targeting setup." />)}
                </div>
              ) : (
                <>
                  <h3 style={{ marginTop: 4 }}>Audience Targeting</h3>
                  <div className="dm-card dm-row" style={{ padding: 16 }}>
                    <label className="dm-check"><input type="checkbox" checked={f.saveAud} onChange={(e) => set("saveAud", e.target.checked)} /> Save Audience for reuse</label>
                    <input className="dm-input" style={{ flex: "1 1 240px", width: "auto" }} placeholder="Audience name" aria-label="Audience name" value={f.audName} onChange={(e) => set("audName", e.target.value)} disabled={!f.saveAud} />
                  </div>
                  <div className="dm-card dm-stack">
                    <h3>Targeting</h3>
                    <div className="dm-sec-t">Geo</div>
                    <div className="dm-grid2">
                      <div><label className="dm-lbl" htmlFor="b-geo">Geo position</label><input id="b-geo" className="dm-input" placeholder="Select Geo Position (Any)" value={f.geo} onChange={(e) => set("geo", e.target.value)} /></div>
                      <div><span className="dm-lbl">Custom Locations</span><Select id="b-cl" value="" onChange={() => {}} options={[`${market} service area`, "Competitor locations"]} placeholder="Select Custom Locations (Any)" /></div>
                    </div>
                    <span className="dm-lbl" style={{ marginBottom: 0 }}>Geo Location Type</span>
                    <div className="dm-seg">{["Any", "GPS/Location Services", "IP Address", "User Provided"].map((v) => <button key={v} type="button" data-on={f.geoType === v || undefined} onClick={() => set("geoType", v)}>{v}</button>)}</div>
                    <div className="dm-sec-t">Traffic environment</div>
                    <div className="dm-seg">{["Any", "Websites", "Mobile Apps"].map((v) => <button key={v} type="button" data-on={f.env === v || undefined} onClick={() => set("env", v)}>{v}</button>)}</div>
                    <div className="dm-sec-t">Traffic Type</div>
                    <label className="dm-check"><input type="checkbox" checked={f.missingId} onChange={(e) => set("missingId", e.target.checked)} /> Include Traffic with Missing Device ID</label>
                    <div className="dm-sec-t">Device</div>
                    <span className="dm-lbl" style={{ marginBottom: 0 }}>Device Type</span>
                    <div className="dm-row">{DEVICES.map((d) => <label key={d} className="dm-check"><input type="checkbox" checked={f.devices.includes(d)} onChange={() => set("devices", f.devices.includes(d) ? f.devices.filter((x) => x !== d) : [...f.devices, d])} /> {d}</label>)}</div>
                    <Multi label="Operating Systems" items={OSES} value={f.os} onChange={(v) => set("os", v)} incExc />
                    <Multi label="Browsers" items={BROWSERS} value={f.browsers} onChange={(v) => set("browsers", v)} incExc />
                    <div><span className="dm-lbl">Language</span><Select id="b-lang" value={f.lang} onChange={(v) => set("lang", v)} options={["English", "Spanish"]} placeholder="Select Language (Any)" /></div>
                    <div className="dm-sec-t">Date and time</div>
                    <Select id="b-sched" value={f.schedule} onChange={(v) => set("schedule", v)} options={["Weekdays 6:00 to 22:00", "Every day 7:00 to 23:00", "Weekends only"]} placeholder="Select Day and Time Schedule (Any)" />
                    <div className="dm-sec-t">Connection</div>
                    <span className="dm-lbl" style={{ marginBottom: 0 }}>Connection Type</span>
                    <div className="dm-seg">{["Any", "Ethernet", "WIFI"].map((v) => <button key={v} type="button" data-on={f.conn === v || undefined} onClick={() => set("conn", v)}>{v}</button>)}</div>
                    <div className="dm-grid2">
                      <div><span className="dm-lbl">Carrier</span><Select id="b-car" value="" onChange={() => {}} options={["Verizon", "T-Mobile", "AT&T"]} placeholder="Select Carrier (0)" /></div>
                      <div><span className="dm-lbl">ISP</span><Select id="b-isp" value="" onChange={() => {}} options={["Comcast", "Charter Spectrum", "Cox Communications", "AT&T Internet"]} placeholder="Select ISP (0)" /></div>
                    </div>
                    <Multi label="Content Categories (Taxonomies)" items={TAXONOMIES} value={f.taxonomies} onChange={(v) => set("taxonomies", v)} />
                  </div>
                  {["Retargeting", "Advanced settings"].map((t) => (
                    <div key={t}>
                      <button type="button" className="dm-collapse" aria-expanded={!!moreAud[t]} onClick={() => setMoreAud((o) => ({ ...o, [t]: !o[t] }))}>
                        <span className="mi" aria-hidden="true" style={{ transform: moreAud[t] ? "rotate(90deg)" : undefined }}>arrow_right</span>{t}
                      </button>
                      {moreAud[t] && (
                        <div className="dm-card" style={{ marginTop: 2 }}>
                          {t === "Retargeting"
                            ? <Select id="b-rt" value="" onChange={() => {}} options={["Website visitors · 30 days", "Clicked an ad · 14 days"]} placeholder="Select Segments (0)" />
                            : <div className="dm-grid2"><div><span className="dm-lbl">Device Hardware Version</span><input className="dm-input" placeholder="Include" aria-label="Device Hardware Version" /></div><div><span className="dm-lbl">User Agent Pattern</span><input className="dm-input" placeholder="Include" aria-label="User Agent Pattern" /></div></div>}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div className="dm-card dm-stack">
                <h3>Pricing</h3>
                <div className="dm-grid2">
                  <div><label className="dm-lbl" htmlFor="b-model">Pricing Model <i>*</i></label><Select id="b-model" value={f.model} onChange={(v) => set("model", v)} options={["CPM", "CPC"]} placeholder="Select Pricing Model" /></div>
                  <div><label className="dm-lbl" htmlFor="b-price">Default Price <i>*</i></label><input id="b-price" className="dm-input" inputMode="decimal" placeholder="Enter default Price" value={f.price} onChange={(e) => set("price", e.target.value)} /></div>
                </div>
                <div className="dm-sec-t">Exposure Time Multiplier</div>
                <div><label className="dm-lbl" htmlFor="b-decay">Decay rate (1 fastest / 100 slowest)</label><input id="b-decay" className="dm-input" inputMode="numeric" value={f.decay} onChange={(e) => set("decay", e.target.value)} /></div>
                <div className="dm-sec-t">Bid Floor Price</div>
                <div><label className="dm-lbl" htmlFor="b-floor">Bid floor price increment</label><input id="b-floor" className="dm-input" placeholder="Enter Bid Floor Price Increment" value={f.floorInc} onChange={(e) => set("floorInc", e.target.value)} /></div>
              </div>
              <div className="dm-card dm-stack">
                <h3>Capping</h3>
                <div className="dm-sec-t">Frequency Cap</div>
                <div className="dm-grid2">
                  <div><label className="dm-lbl" htmlFor="b-c24">24 Hours Cap</label><input id="b-c24" className="dm-input" placeholder="Enter 24 Hours Cap" value={f.cap24} onChange={(e) => set("cap24", e.target.value)} /></div>
                  <div><label className="dm-lbl" htmlFor="b-c30">30 Days Cap</label><input id="b-c30" className="dm-input" placeholder="Enter 30 Days Cap" value={f.cap30} onChange={(e) => set("cap30", e.target.value)} /></div>
                </div>
                <div className="dm-sec-t">Recency Cap</div>
                <input className="dm-input" aria-label="Recency Cap seconds" placeholder="Seconds (Min 60 / Max 3600)" value={f.recency} onChange={(e) => set("recency", e.target.value)} />
              </div>
              <div className="dm-card dm-stack">
                <h3>Allowlist / Blocklist</h3>
                <Select id="b-al" value="" onChange={() => {}} options={["Top performers", "Low CTR", `${market} only`]} placeholder="Select Allowlist / Blocklist (0)" />
              </div>
              <div className="dm-card dm-stack">
                <h3>Auto optimization</h3>
                {[["Bidding Rules", "Link Rules", "Add new Rule", ["Name", "Preview"]], ["Bid Modifiers", "Link Modifiers", "Add new Modifier", ["Name", "Type", "Items"]]].map(([t, l, a, cols]) => (
                  <div key={t as string} className="dm-stack" style={{ gap: 8 }}>
                    <div className="dm-row" style={{ justifyContent: "space-between" }}><div className="dm-sec-t">{t as string}</div>
                      <div className="dm-row"><button type="button" className="dm-btn dm-btn-sm"><span className="mi s18" aria-hidden="true">link</span>{l as string}</button><button type="button" className="dm-btn dm-btn-sm"><span className="mi s18" aria-hidden="true">add_circle_outline</span>{a as string}</button></div></div>
                    <div className="dm-table"><table style={{ minWidth: 0 }}><thead><tr>{(cols as string[]).map((c) => <th key={c}>{c}</th>)}</tr></thead><tbody><tr><td colSpan={(cols as string[]).length} className="dm-muted">No available data to show.</td></tr></tbody></table></div>
                  </div>
                ))}
                <div><label className="dm-lbl" htmlFor="b-max">Max Bid Price</label><input id="b-max" className="dm-input" placeholder="Enter max bid price" value={f.maxBid} onChange={(e) => set("maxBid", e.target.value)} /><div className="dm-sm dm-muted" style={{ marginTop: 6 }}>Applied For Bid Rules And Bid Modifiers</div></div>
              </div>
              <div className="dm-card dm-stack">
                <h3>Optimization</h3>
                <div><label className="dm-lbl" htmlFor="b-fraud">Fraud Risk Filter</label><Select id="b-fraud" value={f.fraud} onChange={(v) => set("fraud", v)} options={["High", "Medium", "Low"]} /></div>
                <label className="dm-check"><input type="checkbox" checked={f.pixalate} onChange={(e) => set("pixalate", e.target.checked)} /> Pixalate optimization</label>
                <p className="dm-sm dm-muted">MRC-accredited analytics: fraud detection, viewability measurement and supply chain optimization.</p>
              </div>
              {["Auto filling retargeting", "Events tracking", "PMP Deals"].map((t) => (
                <button key={t} type="button" className="dm-collapse" aria-expanded={false}><span className="mi" aria-hidden="true">arrow_right</span>{t}</button>
              ))}
            </>
          )}

          {step === 3 && (
            <>
              <div className="dm-row" style={{ justifyContent: "space-between" }}>
                <div className="dm-field" style={{ width: 320 }}><label htmlFor="b-bs">Status:</label><select id="b-bs" defaultValue="all"><option value="all">Delivering, Scheduled, Paused, Ended</option></select><span className="mi dm-sel-caret" aria-hidden="true">arrow_drop_down</span></div>
                <button type="button" className="dm-btn" onClick={() => set("budgetSaved", false)}><span className="mi s18" aria-hidden="true">add_circle_outline</span>Create new Budget</button>
              </div>
              {f.budgetSaved ? (
                <div className="dm-table"><table><thead><tr><th>Name</th><th>Status</th><th>Flight Dates</th><th>Limit</th><th className="num">Spend limit</th><th>Even Pacing</th></tr></thead>
                  <tbody><tr><th>{f.name || "Campaign"} · Budget</th><td><span className="dm-dot" />Scheduled</td><td>{f.budgetStart || "On approval"} - {f.budgetEnd || "No end date"}</td><td>{f.limitType}</td><td className="num">{usd(spend)}</td><td>{f.pacing ? "On" : "Off"}</td></tr></tbody></table></div>
              ) : (
                <div className="dm-card dm-stack">
                  <h3>Create a new budget</h3>
                  <div className="dm-sec-t">Flight Dates</div>
                  <div className="dm-grid2">
                    <div><label className="dm-lbl" htmlFor="b-start">Start date</label><input id="b-start" type="date" className="dm-input" value={f.budgetStart} onChange={(e) => set("budgetStart", e.target.value)} /></div>
                    <div><label className="dm-lbl" htmlFor="b-end">End date (planned)</label><input id="b-end" type="date" className="dm-input" value={f.budgetEnd} onChange={(e) => set("budgetEnd", e.target.value)} /></div>
                  </div>
                  <div className="dm-sec-t">Limits <span style={{ color: "#C62828" }}>*</span></div>
                  <div className="dm-seg">{["Total limits", "Daily limits"].map((v) => <button key={v} type="button" data-on={f.limitType === v || undefined} onClick={() => set("limitType", v)}>{v}</button>)}</div>
                  <div className="dm-grid2">
                    <div><label className="dm-lbl" htmlFor="b-spend">Spend limit</label><div className="dm-field"><span className="mi s18" aria-hidden="true">attach_money</span><input id="b-spend" inputMode="decimal" placeholder="Enter spend limit" value={f.spend} onChange={(e) => set("spend", e.target.value)} /></div></div>
                    <div><label className="dm-lbl" htmlFor="b-imp">Impressions limit</label><input id="b-imp" className="dm-input" inputMode="numeric" placeholder="Enter impressions limit" value={f.impLimit} onChange={(e) => set("impLimit", e.target.value)} /></div>
                  </div>
                  {f.spend && !budgetOk && <p role="alert" style={{ color: "#C62828" }}>The minimum total budget is {usd(MIN_BUDGET)}.</p>}
                  <label className="dm-check"><input type="checkbox" checked={f.pacing} onChange={(e) => set("pacing", e.target.checked)} /> Even Pacing</label>
                  <div className="dm-row" style={{ justifyContent: "flex-end" }}>
                    <button type="button" className="dm-btn" onClick={() => setF((o) => ({ ...o, spend: "", impLimit: "" }))}>Cancel</button>
                    <button type="button" className="dm-btn dm-btn-dark" disabled={!budgetOk} onClick={() => set("budgetSaved", true)}>Save</button>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 4 && (
            <div className="dm-ssp">
              <div className="dm-ssp-col" style={{ gridColumn: "1 / -1", paddingBottom: 16 }}><p className="dm-muted">Select SSP Endpoints that will be sending traffic to this Campaign.</p></div>
              <div className="dm-ssp-col">
                <h4 style={{ fontSize: 15 }}>Available</h4>
                <div className="dm-field"><input aria-label="Search SSP endpoints" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} /><span className="mi" aria-hidden="true">search</span></div>
                <div className="dm-field"><select aria-label="Select labels" value={label} onChange={(e) => setLabel(e.target.value)}><option value="">Select labels</option>{SSP_LABELS.map((l) => <option key={l}>{l}</option>)}</select><span className="mi dm-sel-caret" aria-hidden="true">arrow_drop_down</span></div>
                <div className="dm-ssp-list" role="list">
                  {list.filter((s) => !ssp[s.name]).map((s) => (
                    <div key={s.name} className="dm-ssp-item" role="listitem">
                      <b>{s.name}</b>
                      {s.labels.map((l) => <span key={l} className="lbl" style={{ background: l === "Native" ? "#F3E3A0" : "#E4D3EC" }}>{l}</span>)}
                      <button type="button" className="dm-inc" onClick={() => setSsp((o) => ({ ...o, [s.name]: "inc" }))}><span className="mi s18" aria-hidden="true">add_circle_outline</span>Include</button>
                      <button type="button" className="dm-exc" onClick={() => setSsp((o) => ({ ...o, [s.name]: "exc" }))}><span className="mi s18" aria-hidden="true">block</span>Exclude</button>
                    </div>
                  ))}
                  {!list.filter((s) => !ssp[s.name]).length && <p className="dm-muted" style={{ padding: 12 }}>No available data to show.</p>}
                </div>
              </div>
              <div className="dm-ssp-col">
                <div className="dm-row" style={{ justifyContent: "space-between" }}><h4 style={{ fontSize: 15 }}>Linked ({linked.length})</h4><button type="button" className="dm-link" style={{ textDecoration: "none" }} onClick={() => setSsp({})}>Clear all</button></div>
                {linked.length ? (
                  <div className="dm-ssp-list" role="list">
                    {linked.map(([name, v]) => (
                      <div key={name} className="dm-ssp-item" role="listitem">
                        <b>{name}</b>
                        <span className={v === "inc" ? "dm-inc" : "dm-exc"} style={{ cursor: "default" }}><span className="mi s18" aria-hidden="true">{v === "inc" ? "check_circle_outline" : "block"}</span>{v === "inc" ? "Included" : "Excluded"}</span>
                        <button type="button" className="dm-iconbtn" aria-label={`Remove ${name}`} onClick={() => setSsp((o) => { const c = { ...o }; delete c[name]; return c; })}><span className="mi s18" aria-hidden="true">close</span></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dm-ssp-empty"><span className="mi" aria-hidden="true">check_circle_outline</span><b>All SSP Endpoints</b><span>If no specific SSP endpoints are selected, the campaign will use all available traffic.</span></div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="dm-b-foot">
          <button type="button" className="dm-btn" onClick={onCancel}>Cancel</button>
          {step > 0 && <button type="button" className="dm-btn" onClick={() => setStep(step - 1)}>Previous</button>}
          {step < 4
            ? <button type="button" className="dm-btn dm-btn-dark" disabled={!valid[step]} onClick={() => setStep(step + 1)}>Next</button>
            : <><button type="button" className="dm-btn dm-btn-dark" onClick={() => setDone(true)}>Save</button><button type="button" className="dm-btn dm-btn-dark" onClick={() => setDone(true)}>Save &amp; Add Creatives</button></>}
        </div>
      </div>
      {Summary}
    </div>
  );
}
