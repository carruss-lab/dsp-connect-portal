import { useState, useEffect } from "react";
import { sendWelcomeEmail, sendOnboardingCompleteEmail, sendClientApprovedEmail, sendPayoutEmail, sendTicketReplyEmail } from "./emails";
import { supabase } from "./supabase";

const REV_RATE = 0.10;
const MIN_EQUITY_AUM = 5000000;
const VERTICALS = ["Healthcare","Legal","Financial Services","Automotive","Real Estate","Home Services","Franchise","Hospitality","Political","Enterprise","Other"];
const TRAILING_OPTIONS = [
  {value:"A",label:"Option A — Compensation ceases on termination date"},
  {value:"B",label:"Option B — Compensation continues for specified days on originated active accounts"},
  {value:"C",label:"Option C — As provided in a separate written agreement"},
];
const PIPELINE_STAGES = ["Lead","Deposit Paid","Review","Approved","Active"];
const ADMIN_EMAIL = "admin@getdspconnect.com";
const ADMIN_PASS = "dspconnect2025";

const fmt$ = n => "$" + Math.round(n||0).toLocaleString();
const fmtK = n => (n||0)>=1000000 ? "$"+((n||0)/1000000).toFixed(2)+"M" : (n||0)>=1000 ? "$"+Math.round((n||0)/1000)+"k" : "$"+Math.round(n||0);
const today = () => new Date().toISOString().slice(0,10);
const daysIn = d => Math.max(0,Math.floor((Date.now()-new Date(d))/86400000));
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—";
const fmtMono = v => <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--text2)"}}>{v||"—"}</span>;

const DAY30=[{aum:500000,award:3.0},{aum:100000,award:1.5},{aum:50000,award:0.5}];
const DAY60=[{aum:2000000,award:3.0},{aum:1000000,award:2.0},{aum:500000,award:1.0}];
const DAY90=[{aum:3000000,award:4.0},{aum:2000000,award:3.0},{aum:1000000,award:2.0}];

function calcEquity(p){
  const annual=p.annual_aum||0;
  if(annual<MIN_EQUITY_AUM)return{qualifies:false,base:0,a30:0,a60:0,a90:0,total:0};
  const a30=(DAY30.find(t=>(p.day30_aum||0)>=t.aum)||{award:0}).award;
  const a60=(DAY60.find(t=>(p.day60_aum||0)>=t.aum)||{award:0}).award;
  const a90=(DAY90.find(t=>(p.day90_aum||0)>=t.aum)||{award:0}).award;
  return{qualifies:true,base:5,a30,a60,a90,total:Math.min(5+a30+a60+a90,15)};
}
function calcScore(p,pipeline){
  let s=0; const aum=p.monthly_spend||0;
  if(aum>0)s+=20; if(aum>=100000)s+=15; if(aum>=250000)s+=15;
  const myPipe=pipeline.filter(c=>c.partner_id===p.id);
  s+=Math.min(myPipe.length*5,20);
  s+=Math.min(myPipe.filter(c=>c.stage==="Active").length*5,20);
  return Math.min(s,100);
}


function detectType(url="",typeHint=""){
  if(typeHint==="video")return"video";
  const u=url.toLowerCase();
  if(u.includes("youtube.com")||u.includes("youtu.be"))return"youtube";
  if(u.includes("vimeo.com"))return"vimeo";
  if(u.endsWith(".pdf")||u.includes("drive.google.com"))return"pdf";
  if(typeHint==="pdf")return"pdf";
  return"link";
}
function getYouTubeId(url=""){
  const m=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m?m[1]:null;
}
function getVimeoId(url=""){
  const m=url.match(/vimeo\.com\/(\d+)/);
  return m?m[1]:null;
}

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────
const S = {
  card: {background:"var(--bg)",border:"0.5px solid var(--line2)",borderRadius:"var(--r-lg)"},
  cardInner: {background:"var(--bg2)",border:"0.5px solid var(--line)",borderRadius:"var(--r)"},
  pill: (bg,fg) => ({fontSize:10,fontWeight:600,letterSpacing:"0.5px",padding:"3px 8px",borderRadius:3,background:bg,color:fg,whiteSpace:"nowrap",textTransform:"uppercase",fontFamily:"var(--mono)"}),
  label: {fontSize:10,color:"var(--text3)",letterSpacing:"0.6px",textTransform:"uppercase",fontWeight:500},
  mono: {fontFamily:"var(--mono)",fontSize:12,color:"var(--text2)"},
};

// ── UI PRIMITIVES ─────────────────────────────────────────────────────────
function Logo(){
  return <div style={{padding:"18px 16px 14px"}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <img src="/logo.png" alt="DSP Connect" style={{width:22,height:22,objectFit:"contain",flexShrink:0}}/>
      <div>
        <div style={{fontSize:11,fontWeight:600,color:"var(--text)",letterSpacing:"0.8px",textTransform:"uppercase"}}>DSP Connect</div>
        <div style={{fontSize:9,color:"var(--text3)",letterSpacing:"0.5px"}}>Partner Portal</div>
      </div>
    </div>
  </div>;
}

function Avatar({name,size=32}){
  const i=(name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  return <div style={{width:size,height:size,borderRadius:"50%",background:"var(--blue-bg2)",border:"0.5px solid rgba(43,31,232,0.3)",color:"var(--blue-lt)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.32,fontWeight:600,flexShrink:0,fontFamily:"var(--mono)",letterSpacing:"0.5px"}}>{i}</div>;
}

function StatusBadge({s}){
  const m={
    Active:["var(--green-bg)","var(--green)"],Onboarding:["var(--amber-bg)","var(--amber)"],
    Inactive:["var(--red-bg)","var(--red)"],"Pending Setup":["rgba(255,255,255,0.04)","var(--text3)"],
    Lead:["rgba(255,255,255,0.04)","var(--text3)"],"Deposit Paid":["var(--amber-bg)","var(--amber)"],
    Review:["var(--blue-bg)","var(--blue-lt)"],Approved:["var(--green-bg)","var(--green)"],
    Paid:["var(--green-bg)","var(--green)"],Open:["var(--amber-bg)","var(--amber)"],Closed:["rgba(255,255,255,0.04)","var(--text3)"],
  };
  const[bg,fg]=m[s]||["rgba(255,255,255,0.04)","var(--text3)"];
  return <span style={S.pill(bg,fg)}>{s}</span>;
}

function KPI({label,value,sub,accent}){
  return <div style={{...S.card,padding:"18px 20px"}}>
    <div style={{...S.label,marginBottom:10}}>{label}</div>
    <div style={{fontSize:24,fontWeight:500,color:accent==="green"?"var(--green)":accent==="blue"?"var(--blue-lt)":accent==="amber"?"var(--amber)":"var(--text)",fontFamily:mono||accent?"var(--mono)":"var(--font)",letterSpacing:"-0.3px",lineHeight:1}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:"var(--text3)",marginTop:6}}>{sub}</div>}
  </div>;
}

function Card({children,style={}}){return <div style={{...S.card,...style}}>{children}</div>;}
function CardHead({title,sub,action,border=true}){
  return <div style={{padding:"14px 18px",borderBottom:border?"0.5px solid var(--line)":"none",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
    <div><div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{title}</div>{sub&&<div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{sub}</div>}</div>
    {action}
  </div>;
}

function Bar({pct,color="var(--blue)"}){
  return <div style={{height:3,background:"var(--line2)",borderRadius:2,overflow:"hidden"}}>
    <div style={{height:"100%",width:`${Math.min(pct||0,100)}%`,background:color,borderRadius:2,transition:"width 0.6s ease"}}/>
  </div>;
}

function Btn({onClick,children,variant="ghost",size="md",disabled}){
  const variants={
    primary:{background:"var(--blue)",color:"#fff",border:"none",fontWeight:500},
    success:{background:"var(--green-bg)",color:"var(--green)",border:"0.5px solid rgba(29,184,122,0.25)"},
    danger:{background:"var(--red-bg)",color:"var(--red)",border:"0.5px solid rgba(217,79,79,0.25)"},
    ghost:{background:"transparent",color:"var(--text2)",border:"0.5px solid var(--line3)"},
    link:{background:"transparent",color:"var(--blue-lt)",border:"none",padding:"0"},
  };
  const sizes={sm:{fontSize:11,padding:"4px 10px",borderRadius:4},md:{fontSize:12,padding:"7px 14px",borderRadius:5},lg:{fontSize:13,padding:"9px 20px",borderRadius:5}};
  return <button onClick={onClick} disabled={disabled} style={{...variants[variant],...sizes[size],cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.4:1,fontFamily:"var(--font)",letterSpacing:"0.1px",transition:"opacity 0.15s",whiteSpace:"nowrap"}}>{children}</button>;
}

function Empty({icon,title,sub,cta,onCta}){
  return <Card style={{padding:"52px 32px",textAlign:"center"}}>
    <i className={`ti ti-${icon}`} style={{fontSize:32,color:"var(--text3)",display:"block",marginBottom:14}}/>
    <div style={{fontSize:14,fontWeight:500,color:"var(--text)",marginBottom:6}}>{title}</div>
    <div style={{fontSize:12,color:"var(--text3)",marginBottom:cta?18:0}}>{sub}</div>
    {cta&&<Btn onClick={onCta} variant="primary" size="md">{cta}</Btn>}
  </Card>;
}

function Spinner(){
  return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:48,color:"var(--text3)",fontSize:12,gap:8}}>
    <i className="ti ti-loader-2" style={{fontSize:18,animation:"spin 1s linear infinite",color:"var(--blue-lt)"}}/>Loading
  </div>;
}

function TableHead({cols}){
  return <div style={{display:"grid",gridTemplateColumns:cols,padding:"8px 18px",borderBottom:"0.5px solid var(--line)",background:"var(--bg)"}}>
    {Array.isArray(cols)?null:null}
  </div>;
}

function Field({label,children,full}){
  return <div style={full?{gridColumn:"1/-1"}:{}}>
    <label style={{...S.label,display:"block",marginBottom:6}}>{label}</label>
    {children}
  </div>;
}


function ResourceEmbed({resource,onClose}){
  const type=detectType(resource.url||"",resource.type);
  const ytId=type==="youtube"?getYouTubeId(resource.url||""):null;
  const viId=type==="vimeo"?getVimeoId(resource.url||""):null;
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:24}}>
    <div style={{...S.card,width:"100%",maxWidth:900,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"13px 16px",borderBottom:"0.5px solid var(--line)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div><div style={{fontSize:14,fontWeight:500}}>{resource.title}</div>{resource.description&&<div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{resource.description}</div>}</div>
        <Btn onClick={onClose} variant="ghost" size="sm"><i className="ti ti-x" style={{fontSize:13}}/></Btn>
      </div>
      <div style={{flex:1,overflow:"auto",background:"var(--bg2)"}}>
        {ytId&&<div style={{position:"relative",paddingBottom:"56.25%",height:0}}><iframe src={"https://www.youtube.com/embed/"+ytId+"?rel=0&modestbranding=1"} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}} allowFullScreen title={resource.title}/></div>}
        {viId&&<div style={{position:"relative",paddingBottom:"56.25%",height:0}}><iframe src={"https://player.vimeo.com/video/"+viId+"?byline=0&portrait=0"} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}} allowFullScreen title={resource.title}/></div>}
        {!ytId&&!viId&&resource.url&&<div style={{padding:24,textAlign:"center"}}><i className={"ti ti-"+(type==="pdf"?"file-type-pdf":"external-link")} style={{fontSize:40,color:"var(--blue)",display:"block",marginBottom:14}}/><div style={{fontSize:13,color:"var(--text2)",marginBottom:16}}>{type==="pdf"?"PDF document":"External resource"}</div><a href={resource.url} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}><Btn variant="primary">Open resource →</Btn></a></div>}
      </div>
    </div>
  </div>;
}

function ResourceCard({resource,onClick}){
  const type=detectType(resource.url||"",resource.type);
  const ytId=type==="youtube"?getYouTubeId(resource.url||""):null;
  return <div onClick={onClick} style={{...S.card,cursor:"pointer",overflow:"hidden",transition:"box-shadow 0.15s"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.10)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.04)"}>
    {ytId?<div style={{position:"relative",paddingBottom:"48%",background:"#000",overflow:"hidden"}}>
      <img src={"https://img.youtube.com/vi/"+ytId+"/mqdefault.jpg"} alt={resource.title} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.85}}/>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:44,height:44,background:"rgba(255,0,0,0.9)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}><i className="ti ti-player-play-filled" style={{fontSize:18,color:"#fff",marginLeft:2}}/></div></div>
    </div>:<div style={{height:80,background:"var(--bg2)",display:"flex",alignItems:"center",justifyContent:"center",borderBottom:"0.5px solid var(--line)"}}><i className={"ti ti-"+(type==="pdf"?"file-type-pdf":type==="video"?"player-play":"external-link")} style={{fontSize:32,color:"var(--blue)"}}/></div>}
    <div style={{padding:"12px 14px"}}>
      <div style={{fontSize:13,fontWeight:500,marginBottom:3}}>{resource.title}</div>
      {resource.description&&<div style={{fontSize:11,color:"var(--text3)",marginBottom:5,lineHeight:1.5}}>{resource.description}</div>}
      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
        <span style={S.pill("var(--blue-bg)","var(--blue)")}>{type==="youtube"?"YouTube":type==="vimeo"?"Vimeo":type.toUpperCase()}</span>
        <span style={{fontSize:10,color:"var(--text3)"}}>{(resource.created_at||"").slice(0,10)}</span>
      </div>
    </div>
  </div>;
}


// ── CAMPAIGN BRIEF FORM COMPONENT ─────────────────────────────────────────
function BriefForm({type,step,setStep,newClient,setNewClient,brief,setBrief,onNext,onSubmit,onCancel}){
  const label=type==="brand"?"Brand client":"Agency client";
  const B=(f)=>({value:brief[f],onChange:e=>setBrief(b=>({...b,[f]:e.target.value}))});

  if(step===1)return <Card style={{marginBottom:14}}>
    <CardHead title={`New ${label} — Step 1 of 2`} sub="Basic information"/>
    <div style={{padding:16}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <Field label={`${type==="brand"?"Company":"Agency"} name *`}><input value={newClient.name} onChange={e=>setNewClient(c=>({...c,name:e.target.value}))}/></Field>
        <Field label="Contact name"><input value={newClient.contact_name} onChange={e=>setNewClient(c=>({...c,contact_name:e.target.value}))}/></Field>
        <Field label="Contact email"><input type="email" value={newClient.email} onChange={e=>setNewClient(c=>({...c,email:e.target.value}))}/></Field>
        <Field label="Estimated monthly spend ($)"><input type="number" value={newClient.monthly_spend} onChange={e=>setNewClient(c=>({...c,monthly_spend:e.target.value}))}/></Field>
        <Field label="Notes" full><input value={newClient.notes} onChange={e=>setNewClient(c=>({...c,notes:e.target.value}))} placeholder="Any initial context"/></Field>
      </div>
      <div style={{padding:"9px 12px",background:"var(--blue-bg)",border:"0.5px solid rgba(26,20,212,0.1)",borderRadius:5,fontSize:11,color:"var(--blue)",marginBottom:12}}>
        After basic info, you will complete a campaign brief — this gets submitted to DSP Connect for review and automatically notifies the team.
      </div>
      <div style={{display:"flex",gap:8}}><Btn onClick={onNext} variant="primary" disabled={!newClient.name}>Continue to campaign brief →</Btn><Btn onClick={onCancel} variant="ghost">Cancel</Btn></div>
    </div>
  </Card>;

  return <Card style={{marginBottom:14}}>
    <CardHead title={`Campaign Brief — ${newClient.name}`} sub="Step 2 of 2 · All fields from DSP Connect campaign intake"/>
    <div style={{padding:16}}>
      <div style={{marginBottom:14,padding:"9px 12px",background:"var(--bg2)",borderRadius:5,fontSize:11,color:"var(--text3)",borderLeft:"2px solid var(--blue)"}}>
        <span style={{color:"var(--blue)",fontWeight:500}}>Note:</span> This brief goes directly to DSP Connect for review. Client is submitted as Review status and the team is notified via Slack.
      </div>

      <div style={{fontWeight:500,fontSize:12,color:"var(--text)",marginBottom:10,paddingBottom:6,borderBottom:"0.5px solid var(--line)"}}>Campaign details</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <Field label="Advertiser name"><input {...B("advertiser_name")} placeholder="Legal advertiser name"/></Field>
        <Field label="Company category"><input {...B("company_category")} placeholder="e.g. Healthcare, Retail, Finance"/></Field>
        <Field label="Campaign type"><select {...B("campaign_type")} style={{width:"100%"}}><option value="Managed">Managed (start at $1,000)</option><option value="Self-Service">Self-Service</option></select></Field>
        <Field label="Total budget ($)"><input type="number" {...B("budget_total")} placeholder="0"/></Field>
        <Field label="Start date"><input type="date" {...B("start_date")}/></Field>
        <Field label="End date"><input type="date" {...B("end_date")}/></Field>
        <Field label="Timezone (optional)"><input {...B("timezone")} placeholder="e.g. EST, PST, UTC"/></Field>
        <Field label="GEO targeting"><input {...B("geo")} placeholder="Country, State, City"/></Field>
      </div>

      <div style={{fontWeight:500,fontSize:12,color:"var(--text)",marginBottom:10,paddingBottom:6,borderBottom:"0.5px solid var(--line)"}}>Campaign goals & targeting</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <Field label="Goals" full><textarea {...B("goals")} rows={3} placeholder="e.g. Lead generation, brand awareness, e-commerce, app installs…" style={{resize:"vertical"}}/></Field>
        <Field label="KPIs" full><textarea {...B("kpis")} rows={2} placeholder="e.g. CPC target $2.50, CTR 0.3%, CPA $45…" style={{resize:"vertical"}}/></Field>
        <Field label="Creative type"><select {...B("creative_type")} style={{width:"100%"}}><option value="">Select…</option><option>Video</option><option>Banner</option><option>Native</option><option>Video + Banner</option><option>All formats</option></select></Field>
        <Field label="Traffic type"><select {...B("traffic_type")} style={{width:"100%"}}><option value="">Select…</option><option>In-App</option><option>Web</option><option>In-App + Web</option></select></Field>
        <Field label="Device type"><select {...B("device_type")} style={{width:"100%"}}><option value="">Select…</option><option>PC</option><option>Phones</option><option>Tablets</option><option>Connected TV</option><option>All devices</option></select></Field>
        <Field label="Frequency cap"><input {...B("frequency_cap")} placeholder="e.g. 3 impressions/user/day"/></Field>
      </div>

      <div style={{fontWeight:500,fontSize:12,color:"var(--text)",marginBottom:10,paddingBottom:6,borderBottom:"0.5px solid var(--line)"}}>Advanced targeting & creatives</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <Field label="Additional targeting (optional)"><input {...B("targeting")} placeholder="Age, interests, behavioral, contextual…"/></Field>
        <Field label="Bundles / domains (optional)"><input {...B("bundles_domains")} placeholder="Specific app bundles or domains"/></Field>
        <Field label="1st party data (optional)" full><input {...B("first_party_data")} placeholder="IP lists, ad IDs for include/exclude targeting"/></Field>
        <Field label="Creative file link"><input {...B("creative_file_link")} placeholder="Google Drive, Dropbox, or any URL"/></Field>
        <Field label="Tracking tags"><input {...B("tracking_tags")} placeholder="1x1 pixel, click tracker URL, landing page…"/></Field>
        <Field label="Launch notes" full><textarea {...B("notes")} rows={2} placeholder="Any additional notes for campaign launch…" style={{resize:"vertical"}}/></Field>
      </div>

      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <Btn onClick={()=>setStep(1)} variant="ghost">← Back</Btn>
        <Btn onClick={onSubmit} variant="primary">Submit for review →</Btn>
        <span style={{fontSize:11,color:"var(--text3)",marginLeft:4}}>Submits to Review · Notifies DSP Connect team via Slack</span>
      </div>
    </div>
  </Card>;
}

function THead({cols,labels}){
  return <div style={{display:"grid",gridTemplateColumns:cols,padding:"8px 16px",borderBottom:"0.5px solid var(--line)",background:"var(--bg2)"}}>
    {labels.map(h=><span key={h} style={S.label}>{h}</span>)}
  </div>;
}

// ── NAV ───────────────────────────────────────────────────────────────────
const PARTNER_NAV=[
  {section:"OVERVIEW",items:[{key:"dashboard",icon:"layout-dashboard",label:"Dashboard"}]},
  {section:"GROWTH",items:[{key:"brand-clients",icon:"building-skyscraper",label:"Brand clients"},{key:"agency-clients",icon:"briefcase",label:"Agency clients"},{key:"pipeline",icon:"git-branch",label:"Pipeline"}]},
  {section:"OWNERSHIP",items:[{key:"compensation",icon:"currency-dollar",label:"Compensation"},{key:"equity",icon:"chart-donut",label:"Equity"}]},
  {section:"RESOURCES",items:[{key:"training",icon:"school",label:"Training"},{key:"sops",icon:"checklist",label:"SOPs"},{key:"documents",icon:"file-description",label:"Documents"}]},
  {section:"SUPPORT",items:[{key:"support",icon:"headset",label:"Help desk"}]},
];
const ADMIN_NAV=[
  {section:"OVERVIEW",items:[{key:"dashboard",icon:"layout-dashboard",label:"Overview"}]},
  {section:"PARTNERS",items:[{key:"admissions",icon:"user-plus",label:"Admissions"},{key:"partner-mgmt",icon:"users-group",label:"Partner management"}]},
  {section:"CLIENTS",items:[{key:"admin-brands",icon:"building-skyscraper",label:"Brand clients"},{key:"admin-agencies",icon:"briefcase",label:"Agency clients"},{key:"approvals",icon:"circle-check",label:"Approvals"}]},
  {section:"FINANCE",items:[{key:"comp-tracking",icon:"report-money",label:"Compensation"},{key:"payouts",icon:"cash",label:"Payout records"}]},
  {section:"CONTENT",items:[{key:"content-mgmt",icon:"upload",label:"Resources"},{key:"announcements",icon:"speakerphone",label:"Announcements"}]},
  {section:"COMMS",items:[{key:"slack",icon:"brand-slack",label:"Slack"}]},
];

function Sidebar({groups,active,onSelect,top,bottom}){
  return <div style={{width:200,background:"var(--bg)",borderRight:"0.5px solid var(--line)",display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto"}}>
    {top}
    <div style={{flex:1,padding:"8px 0 12px"}}>
      {groups.map(g=><div key={g.section}>
        <div style={{...S.label,padding:"14px 20px 5px"}}>{g.section}</div>
        {g.items.map(n=>{
          const isActive=active===n.key;
          return <button key={n.key} onClick={()=>onSelect(n.key)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 20px",width:"100%",border:"none",background:isActive?"var(--blue-bg)":"transparent",color:isActive?"var(--blue-lt)":"var(--text3)",cursor:"pointer",fontSize:12,fontWeight:isActive?500:400,textAlign:"left",borderLeft:isActive?"2px solid var(--gold)":"2px solid transparent",transition:"all 0.15s",fontFamily:"var(--font)"}}>
            <i className={`ti ti-${n.icon}`} style={{fontSize:14,flexShrink:0}}/>
            <span style={{flex:1}}>{n.label}</span>
            {n.badge?<span style={{background:"var(--blue-lt)",color:"var(--bg)",fontSize:9,fontWeight:700,borderRadius:10,padding:"1px 5px",fontFamily:"var(--mono)"}}>{n.badge}</span>:null}
          </button>;
        })}
      </div>)}
    </div>
    {bottom&&<div style={{padding:"12px 20px",borderTop:"0.5px solid var(--line)"}}>{bottom}</div>}
  </div>;
}

// ── LOGIN ─────────────────────────────────────────────────────────────────
function Login({onLogin}){
  const[email,setEmail]=useState("");const[pass,setPass]=useState("");const[err,setErr]=useState("");const[loading,setLoading]=useState(false);
  const attempt=async()=>{
    setErr("");setLoading(true);
    if(email.trim().toLowerCase()===ADMIN_EMAIL&&pass===ADMIN_PASS){setLoading(false);onLogin({role:"admin"});return;}
    const{data,error}=await supabase.from("partners").select("*").eq("email",email.trim().toLowerCase()).eq("password",pass).single();
    setLoading(false);
    if(error||!data){setErr("Invalid credentials.");return;}
    onLogin({role:"partner",partner:data});
  };
  return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(ellipse 80% 50% at 50% -20%,rgba(43,31,232,0.06),transparent)",pointerEvents:"none"}}/>
    <div style={{width:400,animation:"fadeUp 0.4s ease"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{width:44,height:44,background:"linear-gradient(135deg,var(--gold),var(--gold-lt))",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
          <span style={{fontSize:22,fontWeight:700,color:"var(--bg)",fontFamily:"var(--font)"}}>D</span>
        </div>
        <div style={{fontSize:18,fontWeight:600,color:"var(--text)",letterSpacing:"0.5px",marginBottom:4}}>DSP CONNECT</div>
        <div style={{fontSize:11,color:"var(--text3)",letterSpacing:"1px",textTransform:"uppercase"}}>Managing Partner Portal</div>
      </div>
      <div style={{...S.card,padding:28}}>
        <div style={{marginBottom:14}}>
          <label style={{...S.label,display:"block",marginBottom:6}}>Email address</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} placeholder="partner@firm.com"/>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{...S.label,display:"block",marginBottom:6}}>Password</label>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} placeholder="••••••••"/>
        </div>
        {err&&<div style={{fontSize:12,color:"var(--red)",background:"var(--red-bg)",border:"0.5px solid rgba(224,85,85,0.2)",borderRadius:6,padding:"8px 12px",marginBottom:14}}>{err}</div>}
        <Btn onClick={attempt} variant="primary" size="lg" disabled={loading}>{loading?"Authenticating…":"Sign in"}</Btn>
        <div style={{marginTop:18,padding:"12px 14px",background:"var(--bg2)",borderRadius:6,fontSize:11,color:"var(--text3)",borderLeft:"2px solid var(--gold)"}}>
          <span style={{color:"var(--blue-lt)",fontWeight:500}}>Admin:</span> {ADMIN_EMAIL}<br/>
          Partner credentials are issued by admin and delivered directly.
        </div>
      </div>
    </div>
  </div>;
}

// ── ONBOARDING ────────────────────────────────────────────────────────────
function Onboarding({partner,onComplete}){
  const[step,setStep]=useState(0);const[sig,setSig]=useState("");
  const[checks,setChecks]=useState({comp:false,equity:false,ops:false,noncompete:false,sig:false});

  const Row=({k,v})=><div style={{display:"flex",gap:16,padding:"9px 0",borderBottom:"0.5px solid var(--line)"}}>
    <span style={{...S.label,minWidth:160,flexShrink:0,paddingTop:1}}>{k}</span>
    <span style={{fontSize:13,color:"var(--text)"}}>{v}</span>
  </div>;

  const Check=({id,label,checked,onChange})=><label style={{display:"flex",alignItems:"flex-start",gap:10,marginTop:14,cursor:"pointer",fontSize:12,color:"var(--text2)"}}>
    <input type="checkbox" checked={checked} onChange={onChange} style={{width:14,height:14,flexShrink:0,marginTop:2,accentColor:"var(--blue-lt)"}}/>
    {label}
  </label>;

  const steps=[
    {title:"Cash Compensation Policy",tag:"Exhibit B",icon:"currency-dollar",content:<div>
      <div style={{fontFamily:"var(--font)",fontSize:16,color:"var(--text)",marginBottom:16}}>Managing Partner Cash Compensation Policy</div>
      <Row k="Rate" v="10% of Qualified Ad Spend Under Management (AUM)"/>
      <Row k="Payment schedule" v="Monthly, after advertiser funds collected by DSP Connect"/>
      <Row k="Qualifying spend" v="Contracted, activated, invoiced, and collected"/>
      <Row k="Non-qualifying" v="Unpaid invoices, chargebacks, refunds, disputes, write-offs"/>
      <Row k="Guarantee" v="Compensation is production-based only — no salary minimum"/>
      <Check id="comp" label="I have read and understood the Cash Compensation Policy (Exhibit B)" checked={checks.comp} onChange={e=>setChecks(c=>({...c,comp:e.target.checked}))}/>
    </div>},
    {title:"Equity Vesting Policy",tag:"Exhibit A",icon:"chart-donut",content:<div>
      <div style={{fontFamily:"var(--font)",fontSize:16,color:"var(--text)",marginBottom:16}}>Equity Vesting, Performance & Acceleration Policy</div>
      <Row k="Equity pool" v="40% of total LLC membership interests"/>
      <Row k="Base grant" v="5.00% upon qualifying"/>
      <Row k="Annual minimum" v="$5,000,000 AUM in first 12 months"/>
      <Row k="Vesting cliff" v="1 year — no partial vesting before anniversary date"/>
      <Row k="Maximum (Year 1)" v="15.00% — 5% base + up to 10% acceleration"/>
      <div style={{marginTop:14,padding:"10px 14px",background:"var(--amber-bg)",border:"0.5px solid rgba(240,168,50,0.2)",borderRadius:6,fontSize:12,color:"var(--amber)"}}>⚠ Missed acceleration windows are permanently forfeited and do not carry forward.</div>
      <Check id="equity" label="I have read and understood the Equity Vesting Policy (Exhibit A)" checked={checks.equity} onChange={e=>setChecks(c=>({...c,equity:e.target.checked}))}/>
    </div>},
    {title:"Operating Rules",tag:"Acknowledgment",icon:"checklist",content:<div>
      <div style={{fontFamily:"var(--font)",fontSize:16,color:"var(--text)",marginBottom:16}}>Operating Rules & Required Acknowledgements</div>
      <Row k="Non-compete" v={`${partner.non_compete_days||90} days post-termination`}/>
      <Row k="Trailing compensation" v={TRAILING_OPTIONS.find(o=>o.value===(partner.trailing_option||"A"))?.label}/>
      <Row k="Account ownership" v="DSP Connect owns all advertiser accounts"/>
      <Row k="Intellectual property" v="All platform materials remain property of DSP Connect"/>
      <Check id="ops" label="I acknowledge and agree to the operating rules above" checked={checks.ops} onChange={e=>setChecks(c=>({...c,ops:e.target.checked}))}/>
      <Check id="noncompete" label="I acknowledge the non-compete period and trailing compensation terms" checked={checks.noncompete} onChange={e=>setChecks(c=>({...c,noncompete:e.target.checked}))}/>
    </div>},
    {title:"Digital Signature",tag:"Final step",icon:"pencil",content:<div>
      <div style={{fontFamily:"var(--font)",fontSize:16,color:"var(--text)",marginBottom:16}}>Admission Confirmation & Digital Signature</div>
      <Row k="Full legal name" v={partner.legal_name||partner.name}/>
      <Row k="Email address" v={partner.email}/>
      <Row k="Vertical" v={partner.vertical}/>
      <Row k="Start date" v={partner.start_date}/>
      <Row k="LLC entity" v="DSP Connect Holdings (Influence Crafters, LLC)"/>
      <Row k="Maximum equity (Year 1)" v="15.00%"/>
      <div style={{marginTop:18}}>
        <label style={{...S.label,display:"block",marginBottom:8}}>Type your full legal name to execute</label>
        <input value={sig} onChange={e=>{setSig(e.target.value);setChecks(c=>({...c,sig:e.target.value.trim().length>4}));}} placeholder={partner.legal_name||partner.name} style={{fontStyle:"italic",fontSize:16,fontFamily:"var(--font)",color:"var(--blue-lt)"}}/>
      </div>
      <div style={{marginTop:14,padding:"10px 14px",background:"var(--green-bg)",border:"0.5px solid rgba(46,204,138,0.2)",borderRadius:6,fontSize:12,color:"var(--green)"}}>✓ Exhibits A & B acknowledged · Executed {today()}</div>
    </div>},
  ];

  const s=steps[step];
  const canAdvance=step===0?checks.comp:step===1?checks.equity:step===2?(checks.ops&&checks.noncompete):checks.sig;
  const complete=async()=>{
    await supabase.from("signatures").insert([{partner_id:partner.id,partner_name:partner.name,legal_name:sig,exhibit_a:true,exhibit_b:true,operating_rules:true,non_compete:true,policy_version:"v1.0",signed_at:new Date().toISOString()}]);
    onComplete();
  };

  return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",padding:24}}>
    <div style={{width:"100%",maxWidth:660,animation:"fadeUp 0.4s ease"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:11,color:"var(--text3)",letterSpacing:"1px",textTransform:"uppercase",marginBottom:6}}>DSP Connect · Managing Partner Onboarding</div>
        <div style={{fontFamily:"var(--font)",fontSize:20,color:"var(--text)"}}>Welcome, {(partner.name||"").split(" ")[0]}</div>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:24}}>
        {steps.map((_,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
          <div style={{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:600,fontFamily:"var(--mono)",background:i<step?"var(--green-bg)":i===step?"var(--blue-bg)":"var(--bg2)",color:i<step?"var(--green)":i===step?"var(--blue-lt)":"var(--text3)",border:`0.5px solid ${i<step?"rgba(46,204,138,0.3)":i===step?"rgba(43,31,232,0.25)":"var(--line)"}`}}>
            {i<step?<i className="ti ti-check" style={{fontSize:10}}/>:i+1}
          </div>
          {i<steps.length-1&&<div style={{width:32,height:1,background:i<step?"var(--green)":"var(--line2)"}}/>}
        </div>)}
      </div>
      <Card style={{marginBottom:14}}>
        <div style={{padding:"16px 20px",borderBottom:"0.5px solid var(--line)",display:"flex",alignItems:"center",gap:10}}>
          <i className={`ti ti-${s.icon}`} style={{fontSize:16,color:"var(--blue-lt)"}}/>
          <span style={{fontSize:14,fontWeight:500,color:"var(--text)",flex:1}}>{s.title}</span>
          <span style={{...S.pill("var(--blue-bg)","var(--blue-lt)")}}>{s.tag}</span>
        </div>
        <div style={{padding:20}}>{s.content}</div>
      </Card>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        {step>0&&<Btn onClick={()=>setStep(s=>s-1)} variant="ghost">← Back</Btn>}
        {step<steps.length-1
          ?<Btn onClick={()=>{if(canAdvance)setStep(s=>s+1);}} variant={canAdvance?"primary":"ghost"} disabled={!canAdvance}>Continue →</Btn>
          :<Btn onClick={complete} variant={canAdvance?"success":"ghost"} disabled={!canAdvance}>Execute & access dashboard →</Btn>}
      </div>
    </div>
  </div>;
}

// ── PARTNER APP ───────────────────────────────────────────────────────────
function PartnerApp({partner,onLogout}){
  const[view,setView]=useState("dashboard");
  const[pipeline,setPipeline]=useState([]);
  const[resources,setResources]=useState([]);
  const[tickets,setTickets]=useState([]);
  const[payouts,setPayouts]=useState([]);
  const[announcements,setAnnouncements]=useState([]);
  const[loading,setLoading]=useState(true);
  const[showAddClient,setShowAddClient]=useState(false);
  const[clientType,setClientType]=useState("brand");
  const[newClient,setNewClient]=useState({name:"",contact_name:"",email:"",monthly_spend:"",notes:""});
  const[newTicket,setNewTicket]=useState({type:"Client Issue",subject:"",details:""});
  const[showTicket,setShowTicket]=useState(false);
  const[payView,setPayView]=useState("all");
  const[activeResource,setActiveResource]=useState(null);

  useEffect(()=>{
    Promise.all([
      supabase.from("pipeline").select("*").eq("partner_id",partner.id).order("created_at",{ascending:false}),
      supabase.from("resources").select("*").order("created_at",{ascending:false}),
      supabase.from("tickets").select("*").eq("partner_id",partner.id).order("created_at",{ascending:false}),
      supabase.from("payouts").select("*").eq("partner_id",partner.id).order("created_at",{ascending:false}),
      supabase.from("announcements").select("*").eq("active",true).order("created_at",{ascending:false}),
    ]).then(([p,r,t,py,an])=>{setPipeline(p.data||[]);setResources(r.data||[]);setTickets(t.data||[]);setPayouts(py.data||[]);setAnnouncements(an.data||[]);setLoading(false);});
  },[partner.id]);

  const days=daysIn(partner.start_date);
  const equity=calcEquity(partner);
  const score=calcScore(partner,pipeline);
  const activeClients=pipeline.filter(c=>c.stage==="Active");
  const totalMonthlyAUM=activeClients.reduce((s,c)=>s+(c.monthly_spend||0),0);
  const monthlyComp=totalMonthlyAUM*REV_RATE;
  const brandClients=pipeline.filter(c=>c.type==="brand");
  const agencyClients=pipeline.filter(c=>c.type==="agency");
  const totalPaid=payouts.reduce((s,p)=>s+(p.amount||0),0);
  const now=new Date();
  const paidThisMonth=payouts.filter(p=>{const d=new Date(p.created_at);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();}).reduce((s,p)=>s+(p.amount||0),0);

  const startClientBrief=(type)=>{
    if(!newClient.name)return;
    setClientType(type);
    setPendingClient({...newClient,type});
    setBriefStep(2);
  };

  const submitClientWithBrief=async()=>{
    const pc=pendingClient;
    if(!pc)return;
    const{data:pipeData}=await supabase.from("pipeline").insert([{type:pc.type,partner_id:partner.id,partner_name:partner.name,name:pc.name,contact_name:pc.contact_name,email:pc.email,monthly_spend:parseFloat(pc.monthly_spend)||0,notes:pc.notes,stage:"Review"}]).select().single();
    if(pipeData){
      setPipeline(p=>[pipeData,...p]);
      await supabase.from("campaign_briefs").insert([{pipeline_id:pipeData.id,partner_id:partner.id,partner_name:partner.name,client_name:pc.name,client_type:pc.type,...brief,budget_total:parseFloat(brief.budget_total)||0,status:"Submitted"}]);
      // Store Slack notification for admin
      await supabase.from("slack_notifications").insert([{
        channel:"#new-client-briefs",
        message:`📋 New campaign brief submitted\nPartner: ${partner.name}\nClient: ${pc.name} (${pc.type})\nSpend: ${fmtK(parseFloat(pc.monthly_spend)||0)}/mo\nCampaign type: ${brief.campaign_type}\nGEO: ${brief.geo||"—"}\nCreative: ${brief.creative_type||"—"}\nGoals: ${(brief.goals||"—").slice(0,100)}\nNeeds review in DSP Connect portal → Approvals`,
        sent:false,
        created_at:new Date().toISOString()
      }]).catch(()=>{});
    }
    setNewClient({name:"",contact_name:"",email:"",monthly_spend:"",notes:""});
    setBrief({advertiser_name:"",company_category:"",campaign_type:"Managed",goals:"",budget_total:"",start_date:"",end_date:"",timezone:"",geo:"",frequency_cap:"",creative_type:"",traffic_type:"",device_type:"",targeting:"",bundles_domains:"",first_party_data:"",kpis:"",creative_file_link:"",tracking_tags:"",notes:""});
    setPendingClient(null);setBriefStep(1);setShowAddClient(false);
  };

  const addClient=async(type)=>{
    if(!newClient.name)return;
    const{data}=await supabase.from("pipeline").insert([{type,partner_id:partner.id,partner_name:partner.name,...newClient,monthly_spend:parseFloat(newClient.monthly_spend)||0,stage:"Lead"}]).select().single();
    if(data)setPipeline(p=>[data,...p]);
    setNewClient({name:"",contact_name:"",email:"",monthly_spend:"",notes:""});setShowAddClient(false);
  };
  const moveStage=async(id,stage)=>{
    await supabase.from("pipeline").update({stage}).eq("id",id);
    setPipeline(p=>p.map(c=>c.id===id?{...c,stage}:c));
  };
  const submitTicket=async()=>{
    if(!newTicket.subject)return;
    const{data}=await supabase.from("tickets").insert([{partner_id:partner.id,partner_name:partner.name,...newTicket,status:"Open"}]).select().single();
    if(data)setTickets(t=>[data,...t]);
    setNewTicket({type:"Client Issue",subject:"",details:""});setShowTicket(false);
  };

  const filteredPayouts=payouts.filter(p=>{
    const d=new Date(p.created_at);
    if(payView==="monthly")return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
    if(payView==="weekly")return d>=(new Date(now-7*86400000));
    return true;
  });

  const navGroups=PARTNER_NAV;
  const sideTop=<div>
    <Logo/>
    <div style={{padding:"0 20px 14px",borderBottom:"0.5px solid var(--line)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <Avatar name={partner.name} size={34}/>
        <div><div style={{fontSize:12,fontWeight:500,color:"var(--text)"}}>{(partner.name||"").split(" ")[0]}</div><div style={{fontSize:10,color:"var(--text3)"}}>{partner.agency||partner.vertical}</div></div>
      </div>
    </div>
  </div>;
  const sideBottom=<div>
    <div style={{fontSize:10,color:"var(--text3)",marginBottom:8,fontFamily:"var(--mono)"}}>Day {days} of engagement</div>
    <button onClick={onLogout} style={{fontSize:11,color:"var(--text3)",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:0,fontFamily:"var(--font)"}}>
      <i className="ti ti-logout" style={{fontSize:12}}/>Sign out
    </button>
  </div>;

  if(loading)return <div style={{display:"flex",minHeight:"100vh"}}><Sidebar groups={navGroups} active={view} onSelect={setView} top={sideTop} bottom={sideBottom}/><div style={{flex:1}}><Spinner/></div></div>;

  const P=({children})=><div style={{flex:1,overflowY:"auto",padding:24}}>{children}</div>;
  const PH=({title,sub})=><div style={{marginBottom:22}}><div style={{fontFamily:"var(--font)",fontSize:20,color:"var(--text)",marginBottom:3}}>{title}</div>{sub&&<div style={{fontSize:11,color:"var(--text3)"}}>{sub}</div>}</div>;

  return <div style={{display:"flex",minHeight:"100vh",background:"var(--bg)"}}>
    <Sidebar groups={navGroups} active={view} onSelect={setView} top={sideTop} bottom={sideBottom}/>
    <P>

      {view==="dashboard"&&<div>
        <PH title="Dashboard" sub={`${partner.vertical} · ${partner.start_date} · Day ${days}`}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          <KPI label="Active AUM" value={fmtK(totalMonthlyAUM)} sub={`${activeClients.length} active clients`}/>
          <KPI label="Monthly compensation" value={fmt$(monthlyComp)} sub="10% of active AUM" accent="green"/>
          <KPI label="Paid this month" value={fmt$(paidThisMonth)} sub="Recorded payouts" accent="blue"/>
          <div style={{...S.card,padding:"18px 20px"}}>
            <div style={{...S.label,marginBottom:10}}>Partner score</div>
            <div style={{fontSize:26,fontWeight:500,fontFamily:"var(--mono)",color:score>=70?"var(--green)":score>=40?"var(--amber)":"var(--red)",lineHeight:1}}>{score}<span style={{fontSize:13,color:"var(--text3)",fontFamily:"var(--font)"}}>/ 100</span></div>
            <div style={{marginTop:10}}><Bar pct={score} color={score>=70?"var(--green)":score>=40?"var(--amber)":"var(--red)"}/></div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <Card>
            <CardHead title="Announcements" sub="From DSP Connect"/>
            <div style={{padding:14,display:"flex",flexDirection:"column",gap:8}}>
              {announcements.length===0?<>
                <div style={{padding:"10px 14px",background:"var(--blue-bg)",border:"0.5px solid rgba(74,158,255,0.15)",borderRadius:6}}><div style={{fontSize:11,fontWeight:600,color:"var(--blue)",marginBottom:3,letterSpacing:"0.3px",textTransform:"uppercase"}}>Welcome</div><div style={{fontSize:12,color:"var(--text2)"}}>Your Managing Partner portal is active. Complete your 90-day acceleration window to maximize equity.</div></div>
                <div style={{padding:"10px 14px",background:"var(--amber-bg)",border:"0.5px solid rgba(240,168,50,0.15)",borderRadius:6}}><div style={{fontSize:11,fontWeight:600,color:"var(--amber)",marginBottom:3,letterSpacing:"0.3px",textTransform:"uppercase"}}>Reminder</div><div style={{fontSize:12,color:"var(--text2)"}}>Missed acceleration windows are permanently forfeited.</div></div>
              </>:announcements.map(a=>{const[bg,fg,bdr]=a.type==="warning"?["var(--amber-bg)","var(--amber)","rgba(240,168,50,0.15)"]:a.type==="success"?["var(--green-bg)","var(--green)","rgba(46,204,138,0.15)"]:["var(--blue-bg)","var(--blue)","rgba(74,158,255,0.15)"];return <div key={a.id} style={{padding:"10px 14px",background:bg,border:`0.5px solid ${bdr}`,borderRadius:6}}><div style={{fontSize:11,fontWeight:600,color:fg,marginBottom:3,letterSpacing:"0.3px",textTransform:"uppercase"}}>{a.title}</div><div style={{fontSize:12,color:"var(--text2)"}}>{a.body}</div></div>;})}
            </div>
          </Card>
          <Card>
            <CardHead title="90-Day Acceleration" sub={`Day ${Math.min(days,90)} of 90`}/>
            <div style={{padding:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
                {[{label:"Day 1–30",done:days>30,active:days<=30,award:(DAY30.find(t=>(partner.day30_aum||0)>=t.aum)||{award:0}).award,max:3},
                  {label:"Day 31–60",done:days>60,active:days>30&&days<=60,award:(DAY60.find(t=>(partner.day60_aum||0)>=t.aum)||{award:0}).award,max:3},
                  {label:"Day 61–90",done:days>90,active:days>60&&days<=90,award:(DAY90.find(t=>(partner.day90_aum||0)>=t.aum)||{award:0}).award,max:4},
                ].map(w=><div key={w.label} style={{padding:"12px",background:w.active?"var(--blue-bg)":w.done?"var(--green-bg)":"var(--bg2)",borderRadius:6,border:`0.5px solid ${w.active?"rgba(43,31,232,0.18)":w.done?"rgba(46,204,138,0.2)":"var(--line)"}`}}>
                  <div style={{fontSize:9,fontWeight:600,letterSpacing:"0.5px",color:w.active?"var(--blue-lt)":w.done?"var(--green)":"var(--text3)",textTransform:"uppercase",marginBottom:6}}>{w.label}</div>
                  <div style={{fontFamily:"var(--mono)",fontSize:22,fontWeight:400,color:w.active?"var(--blue-lt)":w.done?"var(--green)":"var(--text3)",lineHeight:1}}>{w.award.toFixed(1)}<span style={{fontSize:12}}>%</span></div>
                  <div style={{fontSize:10,color:"var(--text3)",marginTop:3}}>max {w.max}%</div>
                </div>)}
              </div>
              <div style={{borderTop:"0.5px solid var(--line)",paddingTop:12}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:6}}><span style={{color:"var(--text3)"}}>Total equity earned</span><span style={{fontFamily:"var(--mono)",color:"var(--blue-lt)",fontWeight:500}}>{equity.total.toFixed(2)}% / 15.00%</span></div>
                <Bar pct={(equity.total/15)*100} color="var(--blue-lt)"/>
              </div>
            </div>
          </Card>
        </div>
        <Card>
          <CardHead title="Client pipeline" action={<Btn onClick={()=>setView("pipeline")} variant="link" size="sm">View all →</Btn>}/>
          {pipeline.length===0?<div style={{padding:"28px 18px",textAlign:"center",fontSize:12,color:"var(--text3)"}}>No clients yet. <button onClick={()=>setView("brand-clients")} style={{background:"none",border:"none",color:"var(--blue-lt)",cursor:"pointer",fontSize:12,fontFamily:"var(--font)"}}>Add your first →</button></div>
          :<div style={{padding:"4px 0"}}>
            {PIPELINE_STAGES.map(stage=>{const inStage=pipeline.filter(c=>c.stage===stage);if(!inStage.length)return null;
              return <div key={stage} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 18px",borderBottom:"0.5px solid var(--line)"}}>
                <StatusBadge s={stage}/><span style={{fontSize:12,color:"var(--text3)",flex:1}}>{inStage.length} client{inStage.length>1?"s":""}</span>
                <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--text2)"}}>{fmtK(inStage.reduce((s,c)=>s+(c.monthly_spend||0),0))}/mo</span>
              </div>;
            })}
          </div>}
        </Card>
      </div>}

      {view==="brand-clients"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
          <PH title="Brand Clients" sub="Direct advertisers under management"/>
          <Btn onClick={()=>{setClientType("brand");setShowAddClient(true);}} variant="primary">+ Add client</Btn>
        </div>
        {showAddClient&&clientType==="brand"&&<BriefForm type="brand" step={briefStep} setStep={setBriefStep} newClient={newClient} setNewClient={setNewClient} brief={brief} setBrief={setBrief} onNext={()=>startClientBrief("brand")} onSubmit={submitClientWithBrief} onCancel={()=>{setShowAddClient(false);setBriefStep(1);setPendingClient(null);}}/>}
        {brandClients.length===0?<Empty icon="building-skyscraper" title="No brand clients yet" sub="Add your first direct advertiser." cta="+ Add brand client" onCta={()=>{setClientType("brand");setShowAddClient(true);}}/>
        :<Card>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"8px 18px",borderBottom:"0.5px solid var(--line)",background:"var(--bg)"}}>
            {["Company","Contact","Monthly Spend","Stage","Added"].map(h=><span key={h} style={S.label}>{h}</span>)}
          </div>
          {brandClients.map((c,i)=><div key={c.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"13px 18px",borderBottom:i<brandClients.length-1?"0.5px solid var(--line)":"none",alignItems:"center"}}>
            <div><div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{c.name}</div>{c.notes&&<div style={{fontSize:11,color:"var(--text3)"}}>{c.notes}</div>}</div>
            <div style={{fontSize:12,color:"var(--text3)"}}>{c.contact_name||"—"}</div>
            <div style={{fontFamily:"var(--mono)",fontSize:12,color:c.stage==="Active"?"var(--green)":"var(--text2)"}}>{fmtK(c.monthly_spend||0)}</div>
            <StatusBadge s={c.stage}/>
            <div style={{fontSize:11,color:"var(--text3)"}}>{(c.created_at||"").slice(0,10)}</div>
          </div>)}
          <div style={{padding:"10px 18px",borderTop:"0.5px solid var(--line)",display:"flex",justifyContent:"space-between",background:"var(--bg)"}}>
            <span style={S.label}>Total active AUM</span>
            <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)"}}>{fmtK(brandClients.filter(c=>c.stage==="Active").reduce((s,c)=>s+(c.monthly_spend||0),0))}/mo</span>
          </div>
        </Card>}
      </div>}

      {view==="agency-clients"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
          <PH title="Agency Clients" sub="Agencies and their managed spend"/>
          <Btn onClick={()=>{setClientType("agency");setShowAddClient(true);}} variant="primary">+ Add agency</Btn>
        </div>
        {showAddClient&&clientType==="agency"&&<BriefForm type="agency" step={briefStep} setStep={setBriefStep} newClient={newClient} setNewClient={setNewClient} brief={brief} setBrief={setBrief} onNext={()=>startClientBrief("agency")} onSubmit={submitClientWithBrief} onCancel={()=>{setShowAddClient(false);setBriefStep(1);setPendingClient(null);}}/>}
        {agencyClients.length===0?<Empty icon="briefcase" title="No agency clients yet" sub="Add agencies to track their managed spend." cta="+ Add agency" onCta={()=>{setClientType("agency");setShowAddClient(true);}}/>
        :<Card>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"8px 18px",borderBottom:"0.5px solid var(--line)",background:"var(--bg)"}}>
            {["Agency","Contact","Monthly Spend","Stage","Added"].map(h=><span key={h} style={S.label}>{h}</span>)}
          </div>
          {agencyClients.map((c,i)=><div key={c.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"13px 18px",borderBottom:i<agencyClients.length-1?"0.5px solid var(--line)":"none",alignItems:"center"}}>
            <div><div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{c.name}</div>{c.notes&&<div style={{fontSize:11,color:"var(--text3)"}}>{c.notes}</div>}</div>
            <div style={{fontSize:12,color:"var(--text3)"}}>{c.contact_name||"—"}</div>
            <div style={{fontFamily:"var(--mono)",fontSize:12,color:c.stage==="Active"?"var(--green)":"var(--text2)"}}>{fmtK(c.monthly_spend||0)}</div>
            <StatusBadge s={c.stage}/>
            <div style={{fontSize:11,color:"var(--text3)"}}>{(c.created_at||"").slice(0,10)}</div>
          </div>)}
          <div style={{padding:"10px 18px",borderTop:"0.5px solid var(--line)",display:"flex",justifyContent:"space-between",background:"var(--bg)"}}>
            <span style={S.label}>Total active AUM</span>
            <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)"}}>{fmtK(agencyClients.filter(c=>c.stage==="Active").reduce((s,c)=>s+(c.monthly_spend||0),0))}/mo</span>
          </div>
        </Card>}
      </div>}

      {view==="pipeline"&&<div>
        <PH title="Pipeline" sub="All clients by stage"/>
        {["brand","agency"].map(type=><div key={type} style={{marginBottom:28}}>
          <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:10}}>{type==="brand"?"Brand clients":"Agency clients"} <span style={{color:"var(--text3)",fontFamily:"var(--mono)"}}>{pipeline.filter(c=>c.type===type).length}</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
            {PIPELINE_STAGES.map(stage=>{const inStage=pipeline.filter(c=>c.type===type&&c.stage===stage);
              return <div key={stage}>
                <div style={{fontSize:10,fontWeight:600,color:"var(--text3)",letterSpacing:"0.4px",textTransform:"uppercase",marginBottom:6,textAlign:"center"}}>{stage} <span style={{fontFamily:"var(--mono)"}}>{inStage.length}</span></div>
                <div style={{minHeight:56,background:"var(--bg2)",borderRadius:6,padding:6,display:"flex",flexDirection:"column",gap:5,border:"0.5px solid var(--line)"}}>
                  {inStage.map(c=><div key={c.id} style={{background:"var(--bg)",border:"0.5px solid var(--line2)",borderRadius:4,padding:"8px 10px"}}>
                    <div style={{fontSize:11,fontWeight:500,color:"var(--text)",marginBottom:3}}>{c.name}</div>
                    <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--green)",marginBottom:6}}>{fmtK(c.monthly_spend||0)}</div>
                    <select value={c.stage} onChange={e=>moveStage(c.id,e.target.value)} style={{fontSize:10,padding:"2px 4px",borderRadius:3,border:"0.5px solid var(--line2)",background:"var(--bg2)",color:"var(--text2)",width:"100%"}}>{PIPELINE_STAGES.map(s=><option key={s}>{s}</option>)}</select>
                  </div>)}
                  {inStage.length===0&&<div style={{fontSize:10,color:"var(--text3)",textAlign:"center",padding:"10px 4px"}}>—</div>}
                </div>
              </div>;
            })}
          </div>
        </div>)}
      </div>}

      {view==="compensation"&&<div>
        <PH title="Compensation" sub="Cash Compensation Policy (Exhibit B) · 10% of Qualified Active AUM"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          <KPI label="Active AUM" value={fmtK(totalMonthlyAUM)} sub="Monthly managed spend"/>
          <KPI label="Monthly comp" value={fmt$(monthlyComp)} sub="10% of active AUM" accent="green"/>
          <KPI label="Paid this month" value={fmt$(paidThisMonth)} accent="blue"/>
          <KPI label="Total paid (lifetime)" value={fmt$(totalPaid)} accent="blue"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <Card>
            <CardHead title="Active client breakdown"/>
            {activeClients.length===0?<div style={{padding:"28px 18px",textAlign:"center",fontSize:12,color:"var(--text3)"}}>No active clients yet</div>
            :<>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",padding:"8px 18px",background:"var(--bg)",borderBottom:"0.5px solid var(--line)"}}>
                {["Client","Type","AUM/mo","10% Comp"].map(h=><span key={h} style={S.label}>{h}</span>)}
              </div>
              {activeClients.map((c,i)=><div key={c.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",padding:"11px 18px",borderBottom:i<activeClients.length-1?"0.5px solid var(--line)":"none",alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{c.name}</span>
                <span style={S.pill(c.type==="brand"?"var(--blue-bg)":"rgba(201,168,76,0.1)",c.type==="brand"?"var(--blue)":"var(--blue-lt)")}>{c.type}</span>
                <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)"}}>{fmtK(c.monthly_spend||0)}</span>
                <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)"}}>{fmt$((c.monthly_spend||0)*REV_RATE)}</span>
              </div>)}
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",padding:"11px 18px",background:"var(--bg)",borderTop:"0.5px solid var(--line)"}}>
                <span style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>Total</span><span/>
                <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)",fontWeight:600}}>{fmtK(totalMonthlyAUM)}</span>
                <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)",fontWeight:600}}>{fmt$(monthlyComp)}</span>
              </div>
            </>}
          </Card>
          <Card>
            <CardHead title="Annual projection"/>
            <div style={{padding:"4px 0"}}>
              {[["Annual AUM",fmtK(totalMonthlyAUM*12)],["Annual compensation",fmt$(monthlyComp*12)],["YTD compensation (est.)",fmt$(monthlyComp*Math.max(1,Math.floor(days/30)))],["Annual run rate",fmtK(monthlyComp*12)]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"11px 18px",borderBottom:"0.5px solid var(--line)",alignItems:"center"}}>
                <span style={{fontSize:12,color:"var(--text3)"}}>{l}</span>
                <span style={{fontFamily:"var(--mono)",fontSize:13,color:"var(--green)",fontWeight:500}}>{v}</span>
              </div>)}
            </div>
          </Card>
        </div>
        <Card>
          <CardHead title="Payout history" action={
            <div style={{display:"flex",gap:4}}>
              {["weekly","monthly","all"].map(v=><button key={v} onClick={()=>setPayView(v)} style={{fontSize:10,padding:"3px 9px",borderRadius:4,border:"0.5px solid var(--line3)",background:payView===v?"var(--blue-bg)":"transparent",color:payView===v?"var(--blue-lt)":"var(--text3)",cursor:"pointer",textTransform:"capitalize",fontFamily:"var(--font)",letterSpacing:"0.3px"}}>{v}</button>)}
            </div>}/>
          {filteredPayouts.length===0?<div style={{padding:"28px 18px",textAlign:"center",fontSize:12,color:"var(--text3)"}}>No payouts recorded for this period.</div>
          :<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",padding:"8px 18px",background:"var(--bg)",borderBottom:"0.5px solid var(--line)"}}>
              {["Date","Period","Amount","Reference","Notes"].map(h=><span key={h} style={S.label}>{h}</span>)}
            </div>
            {filteredPayouts.map((p,i,arr)=><div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",padding:"12px 18px",borderBottom:i<arr.length-1?"0.5px solid var(--line)":"none",alignItems:"center"}}>
              <span style={{fontSize:11,color:"var(--text3)"}}>{fmtDate(p.created_at)}</span>
              <span style={{fontSize:12,color:"var(--text2)"}}>{p.period_label||"—"}</span>
              <span style={{fontFamily:"var(--mono)",fontSize:13,color:"var(--green)",fontWeight:500}}>{fmt$(p.amount)}</span>
              <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--text2)"}}>{p.reference||"—"}</span>
              <span style={{fontSize:11,color:"var(--text3)"}}>{p.notes||"—"}</span>
            </div>)}
            <div style={{padding:"10px 18px",background:"var(--bg)",borderTop:"0.5px solid var(--line)",display:"flex",justifyContent:"space-between"}}>
              <span style={S.label}>Total shown</span>
              <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)",fontWeight:500}}>{fmt$(filteredPayouts.reduce((s,p)=>s+(p.amount||0),0))}</span>
            </div>
          </>}
        </Card>
      </div>}

      {view==="equity"&&<div>
        <PH title="Ownership" sub="Equity Vesting, Performance & Acceleration Policy (Exhibit A)"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          <KPI label="Ownership stake" value={`${equity.total.toFixed(2)}%`} accent="blue"/>
          <KPI label="Vesting status" value={equity.qualifies?"Qualified":"Pending"} sub={equity.qualifies?"$5M AUM threshold met":"$5M AUM required"} accent={equity.qualifies?"green":undefined}/>
          <KPI label="AUM to qualify" value={equity.qualifies?"✓ Met":fmtK(Math.max(0,MIN_EQUITY_AUM-(partner.annual_aum||0)))} sub={equity.qualifies?"":"remaining to $5M"}/>
          <KPI label="Maximum equity" value="15.00%" sub="5% base + 10% acceleration"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card>
            <CardHead title="Equity breakdown"/>
            <div style={{padding:"14px 18px"}}>
              {[{label:"Base grant",pct:equity.base,max:5,color:"var(--blue)",note:"5% upon qualifying"},{label:"Day 1–30 acceleration",pct:equity.a30,max:3,color:"var(--blue-lt)",note:"Max 3%"},{label:"Day 31–60 acceleration",pct:equity.a60,max:3,color:"var(--green)",note:"Max 3%"},{label:"Day 61–90 acceleration",pct:equity.a90,max:4,color:"var(--amber)",note:"Max 4%"}].map(r=><div key={r.label} style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:12,color:"var(--text3)"}}>{r.label} <span style={{fontSize:10,color:"var(--text3)"}}>{r.note}</span></span>
                  <span style={{fontFamily:"var(--mono)",fontSize:12,color:r.color}}>{equity.qualifies?r.pct.toFixed(2):0}%</span>
                </div>
                <Bar pct={equity.qualifies?(r.pct/r.max)*100:0} color={r.color}/>
              </div>)}
              <div style={{borderTop:"0.5px solid var(--line)",paddingTop:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>Total</span>
                <span style={{fontFamily:"var(--mono)",fontSize:16,color:"var(--blue-lt)",fontWeight:500}}>{equity.total.toFixed(2)}% <span style={{fontSize:11,color:"var(--text3)"}}>/ 15.00%</span></span>
              </div>
            </div>
          </Card>
          <Card>
            <CardHead title="Signed documents"/>
            <div style={{padding:"4px 0"}}>
              {[{label:"Equity Vesting Policy",tag:"Exhibit A",date:"On file"},{label:"Cash Compensation Policy",tag:"Exhibit B",date:"On file"},{label:"Managing Partner Admission Notice",tag:"",date:partner.start_date},{label:"Master Operating Agreement",tag:"",date:"On file"}].map((doc,i,arr)=><div key={doc.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 18px",borderBottom:i<arr.length-1?"0.5px solid var(--line)":"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}><i className="ti ti-file-check" style={{fontSize:14,color:"var(--green)"}}/><div><div style={{fontSize:12,color:"var(--text)"}}>{doc.label}</div>{doc.tag&&<div style={{fontSize:10,color:"var(--text3)"}}>{doc.tag}</div>}</div></div>
                <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--text3)"}}>{doc.date}</span>
              </div>)}
            </div>
            <div style={{padding:"10px 18px",background:"var(--green-bg)",borderTop:"0.5px solid rgba(46,204,138,0.15)",margin:"0"}}>
              <span style={{fontSize:11,color:"var(--green)"}}>✓ All documents executed on {partner.start_date}</span>
            </div>
          </Card>
        </div>
      </div>}

      {["training","sops","documents"].includes(view)&&<div>
        {activeResource&&<ResourceEmbed resource={activeResource} onClose={()=>setActiveResource(null)}/>}
        <PH title={view==="training"?"Training":view==="sops"?"SOPs":"Documents"} sub={view==="training"?"Click any resource to open it":""}/>
        {resources.filter(r=>r.category===view).length===0
          ?<Empty icon="file-description" title="No resources yet" sub="Admin will upload materials here shortly."/>
          :<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {resources.filter(r=>r.category===view).map(r=><ResourceCard key={r.id} resource={r} onClick={()=>setActiveResource(r)}/>)}
          </div>}
      </div>}

      {view==="support"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
          <PH title="Help Desk" sub="Submit issues to the DSP Connect operations team"/>
          <Btn onClick={()=>setShowTicket(true)} variant="primary">+ New ticket</Btn>
        </div>
        {showTicket&&<Card style={{marginBottom:16}}>
          <CardHead title="New support ticket"/>
          <div style={{padding:16}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <Field label="Issue type"><select value={newTicket.type} onChange={e=>setNewTicket(t=>({...t,type:e.target.value}))}>{["Client Issue","Agency Issue","Billing Issue","Technical Issue","Other"].map(t=><option key={t}>{t}</option>)}</select></Field>
              <Field label="Subject *"><input value={newTicket.subject} onChange={e=>setNewTicket(t=>({...t,subject:e.target.value}))} placeholder="Brief description"/></Field>
              <Field label="Details" full><textarea value={newTicket.details} onChange={e=>setNewTicket(t=>({...t,details:e.target.value}))} rows={3} style={{resize:"vertical"}}/></Field>
            </div>
            <div style={{display:"flex",gap:8}}><Btn onClick={submitTicket} variant="primary">Submit</Btn><Btn onClick={()=>setShowTicket(false)} variant="ghost">Cancel</Btn></div>
          </div>
        </Card>}
        {tickets.length===0?<Empty icon="headset" title="No tickets yet" sub="Submit a ticket for any client, billing, or technical issue."/>
        :<Card>
          {tickets.map((t,i,arr)=><div key={t.id} style={{padding:"13px 18px",borderBottom:i<arr.length-1?"0.5px solid var(--line)":"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:t.details||t.admin_reply?6:0}}>
              <span style={S.pill("var(--blue-bg)","var(--blue)")}>{t.type}</span>
              <span style={{fontSize:13,fontWeight:500,color:"var(--text)",flex:1}}>{t.subject}</span>
              <StatusBadge s={t.status}/>
              <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--text3)"}}>{(t.created_at||"").slice(0,10)}</span>
            </div>
            {t.details&&<div style={{fontSize:12,color:"var(--text3)",paddingLeft:0,marginBottom:t.admin_reply?6:0}}>{t.details}</div>}
            {t.admin_reply&&<div style={{padding:"8px 12px",background:"var(--green-bg)",border:"0.5px solid rgba(46,204,138,0.15)",borderRadius:6,fontSize:12,color:"var(--green)"}}><span style={{fontWeight:600}}>Response: </span>{t.admin_reply}</div>}
          </div>)}
        </Card>}
      </div>}

    </P>
  </div>;
}

// ── ADMIN APP ─────────────────────────────────────────────────────────────
function AdminApp({onLogout}){
  const[partners,setPartners]=useState([]);
  const[pipeline,setPipeline]=useState([]);
  const[resources,setResources]=useState([]);
  const[tickets,setTickets]=useState([]);
  const[payouts,setPayouts]=useState([]);
  const[announcements,setAnnouncements]=useState([]);
  const[campaignBriefs,setCampaignBriefs]=useState([]);
  const[loading,setLoading]=useState(true);
  const[view,setView]=useState("dashboard");
  const[selected,setSelected]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[expandedBrief,setExpandedBrief]=useState(null);
  const[slackMsgs,setSlackMsgs]=useState([]);
  const[slackMsg,setSlackMsg]=useState("");
  const[slackCh,setSlackCh]=useState("#partner-revenue");
  const[newResource,setNewResource]=useState({title:"",type:"pdf",category:"training",description:"",url:""});
  const[showAddResource,setShowAddResource]=useState(false);
  const[newAnn,setNewAnn]=useState({title:"",body:"",type:"info"});
  const[showAddAnn,setShowAddAnn]=useState(false);
  const[saving,setSaving]=useState(false);
  const[payoutModal,setPayoutModal]=useState(null);
  const[newPayout,setNewPayout]=useState({amount:"",period_label:"",period_start:"",period_end:"",reference:"",notes:""});
  const[ticketReply,setTicketReply]=useState({});

  const blank={name:"",legal_name:"",agency:"",email:"",password:"",vertical:VERTICALS[0],start_date:today(),monthly_spend:"",annual_aum:"",day30_aum:"",day60_aum:"",day90_aum:"",non_compete_days:"90",trailing_option:"A",status:"Pending Setup"};
  const[form,setForm]=useState(blank);const[formErr,setFormErr]=useState("");

  useEffect(()=>{
    Promise.all([
      supabase.from("partners").select("*").order("created_at",{ascending:false}),
      supabase.from("pipeline").select("*").order("created_at",{ascending:false}),
      supabase.from("resources").select("*").order("created_at",{ascending:false}),
      supabase.from("tickets").select("*").order("created_at",{ascending:false}),
      supabase.from("payouts").select("*").order("created_at",{ascending:false}),
      supabase.from("announcements").select("*").order("created_at",{ascending:false}),
      supabase.from("campaign_briefs").select("*").order("created_at",{ascending:false}),
    ]).then(([p,pi,r,t,py,an,cb])=>{
      setPartners(p.data||[]);setPipeline(pi.data||[]);setResources(r.data||[]);setTickets(t.data||[]);setPayouts(py.data||[]);setAnnouncements(an.data||[]);setCampaignBriefs(cb.data||[]);setLoading(false);
      // Load slack notifications separately so a missing table doesn't crash the app
      supabase.from("slack_notifications").select("*").eq("sent",false).order("created_at",{ascending:false})
        .then(({data:sn})=>{
          if(sn&&sn.length>0){
            const msgs=sn.map(n=>({channel:n.channel,message:n.message,time:new Date(n.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}));
            setSlackMsgs(prev=>[...msgs,...prev]);
            sn.forEach(n=>supabase.from("slack_notifications").update({sent:true}).eq("id",n.id));
          }
        }).catch(()=>{});
    });
  },[]);

  const addPartner=async()=>{
    if(!form.name||!form.email||!form.password){setFormErr("Name, email, and password are required.");return;}
    if(partners.find(p=>p.email.toLowerCase()===form.email.toLowerCase())){setFormErr("A partner with this email already exists.");return;}
    setSaving(true);
    const{data,error}=await supabase.from("partners").insert([{...form,monthly_spend:parseFloat(form.monthly_spend)||0,annual_aum:parseFloat(form.annual_aum)||0,day30_aum:parseFloat(form.day30_aum)||0,day60_aum:parseFloat(form.day60_aum)||0,day90_aum:parseFloat(form.day90_aum)||0,non_compete_days:parseInt(form.non_compete_days)||90,onboarded:false}]).select().single();
    setSaving(false);
    if(error){setFormErr(error.message);return;}
    setPartners(p=>[data,...p]);
    sendSlack("#partner-updates",`New partner admitted: ${data.name} (${data.agency||data.vertical}) · Start: ${data.start_date}`);
    sendWelcomeEmail({...data,password:form.password});
    setForm(blank);setShowAdd(false);setFormErr("");
  };

  const updatePartner=async(id,updates)=>{
    await supabase.from("partners").update(updates).eq("id",id);
    setPartners(p=>p.map(x=>x.id===id?{...x,...updates}:x));
    if(selected?.id===id)setSelected(s=>({...s,...updates}));
  };

  const recordPayout=async()=>{
    if(!payoutModal||!newPayout.amount)return;
    const p=partners.find(x=>x.id===payoutModal);
    const{data}=await supabase.from("payouts").insert([{partner_id:payoutModal,partner_name:p?.name,...newPayout,amount:parseFloat(newPayout.amount)||0}]).select().single();
    if(data)setPayouts(py=>[data,...py]);
    sendSlack("#partner-payouts",`Payout recorded: ${p?.name} · ${fmt$(parseFloat(newPayout.amount)||0)} · ${newPayout.period_label||"—"} · Ref: ${newPayout.reference||"—"}`);
    if(p) sendPayoutEmail(p,{...newPayout,amount:parseFloat(newPayout.amount)||0});
    setNewPayout({amount:"",period_label:"",period_start:"",period_end:"",reference:"",notes:""});
    setPayoutModal(null);
  };

  const replyTicket=async(id)=>{
    const reply=ticketReply[id];if(!reply)return;
    const ticket=tickets.find(t=>t.id===id);
    await supabase.from("tickets").update({status:"Closed",admin_reply:reply}).eq("id",id);
    setTickets(t=>t.map(x=>x.id===id?{...x,status:"Closed",admin_reply:reply}:x));
    if(ticket){
      const partner=partners.find(p=>p.id===ticket.partner_id);
      if(partner) sendTicketReplyEmail(partner,ticket,reply);
    }
    setTicketReply(r=>({...r,[id]:""}));
  };

  const addResource=async()=>{
    if(!newResource.title)return;
    const{data}=await supabase.from("resources").insert([newResource]).select().single();
    if(data)setResources(r=>[data,...r]);
    setNewResource({title:"",type:"pdf",category:"training",description:"",url:""});setShowAddResource(false);
  };

  const deleteResource=async(id)=>{
    await supabase.from("resources").delete().eq("id",id);
    setResources(r=>r.filter(x=>x.id!==id));
  };

  const addAnnouncement=async()=>{
    if(!newAnn.title||!newAnn.body)return;
    const{data}=await supabase.from("announcements").insert([{...newAnn,active:true}]).select().single();
    if(data)setAnnouncements(a=>[data,...a]);
    setNewAnn({title:"",body:"",type:"info"});setShowAddAnn(false);
  };

  const toggleAnn=async(id,active)=>{
    await supabase.from("announcements").update({active}).eq("id",id);
    setAnnouncements(a=>a.map(x=>x.id===id?{...x,active}:x));
  };

  const deleteAnn=async(id)=>{
    await supabase.from("announcements").delete().eq("id",id);
    setAnnouncements(a=>a.filter(x=>x.id!==id));
  };

  const movePipelineStage=async(id,stage)=>{
    await supabase.from("pipeline").update({stage}).eq("id",id);
    setPipeline(p=>p.map(c=>c.id===id?{...c,stage}:c));
    if(stage==="Approved"||stage==="Active"){
      const client=pipeline.find(c=>c.id===id);
      if(client){
        const partner=partners.find(p=>p.id===client.partner_id);
        if(partner) sendClientApprovedEmail(partner,client);
      }
    }
  };

  const sendSlack=(ch,msg)=>{const time=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});setSlackMsgs(p=>[{channel:ch,message:msg,time},...p]);};

  const totalActiveAUM=pipeline.filter(c=>c.stage==="Active").reduce((s,c)=>s+(c.monthly_spend||0),0);
  const totalComp=totalActiveAUM*REV_RATE;
  const active=partners.filter(p=>p.status==="Active");
  const pendingApprovals=pipeline.filter(c=>c.stage==="Review");
  const openTickets=tickets.filter(t=>t.status==="Open");
  const totalPaidOut=payouts.reduce((s,p)=>s+(p.amount||0),0);

  const navGroups=ADMIN_NAV.map(g=>({...g,items:g.items.map(i=>({...i,badge:i.key==="approvals"?pendingApprovals.length||null:i.key==="admissions"?partners.filter(p=>p.status==="Pending Setup").length||null:i.key==="slack"?openTickets.length||null:null}))}));

  const sideTop=<div><Logo/><div style={{padding:"0 20px 14px",borderBottom:"0.5px solid var(--line)"}}><div style={{fontSize:10,color:"var(--text3)",letterSpacing:"0.5px",textTransform:"uppercase"}}>Administration</div></div></div>;
  const sideBottom=<button onClick={onLogout} style={{fontSize:11,color:"var(--text3)",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:0,fontFamily:"var(--font)"}}><i className="ti ti-logout" style={{fontSize:12}}/>Sign out</button>;
  const F=({label,children,full})=><div style={full?{gridColumn:"1/-1"}:{}}><label style={{...S.label,display:"block",marginBottom:6}}>{label}</label>{children}</div>;

  if(loading)return <div style={{display:"flex",minHeight:"100vh"}}><Sidebar groups={navGroups} active={view} onSelect={setView} top={sideTop} bottom={sideBottom}/><div style={{flex:1}}><Spinner/></div></div>;

  const P=({children})=><div style={{flex:1,overflowY:"auto",padding:24}}>{children}</div>;
  const PH=({title,sub})=><div style={{marginBottom:22}}><div style={{fontFamily:"var(--font)",fontSize:20,color:"var(--text)",marginBottom:3}}>{title}</div>{sub&&<div style={{fontSize:11,color:"var(--text3)"}}>{sub}</div>}</div>;

  return <div style={{display:"flex",minHeight:"100vh",background:"var(--bg)"}}>
    <Sidebar groups={navGroups} active={view} onSelect={setView} top={sideTop} bottom={sideBottom}/>
    <P>

    {payoutModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(2px)"}}>
      <Card style={{width:500,animation:"fadeUp 0.2s ease"}}>
        <CardHead title="Record payout" sub={partners.find(p=>p.id===payoutModal)?.name}/>
        <div style={{padding:18}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <F label="Amount ($) *"><input type="number" value={newPayout.amount} onChange={e=>setNewPayout(p=>({...p,amount:e.target.value}))} placeholder="0.00" style={{fontFamily:"var(--mono)",fontSize:16}}/></F>
            <F label="Period label"><input value={newPayout.period_label} onChange={e=>setNewPayout(p=>({...p,period_label:e.target.value}))} placeholder="e.g. June 2026"/></F>
            <F label="Period start"><input type="date" value={newPayout.period_start} onChange={e=>setNewPayout(p=>({...p,period_start:e.target.value}))}/></F>
            <F label="Period end"><input type="date" value={newPayout.period_end} onChange={e=>setNewPayout(p=>({...p,period_end:e.target.value}))}/></F>
            <F label="Reference # (check / wire / ACH)"><input value={newPayout.reference} onChange={e=>setNewPayout(p=>({...p,reference:e.target.value}))} placeholder="e.g. CHK-1042" style={{fontFamily:"var(--mono)"}}/></F>
            <F label="Notes"><input value={newPayout.notes} onChange={e=>setNewPayout(p=>({...p,notes:e.target.value}))} placeholder="Optional"/></F>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn onClick={()=>setPayoutModal(null)} variant="ghost">Cancel</Btn><Btn onClick={recordPayout} variant="success" disabled={!newPayout.amount}>Record payout</Btn></div>
        </div>
      </Card>
    </div>}

    {view==="dashboard"&&<div>
      <PH title="Overview" sub="DSP Connect · Managing Partner program"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        <KPI label="Total partners" value={partners.length} sub={`${active.length} active`}/>
        <KPI label="Total active AUM" value={fmtK(totalActiveAUM)} sub="All active client spend"/>
        <KPI label="Monthly comp due" value={fmt$(totalComp)} sub="10% of total AUM" accent="blue"/>
        <KPI label="Total paid out" value={fmt$(totalPaidOut)} sub="All recorded payouts" accent="green"/>
      </div>
      {partners.length===0?<Empty icon="users-group" title="No managing partners yet" sub="Create your first managing partner to get started." cta="Admit first partner →" onCta={()=>setView("admissions")}/>
      :<Card>
        <CardHead title="Partner snapshot"/>
        <THead cols="2fr 1fr 1fr 1fr 1fr 1fr" labels={["Partner","Status","Active clients","Active AUM","Comp/mo","Paid total"]}/>
        {partners.map((p,i)=>{
          const eq=calcEquity(p);
          const myActive=pipeline.filter(c=>c.partner_id===p.id&&c.stage==="Active");
          const myAUM=myActive.reduce((s,c)=>s+(c.monthly_spend||0),0);
          const myPaid=payouts.filter(py=>py.partner_id===p.id).reduce((s,py)=>s+(py.amount||0),0);
          return <div key={p.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",padding:"13px 18px",borderBottom:i<partners.length-1?"0.5px solid var(--line)":"none",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><Avatar name={p.name} size={30}/><div><div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{p.name}</div><div style={{fontSize:10,color:"var(--text3)"}}>{p.vertical} · Day {daysIn(p.start_date)}</div></div></div>
            <StatusBadge s={p.status}/>
            <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--text2)"}}>{myActive.length}</span>
            <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--text2)"}}>{fmtK(myAUM)}</span>
            <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)"}}>{fmt$(myAUM*REV_RATE)}</span>
            <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--blue-lt)"}}>{fmt$(myPaid)}</span>
          </div>;
        })}
      </Card>}
    </div>}

    {view==="admissions"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <PH title="Admissions" sub="Create and manage managing partner accounts"/>
        <Btn onClick={()=>setShowAdd(s=>!s)} variant={showAdd?"ghost":"primary"}>{showAdd?"Cancel":"+ Admit new partner"}</Btn>
      </div>
      {showAdd&&<Card style={{marginBottom:20}}>
        <CardHead title="New Managing Partner — Admission Notice" sub="All fields can be updated after creation"/>
        <div style={{padding:18}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <F label="Full legal name *"><input value={form.legal_name} onChange={e=>setForm(f=>({...f,legal_name:e.target.value}))}/></F>
            <F label="Display name *"><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></F>
            <F label="Agency / company"><input value={form.agency} onChange={e=>setForm(f=>({...f,agency:e.target.value}))}/></F>
            <F label="Email address *"><input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></F>
            <F label="Portal password *"><input value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/></F>
            <F label="Start date"><input type="date" value={form.start_date} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))}/></F>
            <F label="Vertical"><select value={form.vertical} onChange={e=>setForm(f=>({...f,vertical:e.target.value}))}>{VERTICALS.map(v=><option key={v}>{v}</option>)}</select></F>
            <F label="Non-compete (days)"><input type="number" value={form.non_compete_days} onChange={e=>setForm(f=>({...f,non_compete_days:e.target.value}))}/></F>
            <F label="Trailing compensation" full><select value={form.trailing_option} onChange={e=>setForm(f=>({...f,trailing_option:e.target.value}))}>{TRAILING_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></F>
          </div>
          <div style={{borderTop:"0.5px solid var(--line)",paddingTop:14,marginBottom:12}}>
            <div style={{...S.label,marginBottom:10}}>AUM — enter once spend is active</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <F label="Monthly spend ($)"><input type="number" value={form.monthly_spend} onChange={e=>setForm(f=>({...f,monthly_spend:e.target.value}))} placeholder="0"/></F>
              <F label="Annual AUM ($)"><input type="number" value={form.annual_aum} onChange={e=>setForm(f=>({...f,annual_aum:e.target.value}))} placeholder="0"/></F>
              <F label="Day 30 AUM ($)"><input type="number" value={form.day30_aum} onChange={e=>setForm(f=>({...f,day30_aum:e.target.value}))} placeholder="0"/></F>
              <F label="Day 60 AUM ($)"><input type="number" value={form.day60_aum} onChange={e=>setForm(f=>({...f,day60_aum:e.target.value}))} placeholder="0"/></F>
              <F label="Day 90 AUM ($)"><input type="number" value={form.day90_aum} onChange={e=>setForm(f=>({...f,day90_aum:e.target.value}))} placeholder="0"/></F>
            </div>
          </div>
          {formErr&&<div style={{fontSize:12,color:"var(--red)",background:"var(--red-bg)",border:"0.5px solid rgba(224,85,85,0.2)",borderRadius:6,padding:"8px 12px",marginBottom:12}}>{formErr}</div>}
          <div style={{display:"flex",gap:8}}><Btn onClick={addPartner} variant="primary" disabled={saving}>{saving?"Creating…":"Create partner account"}</Btn><Btn onClick={()=>{setShowAdd(false);setForm(blank);setFormErr("");}} variant="ghost">Cancel</Btn></div>
        </div>
      </Card>}
      {partners.filter(p=>p.status==="Pending Setup").length>0&&<div style={{marginBottom:16}}>
        <div style={{...S.label,marginBottom:10}}>Pending setup ({partners.filter(p=>p.status==="Pending Setup").length})</div>
        {partners.filter(p=>p.status==="Pending Setup").map(p=><Card key={p.id} style={{marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 18px"}}><Avatar name={p.name}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{p.name}{p.agency?` · ${p.agency}`:""}</div><div style={{fontSize:11,color:"var(--text3)"}}>{p.email}</div></div><StatusBadge s={p.status}/>
          <Btn onClick={()=>updatePartner(p.id,{status:"Active"})} variant="success" size="sm">Activate</Btn></div>
        </Card>)}
      </div>}
      {partners.length===0&&!showAdd&&<Empty icon="user-plus" title="No partners yet" sub='Click "+ Admit new partner" to begin.'/>}
    </div>}

    {view==="partner-mgmt"&&<div>
      <PH title="Partner Management" sub="All managing partners · AUM · compensation · payout history"/>
      {partners.length===0?<Empty icon="users-group" title="No partners" sub="Add partners from Admissions." cta="Go to admissions" onCta={()=>setView("admissions")}/>
      :partners.map(p=>{
        const eq=calcEquity(p);const open=selected?.id===p.id;
        const myClients=pipeline.filter(c=>c.partner_id===p.id);
        const myActive=myClients.filter(c=>c.stage==="Active");
        const myAUM=myActive.reduce((s,c)=>s+(c.monthly_spend||0),0);
        const myPayouts=payouts.filter(py=>py.partner_id===p.id);
        const myPaid=myPayouts.reduce((s,py)=>s+(py.amount||0),0);
        return <Card key={p.id} style={{marginBottom:10,overflow:"hidden"}}>
          <div onClick={()=>setSelected(open?null:p)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",cursor:"pointer",background:open?"var(--bg2)":"transparent",transition:"background 0.15s"}}>
            <Avatar name={p.name} size={38}/><div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{p.name}{p.agency?` · ${p.agency}`:""}</div>
              <div style={{fontSize:11,color:"var(--text3)"}}>{p.email} · {p.vertical} · Day {daysIn(p.start_date)}</div>
            </div>
            <StatusBadge s={p.status}/>
            <span style={S.pill("var(--blue-bg)","var(--blue-lt)")}>{eq.total.toFixed(1)}% equity</span>
            <div style={{textAlign:"right",minWidth:90}}><div style={{fontFamily:"var(--mono)",fontSize:13,color:"var(--text2)"}}>{fmtK(myAUM)}</div><div style={{fontSize:10,color:"var(--text3)"}}>active AUM</div></div>
            <div style={{textAlign:"right",minWidth:80}}><div style={{fontFamily:"var(--mono)",fontSize:13,color:"var(--green)"}}>{fmt$(myAUM*REV_RATE)}</div><div style={{fontSize:10,color:"var(--text3)"}}>comp/mo</div></div>
            <i className={`ti ti-chevron-${open?"up":"down"}`} style={{fontSize:14,color:"var(--text3)",marginLeft:4}}/>
          </div>
          {open&&<div style={{padding:18,borderTop:"0.5px solid var(--line)",background:"var(--bg2)"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
              <KPI label="Active clients" value={myActive.length} sub={`${myClients.length} total`}/>
              <KPI label="Active AUM" value={fmtK(myAUM)}/>
              <KPI label="Monthly comp" value={fmt$(myAUM*REV_RATE)} accent="green"/>
              <KPI label="Total paid" value={fmt$(myPaid)} accent="blue"/>
            </div>
            {myActive.length>0&&<>
              <div style={{...S.label,marginBottom:8}}>Active clients</div>
              <Card style={{marginBottom:16}}>
                <THead cols="2fr 1fr 1fr" labels={["Client","Type","Monthly spend"]}/>
                {myActive.map((c,i)=><div key={c.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",padding:"10px 18px",borderBottom:i<myActive.length-1?"0.5px solid var(--line)":"none",alignItems:"center"}}>
                  <span style={{fontSize:12,fontWeight:500,color:"var(--text)"}}>{c.name}</span>
                  <span style={S.pill(c.type==="brand"?"var(--blue-bg)":"var(--blue-bg)",c.type==="brand"?"var(--blue)":"var(--blue-lt)")}>{c.type}</span>
                  <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)"}}>{fmtK(c.monthly_spend||0)}</span>
                </div>)}
              </Card>
            </>}
            <div style={{...S.label,marginBottom:8}}>Update AUM</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
              {[{label:"Monthly spend ($)",f:"monthly_spend"},{label:"Annual AUM ($)",f:"annual_aum"},{label:"Day 30 AUM ($)",f:"day30_aum"},{label:"Day 60 AUM ($)",f:"day60_aum"},{label:"Day 90 AUM ($)",f:"day90_aum"}].map(({label,f})=><div key={f}>
                <label style={{...S.label,display:"block",marginBottom:5}}>{label}</label>
                <input type="number" defaultValue={p[f]||0} onBlur={e=>updatePartner(p.id,{[f]:parseFloat(e.target.value)||0})} style={{fontFamily:"var(--mono)"}}/>
              </div>)}
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <select value={p.status} onChange={e=>updatePartner(p.id,{status:e.target.value})} style={{fontSize:12,padding:"6px 10px",borderRadius:6,border:"0.5px solid var(--line3)",background:"var(--bg2)",color:"var(--text)",width:"auto"}}>{["Pending Setup","Onboarding","Active","Inactive"].map(s=><option key={s}>{s}</option>)}</select>
              <Btn onClick={()=>setPayoutModal(p.id)} variant="success">+ Record payout</Btn>
              <Btn onClick={()=>sendSlack("#partner-revenue",`${p.name}: ${fmtK(myAUM)} AUM · ${fmt$(myAUM*REV_RATE)} comp/mo · ${myActive.length} active clients`)} variant="ghost">Notify Slack</Btn>
            </div>
            {myPayouts.length>0&&<div style={{marginTop:16}}>
              <div style={{...S.label,marginBottom:8}}>Payout history</div>
              <Card>
                <THead cols="1fr 1fr 1fr 1fr" labels={["Date","Period","Amount","Reference"]}/>
                {myPayouts.map((py,i)=><div key={py.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",padding:"10px 18px",borderBottom:i<myPayouts.length-1?"0.5px solid var(--line)":"none",alignItems:"center",fontSize:12}}>
                  <span style={{color:"var(--text3)"}}>{fmtDate(py.created_at)}</span>
                  <span style={{color:"var(--text2)"}}>{py.period_label||"—"}</span>
                  <span style={{fontFamily:"var(--mono)",color:"var(--green)",fontWeight:500}}>{fmt$(py.amount)}</span>
                  <span style={{fontFamily:"var(--mono)",color:"var(--text3)"}}>{py.reference||"—"}</span>
                </div>)}
              </Card>
            </div>}
          </div>}
        </Card>;
      })}
    </div>}

    {(view==="admin-brands"||view==="admin-agencies")&&<div>
      <PH title={view==="admin-brands"?"Brand Clients":"Agency Clients"} sub="Across all partners"/>
      {pipeline.filter(c=>c.type===(view==="admin-brands"?"brand":"agency")).length===0
        ?<Empty icon={view==="admin-brands"?"building-skyscraper":"briefcase"} title="No clients yet" sub="Partners add clients from their dashboard."/>
        :<Card>
          <THead cols="2fr 1fr 1fr 1fr 1fr 1fr" labels={["Name","Contact","Monthly Spend","Stage","Partner","Added"]}/>
          {pipeline.filter(c=>c.type===(view==="admin-brands"?"brand":"agency")).map((c,i,arr)=><div key={c.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",padding:"12px 18px",borderBottom:i<arr.length-1?"0.5px solid var(--line)":"none",alignItems:"center"}}>
            <div><div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{c.name}</div>{c.notes&&<div style={{fontSize:10,color:"var(--text3)"}}>{c.notes}</div>}</div>
            <div style={{fontSize:11,color:"var(--text3)"}}>{c.contact_name||"—"}</div>
            <div style={{fontFamily:"var(--mono)",fontSize:12,color:c.stage==="Active"?"var(--green)":"var(--text2)"}}>{fmtK(c.monthly_spend||0)}</div>
            <select value={c.stage} onChange={e=>movePipelineStage(c.id,e.target.value)} style={{fontSize:11,padding:"3px 6px",borderRadius:4,border:"0.5px solid var(--line2)",background:"var(--bg2)",color:"var(--text)",width:"auto"}}>{PIPELINE_STAGES.map(s=><option key={s}>{s}</option>)}</select>
            <div style={{fontSize:11,color:"var(--text3)"}}>{c.partner_name}</div>
            <div style={{fontSize:11,color:"var(--text3)"}}>{(c.created_at||"").slice(0,10)}</div>
          </div>)}
          <div style={{padding:"10px 18px",background:"var(--bg)",borderTop:"0.5px solid var(--line)",display:"flex",justifyContent:"space-between"}}>
            <span style={S.label}>Total active AUM</span>
            <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)",fontWeight:500}}>{fmtK(pipeline.filter(c=>c.type===(view==="admin-brands"?"brand":"agency")&&c.stage==="Active").reduce((s,c)=>s+(c.monthly_spend||0),0))}/mo</span>
          </div>
        </Card>}
    </div>}

    {view==="approvals"&&<div>
      <PH title="Client Approvals" sub="Campaign briefs submitted by partners — review full brief before approving"/>
      {pendingApprovals.length===0?<Empty icon="circle-check" title="No pending approvals" sub="Campaign briefs submitted by partners will appear here."/>
      :pendingApprovals.map(c=>{
        const cb=campaignBriefs.find(b=>b.pipeline_id===c.id);
        const isExpanded=expandedBrief===c.id;
        return <Card key={c.id} style={{marginBottom:10,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:11,padding:"13px 16px"}}>
            <span style={S.pill(c.type==="brand"?"var(--blue-bg)":"var(--bg3)",c.type==="brand"?"var(--blue)":"var(--text2)")}>{c.type}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:500}}>{c.name}</div>
              <div style={{fontSize:11,color:"var(--text3)"}}>Partner: {c.partner_name} · {c.contact_name||""} · <span style={{fontFamily:"var(--mono)"}}>{fmtK(c.monthly_spend||0)}/mo</span></div>
              {cb&&<div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>
                {[cb.campaign_type,cb.creative_type,cb.geo,cb.budget_total?`Budget: ${fmt$(cb.budget_total)}`:""].filter(Boolean).join(" · ")}
              </div>}
            </div>
            {cb&&<Btn onClick={()=>setExpandedBrief(isExpanded?null:c.id)} variant="ghost" size="sm">{isExpanded?"Hide brief ↑":"View brief ↓"}</Btn>}
            <Btn onClick={()=>{movePipelineStage(c.id,"Approved");sendSlack("#partner-updates",`✅ Client approved: ${c.name} (${c.type}) · Partner: ${c.partner_name} · ${fmtK(c.monthly_spend||0)}/mo`);}} variant="success" size="sm">Approve</Btn>
            <Btn onClick={()=>movePipelineStage(c.id,"Lead")} variant="danger" size="sm">Reject</Btn>
          </div>
          {isExpanded&&cb&&<div style={{padding:"14px 16px",borderTop:"0.5px solid var(--line)",background:"var(--bg2)"}}>
            <div style={{...S.label,marginBottom:10}}>Campaign brief — submitted {fmtDate(cb.created_at)}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {[["Campaign type",cb.campaign_type],["Goals",cb.goals],["KPIs",cb.kpis],
                ["Creative type",cb.creative_type],["Traffic type",cb.traffic_type],["Device type",cb.device_type],
                ["GEO",cb.geo],["Frequency cap",cb.frequency_cap],["Timezone",cb.timezone],
                ["Total budget",cb.budget_total?fmt$(cb.budget_total):""],["Start date",cb.start_date],["End date",cb.end_date],
                ["Additional targeting",cb.targeting],["1st party data",cb.first_party_data],["Creative link",cb.creative_file_link],
                ["Tracking tags",cb.tracking_tags],["Bundles/domains",cb.bundles_domains],["Launch notes",cb.notes],
              ].filter(([,v])=>v).map(([k,v])=><div key={k} style={{padding:"8px 10px",background:"var(--bg)",borderRadius:5,border:"0.5px solid var(--line)"}}>
                <div style={S.label}>{k}</div>
                <div style={{fontSize:12,color:"var(--text)",marginTop:3,wordBreak:"break-word"}}>{v}</div>
              </div>)}
            </div>
          </div>}
        </Card>;
      })}
    </div>}

    {view==="comp-tracking"&&<div>
      <PH title="Compensation" sub="Active client ad spend · 10% revenue share"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        <KPI label="Total active AUM" value={fmtK(totalActiveAUM)}/>
        <KPI label="Monthly comp due" value={fmt$(totalComp)} accent="blue"/>
        <KPI label="Total paid out" value={fmt$(totalPaidOut)} accent="green"/>
        <KPI label="Active partners" value={active.length}/>
      </div>
      {partners.map(p=>{
        const myActive=pipeline.filter(c=>c.partner_id===p.id&&c.stage==="Active");
        const myAUM=myActive.reduce((s,c)=>s+(c.monthly_spend||0),0);
        const myPaid=payouts.filter(py=>py.partner_id===p.id).reduce((s,py)=>s+(py.amount||0),0);
        return <Card key={p.id} style={{marginBottom:10,overflow:"hidden"}}>
          <div style={{padding:"13px 18px",borderBottom:"0.5px solid var(--line)",display:"flex",alignItems:"center",gap:12}}>
            <Avatar name={p.name} size={34}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{p.name}{p.agency?` · ${p.agency}`:""}</div><div style={{fontSize:10,color:"var(--text3)"}}>{p.vertical} · {myActive.length} active clients</div></div>
            <StatusBadge s={p.status}/>
            <Btn onClick={()=>setPayoutModal(p.id)} variant="success" size="sm">+ Record payout</Btn>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)"}}>
            {[{l:"Active clients",v:myActive.length},{l:"Active AUM/mo",v:fmtK(myAUM),m:true},{l:"Annual AUM",v:fmtK(myAUM*12),m:true},{l:"Monthly comp (10%)",v:fmt$(myAUM*REV_RATE),m:true,g:true},{l:"Total paid out",v:fmt$(myPaid),m:true,g:true}].map((item,i)=><div key={item.l} style={{padding:"12px 18px",borderRight:i<4?"0.5px solid var(--line)":"none"}}>
              <div style={S.label}>{item.l}</div>
              <div style={{marginTop:6,fontFamily:item.m?"var(--mono)":"var(--font)",fontSize:14,fontWeight:500,color:item.g?"var(--green)":"var(--text)"}}>{item.v}</div>
            </div>)}
          </div>
        </Card>;
      })}
    </div>}

    {view==="payouts"&&<div>
      <PH title="Payout Records" sub="All recorded disbursements"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
        <KPI label="Total paid (all time)" value={fmt$(totalPaidOut)} accent="blue"/>
        <KPI label="Paid this month" value={fmt$(payouts.filter(p=>{const d=new Date(p.created_at);const n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();}).reduce((s,p)=>s+(p.amount||0),0))} accent="green"/>
        <KPI label="Total records" value={payouts.length}/>
      </div>
      {payouts.length===0?<Empty icon="cash" title="No payouts recorded" sub="Record payouts from Partner Management."/>
      :<Card>
        <THead cols="1fr 1fr 1fr 1fr 1fr 1fr" labels={["Date","Partner","Period","Amount","Reference","Notes"]}/>
        {payouts.map((p,i,arr)=><div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr 1fr",padding:"12px 18px",borderBottom:i<arr.length-1?"0.5px solid var(--line)":"none",alignItems:"center"}}>
          <span style={{fontSize:11,color:"var(--text3)"}}>{fmtDate(p.created_at)}</span>
          <span style={{fontSize:12,fontWeight:500,color:"var(--text)"}}>{p.partner_name}</span>
          <span style={{fontSize:12,color:"var(--text2)"}}>{p.period_label||"—"}</span>
          <span style={{fontFamily:"var(--mono)",fontSize:13,color:"var(--green)",fontWeight:500}}>{fmt$(p.amount)}</span>
          <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--text2)"}}>{p.reference||"—"}</span>
          <span style={{fontSize:11,color:"var(--text3)"}}>{p.notes||"—"}</span>
        </div>)}
        <div style={{padding:"10px 18px",background:"var(--bg)",borderTop:"0.5px solid var(--line)",display:"flex",justifyContent:"space-between"}}>
          <span style={S.label}>Grand total</span>
          <span style={{fontFamily:"var(--mono)",fontSize:13,color:"var(--green)",fontWeight:500}}>{fmt$(totalPaidOut)}</span>
        </div>
      </Card>}
    </div>}

    {view==="content-mgmt"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <PH title="Resources" sub="Training, SOPs, and documents for partners"/>
        <Btn onClick={()=>setShowAddResource(s=>!s)} variant={showAddResource?"ghost":"primary"}>{showAddResource?"Cancel":"+ Add resource"}</Btn>
      </div>
      {showAddResource&&<Card style={{marginBottom:16}}>
        <CardHead title="New resource"/>
        <div style={{padding:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <F label="Title *"><input value={newResource.title} onChange={e=>setNewResource(r=>({...r,title:e.target.value}))}/></F>
            <F label="Type"><select value={newResource.type} onChange={e=>setNewResource(r=>({...r,type:e.target.value}))}>{["pdf","video","pptx","docx","article"].map(t=><option key={t}>{t}</option>)}</select></F>
            <F label="Category"><select value={newResource.category} onChange={e=>setNewResource(r=>({...r,category:e.target.value}))}>{["training","sops","documents"].map(c=><option key={c}>{c}</option>)}</select></F>
            <F label="Description"><input value={newResource.description} onChange={e=>setNewResource(r=>({...r,description:e.target.value}))}/></F>
            <F label="URL" full><input value={newResource.url} onChange={e=>setNewResource(r=>({...r,url:e.target.value}))} placeholder="https://…"/></F>
          </div>
          <div style={{display:"flex",gap:8}}><Btn onClick={addResource} variant="primary">Add resource</Btn><Btn onClick={()=>setShowAddResource(false)} variant="ghost">Cancel</Btn></div>
        </div>
      </Card>}
      {["training","sops","documents"].map(cat=><div key={cat} style={{marginBottom:20}}>
        <div style={{...S.label,marginBottom:10,display:"flex",alignItems:"center",gap:8}}><span style={{textTransform:"capitalize"}}>{cat}</span><span style={{fontFamily:"var(--mono)",color:"var(--text3)"}}>{resources.filter(r=>r.category===cat).length}</span></div>
        {resources.filter(r=>r.category===cat).length===0?<div style={{fontSize:12,color:"var(--text3)",padding:"8px 0"}}>No {cat} resources yet.</div>
        :resources.filter(r=>r.category===cat).map(r=><Card key={r.id} style={{marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 18px"}}>
            <div style={{width:32,height:32,background:"var(--blue-bg)",borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><i className={`ti ti-${r.type==="video"?"player-play":"file-text"}`} style={{fontSize:14,color:"var(--blue-lt)"}}/></div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{r.title}</div><div style={{fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.3px"}}>{r.type}{r.description?` · ${r.description}`:""}</div>{r.url&&<div style={{fontSize:10,color:"var(--blue-lt)",marginTop:2}}>{r.url}</div>}</div>
            <Btn onClick={()=>deleteResource(r.id)} variant="danger" size="sm">Delete</Btn>
          </div>
        </Card>)}
      </div>)}
    </div>}

    {view==="announcements"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <PH title="Announcements" sub="Posts visible on all partner dashboards"/>
        <Btn onClick={()=>setShowAddAnn(s=>!s)} variant={showAddAnn?"ghost":"primary"}>{showAddAnn?"Cancel":"+ Post announcement"}</Btn>
      </div>
      {showAddAnn&&<Card style={{marginBottom:16}}>
        <CardHead title="New announcement"/>
        <div style={{padding:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <F label="Title *"><input value={newAnn.title} onChange={e=>setNewAnn(a=>({...a,title:e.target.value}))}/></F>
            <F label="Type"><select value={newAnn.type} onChange={e=>setNewAnn(a=>({...a,type:e.target.value}))}>{["info","warning","success"].map(t=><option key={t}>{t}</option>)}</select></F>
            <F label="Body *" full><textarea value={newAnn.body} onChange={e=>setNewAnn(a=>({...a,body:e.target.value}))} rows={3} style={{resize:"vertical"}}/></F>
          </div>
          <div style={{display:"flex",gap:8}}><Btn onClick={addAnnouncement} variant="primary">Post</Btn><Btn onClick={()=>setShowAddAnn(false)} variant="ghost">Cancel</Btn></div>
        </div>
      </Card>}
      {announcements.length===0?<Empty icon="speakerphone" title="No announcements" sub="Posts will appear on all partner dashboards."/>
      :announcements.map(a=><Card key={a.id} style={{marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 18px"}}>
          <span style={S.pill(a.type==="warning"?"var(--amber-bg)":a.type==="success"?"var(--green-bg)":"var(--blue-bg)",a.type==="warning"?"var(--amber)":a.type==="success"?"var(--green)":"var(--blue)")}>{a.type}</span>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{a.title}</div><div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{a.body}</div></div>
          <span style={S.pill(a.active?"var(--green-bg)":"rgba(255,255,255,0.05)",a.active?"var(--green)":"var(--text3)")}>{a.active?"Live":"Hidden"}</span>
          <Btn onClick={()=>toggleAnn(a.id,!a.active)} variant="ghost" size="sm">{a.active?"Hide":"Show"}</Btn>
          <Btn onClick={()=>deleteAnn(a.id)} variant="danger" size="sm">Delete</Btn>
        </div>
      </Card>)}
    </div>}

    {view==="slack"&&<div>
      <PH title="Slack" sub="Notifications and open ticket management"/>
      {openTickets.length>0&&<Card style={{marginBottom:14}}>
        <CardHead title={`Open tickets (${openTickets.length})`} sub="Reply to close"/>
        {openTickets.map((t,i,arr)=><div key={t.id} style={{padding:"13px 18px",borderBottom:i<arr.length-1?"0.5px solid var(--line)":"none"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <span style={S.pill("var(--blue-bg)","var(--blue)")}>{t.type}</span>
            <span style={{fontSize:13,fontWeight:500,color:"var(--text)",flex:1}}>{t.subject}</span>
            <span style={{fontSize:11,color:"var(--text3)"}}>{t.partner_name}</span>
          </div>
          {t.details&&<div style={{fontSize:12,color:"var(--text3)",marginBottom:8}}>{t.details}</div>}
          <div style={{display:"flex",gap:8}}>
            <input value={ticketReply[t.id]||""} onChange={e=>setTicketReply(r=>({...r,[t.id]:e.target.value}))} placeholder="Reply and close ticket…" style={{flex:1,fontSize:12}}/>
            <Btn onClick={()=>replyTicket(t.id)} variant="success" size="sm">Reply & close</Btn>
          </div>
        </div>)}
      </Card>}
      <Card>
        <CardHead title="Notification log"/>
        <div style={{padding:14}}>
          <div style={{background:"var(--bg)",border:"0.5px solid var(--line)",borderRadius:6,padding:12,maxHeight:220,overflowY:"auto",marginBottom:12,display:"flex",flexDirection:"column",gap:6}}>
            {slackMsgs.length===0?<div style={{fontSize:12,color:"var(--text3)",textAlign:"center",padding:"20px 0"}}>No notifications sent this session.</div>
            :slackMsgs.map((m,i)=><div key={i} style={{padding:"8px 10px",background:"var(--bg)",borderRadius:4,border:"0.5px solid var(--line)"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--blue-lt)"}}>{m.channel}</span><span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--text3)"}}>{m.time}</span></div>
              <div style={{fontSize:12,color:"var(--text2)"}}>{m.message}</div>
            </div>)}
          </div>
          <div style={{display:"flex",gap:8}}>
            <select value={slackCh} onChange={e=>setSlackCh(e.target.value)} style={{width:"auto",fontSize:12,fontFamily:"var(--mono)"}}><option>#partner-revenue</option><option>#partner-payouts</option><option>#partner-updates</option></select>
            <input value={slackMsg} onChange={e=>setSlackMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&slackMsg.trim()){sendSlack(slackCh,slackMsg);setSlackMsg("");}}} placeholder="Send message…" style={{flex:1}}/>
            <Btn onClick={()=>{if(slackMsg.trim()){sendSlack(slackCh,slackMsg);setSlackMsg("");}}} variant="primary">Send</Btn>
          </div>
        </div>
      </Card>
    </div>}

    </P>
  </div>;
}

// ── ROOT ──────────────────────────────────────────────────────────────────
export default function App(){
  const[session,setSession]=useState(null);
  const handleLogin=async s=>{
    if(s.role==="partner"){
      const{data}=await supabase.from("partners").select("*").eq("id",s.partner.id).single();
      setSession({...s,partner:data||s.partner});
    }else setSession(s);
  };
  const completeOnboarding=async()=>{
    await supabase.from("partners").update({onboarded:true,status:"Active"}).eq("id",session.partner.id);
    sendOnboardingCompleteEmail(session.partner);
    setSession(s=>({...s,partner:{...s.partner,onboarded:true,status:"Active"}}));
  };
  if(!session)return <Login onLogin={handleLogin}/>;
  if(session.role==="admin")return <AdminApp onLogout={()=>setSession(null)}/>;
  if(!session.partner.onboarded)return <Onboarding partner={session.partner} onComplete={completeOnboarding}/>;
  return <PartnerApp partner={session.partner} onLogout={()=>setSession(null)}/>;
}
