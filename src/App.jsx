import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { Tip, HelpDrawer, HelpBtn, GlobalHelpBtn } from "./help";
import { sendWelcomeEmail, sendOnboardingCompleteEmail, sendClientApprovedEmail, sendPayoutEmail, sendTicketReplyEmail } from "./emails";

const REV_RATE=0.10,MIN_AUM=5000000;
const VERTICALS=["Healthcare","Legal","Financial Services","Automotive","Real Estate","Home Services","Franchise","Hospitality","Political","Enterprise","Other"];
const TRAILING=[{value:"A",label:"Option A — Compensation ceases on termination date"},{value:"B",label:"Option B — Compensation continues for specified days on originated active accounts"},{value:"C",label:"Option C — As provided in a separate written agreement"}];
const STAGES=["Lead","Deposit Paid","Review","Approved","Active"];
const ADMIN_EMAIL="admin@getdspconnect.com",ADMIN_PASS="dspconnect2025";

const fmt$=n=>"$"+Math.round(n||0).toLocaleString();
const fmtK=n=>(n||0)>=1e6?"$"+((n||0)/1e6).toFixed(2)+"M":(n||0)>=1e3?"$"+Math.round((n||0)/1e3)+"k":"$"+Math.round(n||0);
const today=()=>new Date().toISOString().slice(0,10);
const daysIn=d=>Math.max(0,Math.floor((Date.now()-new Date(d))/86400000));
const fmtDate=d=>d?new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—";

const D30=[{aum:500000,award:3},{aum:100000,award:1.5},{aum:50000,award:0.5}];
const D60=[{aum:2000000,award:3},{aum:1000000,award:2},{aum:500000,award:1}];
const D90=[{aum:3000000,award:4},{aum:2000000,award:3},{aum:1000000,award:2}];

function calcEquity(p){
  if((p.annual_aum||0)<MIN_AUM)return{qualifies:false,base:0,a30:0,a60:0,a90:0,total:0};
  const a30=(D30.find(t=>(p.day30_aum||0)>=t.aum)||{award:0}).award;
  const a60=(D60.find(t=>(p.day60_aum||0)>=t.aum)||{award:0}).award;
  const a90=(D90.find(t=>(p.day90_aum||0)>=t.aum)||{award:0}).award;
  return{qualifies:true,base:5,a30,a60,a90,total:Math.min(5+a30+a60+a90,15)};
}
function calcScore(p,pipeline){
  let s=0;const aum=p.monthly_spend||0;
  if(aum>0)s+=20;if(aum>=100000)s+=15;if(aum>=250000)s+=15;
  const my=pipeline.filter(c=>c.partner_id===p.id);
  s+=Math.min(my.length*5,20);s+=Math.min(my.filter(c=>c.stage==="Active").length*5,20);
  return Math.min(s,100);
}
function detectType(url="",hint=""){
  if(hint==="video")return"video";
  const u=url.toLowerCase();
  if(u.includes("youtube.com")||u.includes("youtu.be"))return"youtube";
  if(u.includes("vimeo.com"))return"vimeo";
  if(u.endsWith(".pdf")||u.includes("drive.google.com"))return"pdf";
  return hint||"link";
}
function getYTId(url=""){const m=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);return m?m[1]:null;}
function getVimeoId(url=""){const m=url.match(/vimeo\.com\/(\d+)/);return m?m[1]:null;}

// ── DESIGN TOKENS ──────────────────────────────────────────────────────────
const S={
  card:{background:"var(--bg)",border:"0.5px solid var(--line2)",borderRadius:"var(--r-lg)",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"},
  pill:(bg,fg)=>({fontSize:10,fontWeight:600,letterSpacing:"0.5px",padding:"2px 8px",borderRadius:3,background:bg,color:fg,whiteSpace:"nowrap",textTransform:"uppercase",fontFamily:"var(--mono)"}),
  label:{fontSize:10,color:"var(--text3)",letterSpacing:"0.6px",textTransform:"uppercase",fontWeight:500},
};

// ── PRIMITIVES ─────────────────────────────────────────────────────────────
function Logo(){
  return <div style={{padding:"16px 16px 12px"}}>
    <div style={{display:"flex",alignItems:"center",gap:9}}>
      <img src="/logo.png" alt="" style={{width:20,height:20,objectFit:"contain",flexShrink:0}}/>
      <div><div style={{fontSize:11,fontWeight:600,color:"var(--text)",letterSpacing:"0.6px",textTransform:"uppercase"}}>DSP Connect</div><div style={{fontSize:9,color:"var(--text3)"}}>Partner Portal</div></div>
    </div>
  </div>;
}
function Avatar({name,size=32}){
  const i=(name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  return <div style={{width:size,height:size,borderRadius:"50%",background:"var(--blue-bg2)",border:"0.5px solid rgba(26,20,212,0.15)",color:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.30,fontWeight:600,flexShrink:0,fontFamily:"var(--mono)"}}>{i}</div>;
}
function Badge({s}){
  const m={Active:["var(--green-bg)","var(--green)"],Onboarding:["var(--amber-bg)","var(--amber)"],Inactive:["var(--red-bg)","var(--red)"],"Pending Setup":["var(--bg3)","var(--text3)"],Lead:["var(--bg3)","var(--text3)"],"Deposit Paid":["var(--amber-bg)","var(--amber)"],Review:["var(--blue-bg)","var(--blue)"],Approved:["var(--green-bg)","var(--green)"],Open:["var(--amber-bg)","var(--amber)"],Closed:["var(--bg3)","var(--text3)"]};
  const[bg,fg]=m[s]||["var(--bg3)","var(--text3)"];
  return <span style={S.pill(bg,fg)}>{s}</span>;
}
function KPI({label,value,sub,accent}){
  const color=accent==="green"?"var(--green)":accent==="blue"?"var(--blue)":accent==="amber"?"var(--amber)":"var(--text)";
  return <div style={{...S.card,padding:"16px 18px"}}>
    <div style={{...S.label,marginBottom:8}}>{label}</div>
    <div style={{fontSize:22,fontWeight:500,color,fontFamily:"var(--mono)",letterSpacing:"-0.3px",lineHeight:1}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:"var(--text3)",marginTop:5}}>{sub}</div>}
  </div>;
}
function Card({children,style={}}){return <div style={{...S.card,...style}}>{children}</div>;}
function CardHead({title,sub,action}){
  return <div style={{padding:"13px 16px",borderBottom:"0.5px solid var(--line)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
    <div><div style={{fontSize:13,fontWeight:500}}>{title}</div>{sub&&<div style={{fontSize:11,color:"var(--text3)",marginTop:1}}>{sub}</div>}</div>
    {action&&<div style={{flexShrink:0}}>{action}</div>}
  </div>;
}
function PageHead({title,sub}){
  return <div style={{marginBottom:20}}>
    <div style={{fontSize:18,fontWeight:500,color:"var(--text)",marginBottom:2}}>{title}</div>
    {sub&&<div style={{fontSize:11,color:"var(--text3)"}}>{sub}</div>}
  </div>;
}
function THead({cols,labels}){
  return <div style={{display:"grid",gridTemplateColumns:cols,padding:"8px 16px",borderBottom:"0.5px solid var(--line)",background:"var(--bg2)"}}>
    {labels.map(h=><span key={h} style={S.label}>{h}</span>)}
  </div>;
}
function Bar({pct,color="var(--blue)"}){
  return <div style={{height:3,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}>
    <div style={{height:"100%",width:`${Math.min(pct||0,100)}%`,background:color,borderRadius:2,transition:"width 0.5s"}}/>
  </div>;
}
function Btn({onClick,children,variant="ghost",size="md",disabled}){
  const v={primary:{background:"var(--blue)",color:"#fff",border:"none",fontWeight:500},success:{background:"var(--green-bg)",color:"var(--green)",border:"0.5px solid rgba(15,122,82,0.2)"},danger:{background:"var(--red-bg)",color:"var(--red)",border:"0.5px solid rgba(184,50,50,0.2)"},ghost:{background:"transparent",color:"var(--text2)",border:"0.5px solid var(--line3)"},link:{background:"transparent",color:"var(--blue)",border:"none",padding:0}};
  const sz={sm:{fontSize:11,padding:"4px 10px",borderRadius:4},md:{fontSize:12,padding:"7px 14px",borderRadius:5},lg:{fontSize:13,padding:"9px 20px",borderRadius:5}};
  return <button onClick={onClick} disabled={disabled} style={{...v[variant],...sz[size],cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.45:1,fontFamily:"var(--font)",transition:"opacity 0.15s",whiteSpace:"nowrap"}}>{children}</button>;
}
function Field({label,children,full}){
  return <div style={full?{gridColumn:"1/-1"}:{}}>
    <label style={{...S.label,display:"block",marginBottom:6}}>{label}</label>
    {children}
  </div>;
}
function Empty({icon,title,sub,cta,onCta}){
  return <Card style={{padding:"44px 28px",textAlign:"center"}}>
    <i className={`ti ti-${icon}`} style={{fontSize:28,color:"var(--text3)",display:"block",marginBottom:12}}/>
    <div style={{fontSize:14,fontWeight:500,marginBottom:5}}>{title}</div>
    <div style={{fontSize:12,color:"var(--text3)",marginBottom:cta?16:0}}>{sub}</div>
    {cta&&<Btn onClick={onCta} variant="primary">{cta}</Btn>}
  </Card>;
}
function Spinner(){
  return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:48,color:"var(--text3)",fontSize:12,gap:8}}>
    <i className="ti ti-loader-2" style={{fontSize:18,animation:"spin 1s linear infinite",color:"var(--blue)"}}/>Loading
  </div>;
}
function ResourceEmbed({resource,onClose}){
  const type=detectType(resource.url||"",resource.type);
  const ytId=type==="youtube"?getYTId(resource.url||""):null;
  const viId=type==="vimeo"?getVimeoId(resource.url||""):null;
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:24}}>
    <div style={{...S.card,width:"100%",maxWidth:900,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <CardHead title={resource.title} sub={resource.description} action={<Btn onClick={onClose} variant="ghost" size="sm"><i className="ti ti-x" style={{fontSize:13}}/></Btn>}/>
      <div style={{flex:1,overflow:"auto",background:"var(--bg2)"}}>
        {ytId&&<div style={{position:"relative",paddingBottom:"56.25%",height:0}}><iframe src={`https://www.youtube.com/embed/${ytId}?rel=0`} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}} allowFullScreen title={resource.title}/></div>}
        {viId&&<div style={{position:"relative",paddingBottom:"56.25%",height:0}}><iframe src={`https://player.vimeo.com/video/${viId}`} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}} allowFullScreen title={resource.title}/></div>}
        {!ytId&&!viId&&resource.url&&<div style={{padding:32,textAlign:"center"}}><i className="ti ti-external-link" style={{fontSize:40,color:"var(--blue)",display:"block",marginBottom:14}}/><a href={resource.url} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}><Btn variant="primary">Open resource →</Btn></a></div>}
      </div>
    </div>
  </div>;
}
function ResourceCard({resource,onClick}){
  const type=detectType(resource.url||"",resource.type);
  const ytId=getYTId(resource.url||"");
  return <div onClick={onClick} style={{...S.card,cursor:"pointer",overflow:"hidden"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.10)"} onMouseLeave={e=>e.currentTarget.style.boxShadow=S.card.boxShadow}>
    {ytId?<div style={{position:"relative",paddingBottom:"48%",background:"#000",overflow:"hidden"}}>
      <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.85}}/>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:44,height:44,background:"rgba(255,0,0,0.9)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}><i className="ti ti-player-play-filled" style={{fontSize:18,color:"#fff",marginLeft:2}}/></div></div>
    </div>:<div style={{height:80,background:"var(--bg2)",display:"flex",alignItems:"center",justifyContent:"center",borderBottom:"0.5px solid var(--line)"}}><i className={`ti ti-${type==="pdf"?"file-type-pdf":"external-link"}`} style={{fontSize:32,color:"var(--blue)"}}/></div>}
    <div style={{padding:"12px 14px"}}>
      <div style={{fontSize:13,fontWeight:500,marginBottom:3}}>{resource.title}</div>
      {resource.description&&<div style={{fontSize:11,color:"var(--text3)",marginBottom:5}}>{resource.description}</div>}
      <span style={S.pill("var(--blue-bg)","var(--blue)")}>{type==="youtube"?"YouTube":type.toUpperCase()}</span>
    </div>
  </div>;
}

// ── BRIEF FORM ─────────────────────────────────────────────────────────────
function BriefForm({type,step,setStep,nc,setNc,brief,setBrief,onNext,onSubmit,onCancel}){
  const B=f=>({value:brief[f]||"",onChange:e=>setBrief(b=>({...b,[f]:e.target.value}))});
  const label=type==="brand"?"Brand client":"Agency client";
  if(step===1)return <Card style={{marginBottom:14}}>
    <CardHead title={`New ${label} — Step 1 of 2`} sub="Basic information"/>
    <div style={{padding:16}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <Field label={`${type==="brand"?"Company":"Agency"} name *`}><input value={nc.name} onChange={e=>setNc(c=>({...c,name:e.target.value}))}/></Field>
        <Field label="Contact name"><input value={nc.contact_name} onChange={e=>setNc(c=>({...c,contact_name:e.target.value}))}/></Field>
        <Field label="Contact email"><input type="email" value={nc.email} onChange={e=>setNc(c=>({...c,email:e.target.value}))}/></Field>
        <Field label="Est. monthly spend ($)"><input type="number" value={nc.monthly_spend} onChange={e=>setNc(c=>({...c,monthly_spend:e.target.value}))}/></Field>
        <Field label="Notes" full><input value={nc.notes} onChange={e=>setNc(c=>({...c,notes:e.target.value}))}/></Field>
      </div>
      <div style={{marginBottom:12,padding:"9px 12px",background:"var(--blue-bg)",borderRadius:5,fontSize:11,color:"var(--blue)"}}>Step 2 is a campaign brief — this gets submitted to DSP Connect for review and notifies the team.</div>
      <div style={{display:"flex",gap:8}}><Btn onClick={onNext} variant="primary" disabled={!nc.name}>Continue →</Btn><Btn onClick={onCancel} variant="ghost">Cancel</Btn></div>
    </div>
  </Card>;

  return <Card style={{marginBottom:14}}>
    <CardHead title={`Campaign Brief — ${nc.name}`} sub="Step 2 of 2 · DSP Connect campaign intake"/>
    <div style={{padding:16}}>
      <div style={{fontWeight:500,fontSize:12,marginBottom:10,paddingBottom:6,borderBottom:"0.5px solid var(--line)"}}>Campaign details</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <Field label="Advertiser name"><input {...B("advertiser_name")}/></Field>
        <Field label="Company category"><input {...B("company_category")} placeholder="e.g. Healthcare, Retail"/></Field>
        <Field label="Campaign type"><select {...B("campaign_type")} style={{width:"100%"}}><option value="Managed">Managed (min $1,000)</option><option value="Self-Service">Self-Service</option></select></Field>
        <Field label="Total budget ($)"><input type="number" {...B("budget_total")}/></Field>
        <Field label="Start date"><input type="date" {...B("start_date")}/></Field>
        <Field label="End date"><input type="date" {...B("end_date")}/></Field>
        <Field label="Timezone"><input {...B("timezone")} placeholder="EST, PST, UTC"/></Field>
        <Field label="GEO targeting"><input {...B("geo")} placeholder="Country, State, City"/></Field>
      </div>
      <div style={{fontWeight:500,fontSize:12,marginBottom:10,paddingBottom:6,borderBottom:"0.5px solid var(--line)"}}>Goals & targeting</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <Field label="Goals" full><textarea {...B("goals")} rows={3} placeholder="Lead gen, brand awareness, e-commerce…" style={{resize:"vertical"}}/></Field>
        <Field label="KPIs" full><textarea {...B("kpis")} rows={2} placeholder="CPC $2.50, CTR 0.3%, CPA $45…" style={{resize:"vertical"}}/></Field>
        <Field label="Creative type"><select {...B("creative_type")} style={{width:"100%"}}><option value="">Select…</option><option>Video</option><option>Banner</option><option>Native</option><option>Video + Banner</option><option>All formats</option></select></Field>
        <Field label="Traffic type"><select {...B("traffic_type")} style={{width:"100%"}}><option value="">Select…</option><option>In-App</option><option>Web</option><option>In-App + Web</option></select></Field>
        <Field label="Device type"><select {...B("device_type")} style={{width:"100%"}}><option value="">Select…</option><option>PC</option><option>Phones</option><option>Tablets</option><option>Connected TV</option><option>All devices</option></select></Field>
        <Field label="Frequency cap"><input {...B("frequency_cap")} placeholder="e.g. 3/user/day"/></Field>
      </div>
      <div style={{fontWeight:500,fontSize:12,marginBottom:10,paddingBottom:6,borderBottom:"0.5px solid var(--line)"}}>Advanced</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <Field label="Additional targeting"><input {...B("targeting")} placeholder="Age, interests, behavioral…"/></Field>
        <Field label="Bundles / domains"><input {...B("bundles_domains")}/></Field>
        <Field label="1st party data" full><input {...B("first_party_data")} placeholder="IP lists, ad IDs…"/></Field>
        <Field label="Creative file link"><input {...B("creative_file_link")} placeholder="Google Drive, Dropbox URL"/></Field>
        <Field label="Tracking tags"><input {...B("tracking_tags")} placeholder="Pixel, click tracker, landing page"/></Field>
        <Field label="Launch notes" full><textarea {...B("notes")} rows={2} style={{resize:"vertical"}}/></Field>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <Btn onClick={()=>setStep(1)} variant="ghost">← Back</Btn>
        <Btn onClick={onSubmit} variant="primary">Submit for review →</Btn>
        <span style={{fontSize:11,color:"var(--text3)"}}>Goes to Review · Notifies DSP Connect team</span>
      </div>
    </div>
  </Card>;
}

// ── NAV ─────────────────────────────────────────────────────────────────────
const PNAV=[
  {section:"OVERVIEW",items:[{key:"dashboard",icon:"layout-dashboard",label:"Dashboard"}]},
  {section:"GROWTH",items:[{key:"brand-clients",icon:"building-skyscraper",label:"Brand clients"},{key:"agency-clients",icon:"briefcase",label:"Agency clients"},{key:"pipeline",icon:"git-branch",label:"Pipeline"}]},
  {section:"OWNERSHIP",items:[{key:"compensation",icon:"currency-dollar",label:"Compensation"},{key:"equity",icon:"chart-donut",label:"Equity"}]},
  {section:"RESOURCES",items:[{key:"training",icon:"school",label:"Training"},{key:"sops",icon:"checklist",label:"SOPs"},{key:"documents",icon:"file-description",label:"Documents"}]},
  {section:"SUPPORT",items:[{key:"support",icon:"headset",label:"Help desk"}]},
];
const ANAV=[
  {section:"OVERVIEW",items:[{key:"dashboard",icon:"layout-dashboard",label:"Overview"}]},
  {section:"PARTNERS",items:[{key:"admissions",icon:"user-plus",label:"Admissions"},{key:"partner-mgmt",icon:"users-group",label:"Partner management"}]},
  {section:"CLIENTS",items:[{key:"admin-brands",icon:"building-skyscraper",label:"Brand clients"},{key:"admin-agencies",icon:"briefcase",label:"Agency clients"},{key:"approvals",icon:"circle-check",label:"Approvals"}]},
  {section:"FINANCE",items:[{key:"comp-tracking",icon:"report-money",label:"Compensation"},{key:"payouts",icon:"cash",label:"Payout records"}]},
  {section:"CONTENT",items:[{key:"content-mgmt",icon:"upload",label:"Resources"},{key:"announcements",icon:"speakerphone",label:"Announcements"}]},
  {section:"COMMS",items:[{key:"slack",icon:"brand-slack",label:"Slack"}]},
];

function Sidebar({groups,active,onSelect,top,bottom}){
  return <div style={{width:"var(--sidebar-w)",background:"var(--bg)",borderRight:"0.5px solid var(--line2)",display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto",position:"sticky",top:0,height:"100vh"}}>
    {top}
    <div style={{flex:1,padding:"6px 0 12px"}}>
      {groups.map(g=><div key={g.section}>
        <div style={{...S.label,padding:"12px 16px 4px"}}>{g.section}</div>
        {g.items.map(n=>{const on=active===n.key;
          return <button key={n.key} onClick={()=>onSelect(n.key)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 16px",width:"100%",border:"none",background:on?"var(--blue-bg)":"transparent",color:on?"var(--blue)":"var(--text2)",cursor:"pointer",fontSize:12,fontWeight:on?500:400,textAlign:"left",borderLeft:on?"2px solid var(--blue)":"2px solid transparent",transition:"all 0.12s",fontFamily:"var(--font)"}}>
            <i className={`ti ti-${n.icon}`} style={{fontSize:14,flexShrink:0}}/><span style={{flex:1}}>{n.label}</span>
            {n.badge?<span style={{background:"var(--blue)",color:"#fff",fontSize:9,fontWeight:700,borderRadius:10,padding:"1px 5px",fontFamily:"var(--mono)"}}>{n.badge}</span>:null}
          </button>;
        })}
      </div>)}
    </div>
    {bottom&&<div style={{padding:"12px 16px",borderTop:"0.5px solid var(--line)"}}>{bottom}</div>}
  </div>;
}

// ── LOGIN ────────────────────────────────────────────────────────────────────
function Login({onLogin}){
  const[email,setEmail]=useState("");const[pass,setPass]=useState("");const[err,setErr]=useState("");const[loading,setLoading]=useState(false);
  const go=async()=>{
    setErr("");setLoading(true);
    if(email.trim().toLowerCase()===ADMIN_EMAIL&&pass===ADMIN_PASS){setLoading(false);onLogin({role:"admin"});return;}
    const{data,error}=await supabase.from("partners").select("*").eq("email",email.trim().toLowerCase()).eq("password",pass).single();
    setLoading(false);
    if(error||!data){setErr("Invalid credentials.");return;}
    onLogin({role:"partner",partner:data});
  };
  return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg2)"}}>
    <div style={{width:380}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <img src="/logo.png" alt="" style={{width:36,height:36,objectFit:"contain",display:"block",margin:"0 auto 12px"}}/>
        <div style={{fontSize:15,fontWeight:600}}>DSP Connect</div>
        <div style={{fontSize:11,color:"var(--text3)",marginTop:3}}>Managing Partner Portal</div>
      </div>
      <Card style={{padding:24}}>
        <div style={{marginBottom:13}}><label style={{...S.label,display:"block",marginBottom:6}}>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="partner@firm.com"/></div>
        <div style={{marginBottom:18}}><label style={{...S.label,display:"block",marginBottom:6}}>Password</label><input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="••••••••"/></div>
        {err&&<div style={{fontSize:12,color:"var(--red)",background:"var(--red-bg)",borderRadius:5,padding:"8px 11px",marginBottom:13}}>{err}</div>}
        <Btn onClick={go} variant="primary" size="lg" disabled={loading}>{loading?"Signing in…":"Sign in"}</Btn>
        <div style={{marginTop:16,padding:"10px 13px",background:"var(--bg2)",borderRadius:5,fontSize:11,color:"var(--text3)",borderLeft:"2px solid var(--blue-bg2)"}}>
          <span style={{color:"var(--blue)",fontWeight:500}}>Admin:</span> {ADMIN_EMAIL}
        </div>
      </Card>
    </div>
  </div>;
}


function Row({k,v}){return <div style={{display:"flex",gap:14,padding:"8px 0",borderBottom:"0.5px solid var(--line)",fontSize:13}}><span style={{...S.label,minWidth:155,flexShrink:0,paddingTop:1}}>{k}</span><span style={{color:"var(--text)"}}>{v}</span></div>;}

// ── ONBOARDING ────────────────────────────────────────────────────────────────
function Onboarding({partner,onComplete}){
  const[step,setStep]=useState(0);const[sig,setSig]=useState("");
  const[checks,setChecks]=useState({comp:false,equity:false,ops:false,nc:false,sig:false});
  // Row defined below as top-level
  const steps=[
    {title:"Cash Compensation Policy",tag:"Exhibit B",icon:"currency-dollar",content:<div>
      <div style={{fontWeight:500,fontSize:14,marginBottom:14}}>Managing Partner Cash Compensation Policy</div>
      <Row k="Rate" v="10% of Qualified Ad Spend Under Management (AUM)"/>
      <Row k="Payment schedule" v="Monthly, after advertiser funds collected by DSP Connect"/>
      <Row k="Qualifying spend" v="Contracted, activated, invoiced, and collected"/>
      <Row k="Non-qualifying" v="Unpaid invoices, chargebacks, refunds, disputes, write-offs"/>
      <Row k="Guarantee" v="Production-based only — no salary minimum"/>
      <label style={{display:"flex",alignItems:"flex-start",gap:9,marginTop:13,cursor:"pointer",fontSize:12,color:"var(--text2)"}}>
        <input type="checkbox" checked={checks.comp} onChange={e=>setChecks(c=>({...c,comp:e.target.checked}))} style={{width:14,height:14,flexShrink:0,marginTop:2,accentColor:"var(--blue)"}}/>
        I have read and understood the Cash Compensation Policy (Exhibit B)
      </label>
    </div>},
    {title:"Equity Vesting Policy",tag:"Exhibit A",icon:"chart-donut",content:<div>
      <div style={{fontWeight:500,fontSize:14,marginBottom:14}}>Equity Vesting, Performance & Acceleration Policy</div>
      <Row k="Equity pool" v="40% of total LLC membership interests"/>
      <Row k="Base grant" v="5.00% upon qualifying"/>
      <Row k="Annual minimum" v="$5,000,000 AUM in first 12 months"/>
      <Row k="Vesting cliff" v="1 year — no partial vesting before anniversary"/>
      <Row k="Maximum Year 1" v="15.00% — 5% base + up to 10% acceleration"/>
      <div style={{marginTop:12,padding:"9px 12px",background:"var(--amber-bg)",border:"0.5px solid rgba(154,95,10,0.15)",borderRadius:5,fontSize:11,color:"var(--amber)"}}>⚠ Missed acceleration windows are permanently forfeited.</div>
      <label style={{display:"flex",alignItems:"flex-start",gap:9,marginTop:13,cursor:"pointer",fontSize:12,color:"var(--text2)"}}>
        <input type="checkbox" checked={checks.equity} onChange={e=>setChecks(c=>({...c,equity:e.target.checked}))} style={{width:14,height:14,flexShrink:0,marginTop:2,accentColor:"var(--blue)"}}/>
        I have read and understood the Equity Vesting Policy (Exhibit A)
      </label>
    </div>},
    {title:"Operating Rules",tag:"Acknowledgment",icon:"checklist",content:<div>
      <div style={{fontWeight:500,fontSize:14,marginBottom:14}}>Operating Rules & Required Acknowledgements</div>
      <Row k="Non-compete" v={`${partner.non_compete_days||90} days post-termination`}/>
      <Row k="Trailing comp" v={TRAILING.find(o=>o.value===(partner.trailing_option||"A"))?.label}/>
      <Row k="Account ownership" v="DSP Connect owns all advertiser accounts"/>
      <Row k="IP" v="All platform materials remain property of DSP Connect"/>
      <label style={{display:"flex",alignItems:"flex-start",gap:9,marginTop:13,cursor:"pointer",fontSize:12,color:"var(--text2)"}}>
        <input type="checkbox" checked={checks.ops} onChange={e=>setChecks(c=>({...c,ops:e.target.checked}))} style={{width:14,height:14,flexShrink:0,marginTop:2,accentColor:"var(--blue)"}}/>
        I acknowledge and agree to the operating rules above
      </label>
      <label style={{display:"flex",alignItems:"flex-start",gap:9,marginTop:10,cursor:"pointer",fontSize:12,color:"var(--text2)"}}>
        <input type="checkbox" checked={checks.nc} onChange={e=>setChecks(c=>({...c,nc:e.target.checked}))} style={{width:14,height:14,flexShrink:0,marginTop:2,accentColor:"var(--blue)"}}/>
        I acknowledge the non-compete period and trailing compensation terms
      </label>
    </div>},
    {title:"Digital Signature",tag:"Final step",icon:"pencil",content:<div>
      <div style={{fontWeight:500,fontSize:14,marginBottom:14}}>Admission Confirmation & Digital Signature</div>
      <Row k="Full legal name" v={partner.legal_name||partner.name}/>
      <Row k="Email" v={partner.email}/>
      <Row k="Vertical" v={partner.vertical}/>
      <Row k="Start date" v={partner.start_date}/>
      <Row k="LLC entity" v="DSP Connect Holdings (Influence Crafters, LLC)"/>
      <Row k="Max equity Year 1" v="15.00%"/>
      <div style={{marginTop:16}}>
        <label style={{...S.label,display:"block",marginBottom:7}}>Type your full legal name to execute</label>
        <input value={sig} onChange={e=>{setSig(e.target.value);setChecks(c=>({...c,sig:e.target.value.trim().length>4}));}} placeholder={partner.legal_name||partner.name} style={{fontSize:15,fontWeight:500}}/>
      </div>
      <div style={{marginTop:12,padding:"9px 12px",background:"var(--green-bg)",borderRadius:5,fontSize:11,color:"var(--green)"}}>✓ Exhibits A & B acknowledged · Executed {today()}</div>
    </div>},
  ];
  const s=steps[step];
  const canAdvance=step===0?checks.comp:step===1?checks.equity:step===2?(checks.ops&&checks.nc):checks.sig;
  const complete=async()=>{
    await supabase.from("signatures").insert([{partner_id:partner.id,partner_name:partner.name,legal_name:sig,exhibit_a:true,exhibit_b:true,operating_rules:true,non_compete:true,policy_version:"v1.0",signed_at:new Date().toISOString()}]).catch(()=>{});
    onComplete();
  };
  return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg2)",padding:24}}>
    <div style={{width:"100%",maxWidth:620}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <img src="/logo.png" alt="" style={{width:28,height:28,objectFit:"contain",display:"block",margin:"0 auto 10px"}}/>
        <div style={{fontSize:11,color:"var(--text3)",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:4}}>Managing Partner Onboarding</div>
        <div style={{fontSize:18,fontWeight:500}}>Welcome, {(partner.name||"").split(" ")[0]}</div>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:20}}>
        {steps.map((_,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
          <div style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:600,fontFamily:"var(--mono)",background:i<step?"var(--green-bg)":i===step?"var(--blue-bg)":"var(--bg3)",color:i<step?"var(--green)":i===step?"var(--blue)":"var(--text3)",border:`0.5px solid ${i<step?"rgba(15,122,82,0.2)":i===step?"rgba(26,20,212,0.2)":"var(--line2)"}`}}>
            {i<step?<i className="ti ti-check" style={{fontSize:10}}/>:i+1}
          </div>
          {i<3&&<div style={{width:28,height:1,background:i<step?"var(--green)":"var(--line2)"}}/>}
        </div>)}
      </div>
      <Card style={{marginBottom:12}}>
        <div style={{padding:"13px 16px",borderBottom:"0.5px solid var(--line)",display:"flex",alignItems:"center",gap:9}}>
          <i className={`ti ti-${s.icon}`} style={{fontSize:15,color:"var(--blue)"}}/><span style={{fontSize:13,fontWeight:500,flex:1}}>{s.title}</span>
          <span style={S.pill("var(--blue-bg)","var(--blue)")}>{s.tag}</span>
          <span style={S.label}>Step {step+1}/4</span>
        </div>
        <div style={{padding:18}}>{s.content}</div>
      </Card>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
        {step>0&&<Btn onClick={()=>setStep(s=>s-1)} variant="ghost">← Back</Btn>}
        {step<3?<Btn onClick={()=>{if(canAdvance)setStep(s=>s+1);}} variant={canAdvance?"primary":"ghost"} disabled={!canAdvance}>Continue →</Btn>
          :<Btn onClick={complete} variant={canAdvance?"success":"ghost"} disabled={!canAdvance}>Execute & access dashboard →</Btn>}
      </div>
    </div>
  </div>;
}

// ── PARTNER APP ───────────────────────────────────────────────────────────────
function PartnerApp({partner,onLogout}){
  const[view,setView]=useState("dashboard");
  const[pipeline,setPipeline]=useState([]);
  const[resources,setResources]=useState([]);
  const[tickets,setTickets]=useState([]);
  const[payouts,setPayouts]=useState([]);
  const[announcements,setAnnouncements]=useState([]);
  const[loading,setLoading]=useState(true);
  const[showAdd,setShowAdd]=useState(false);
  const[clientType,setClientType]=useState("brand");
  const[nc,setNc]=useState({name:"",contact_name:"",email:"",monthly_spend:"",notes:""});
  const[briefStep,setBriefStep]=useState(1);
  const[pendingClient,setPendingClient]=useState(null);
  const[brief,setBrief]=useState({advertiser_name:"",company_category:"",campaign_type:"Managed",goals:"",budget_total:"",start_date:"",end_date:"",timezone:"",geo:"",frequency_cap:"",creative_type:"",traffic_type:"",device_type:"",targeting:"",bundles_domains:"",first_party_data:"",kpis:"",creative_file_link:"",tracking_tags:"",notes:""});
  const[newTicket,setNewTicket]=useState({type:"Client Issue",subject:"",details:""});
  const[showTicket,setShowTicket]=useState(false);
  const[payView,setPayView]=useState("all");
  const[activeResource,setActiveResource]=useState(null);
  const[helpTopic,setHelpTopic]=useState(null);

  useEffect(()=>{
    Promise.all([
      supabase.from("pipeline").select("*").eq("partner_id",partner.id).order("created_at",{ascending:false}),
      supabase.from("resources").select("*").order("created_at",{ascending:false}),
      supabase.from("tickets").select("*").eq("partner_id",partner.id).order("created_at",{ascending:false}),
      supabase.from("payouts").select("*").eq("partner_id",partner.id).order("created_at",{ascending:false}),
      supabase.from("announcements").select("*").eq("active",true).order("created_at",{ascending:false}),
    ]).then(([p,r,t,py,an])=>{
      setPipeline(p.data||[]);setResources(r.data||[]);setTickets(t.data||[]);setPayouts(py.data||[]);setAnnouncements(an.data||[]);setLoading(false);
    }).catch(()=>setLoading(false));
  },[partner.id]);

  const days=daysIn(partner.start_date);
  const eq=calcEquity(partner);
  const score=calcScore(partner,pipeline);
  const active=pipeline.filter(c=>c.stage==="Active");
  const totalAUM=active.reduce((s,c)=>s+(c.monthly_spend||0),0);
  const comp=totalAUM*REV_RATE;
  const now=new Date();
  const paidTotal=payouts.reduce((s,p)=>s+(p.amount||0),0);
  const paidMonth=payouts.filter(p=>{const d=new Date(p.created_at);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();}).reduce((s,p)=>s+(p.amount||0),0);

  const resetAdd=()=>{setShowAdd(false);setBriefStep(1);setPendingClient(null);setNc({name:"",contact_name:"",email:"",monthly_spend:"",notes:""});setBrief({advertiser_name:"",company_category:"",campaign_type:"Managed",goals:"",budget_total:"",start_date:"",end_date:"",timezone:"",geo:"",frequency_cap:"",creative_type:"",traffic_type:"",device_type:"",targeting:"",bundles_domains:"",first_party_data:"",kpis:"",creative_file_link:"",tracking_tags:"",notes:""});};

  const startBrief=(type)=>{
    if(!nc.name)return;
    setClientType(type);setPendingClient({...nc,type});setBriefStep(2);
  };

  const submitBrief=async()=>{
    const pc=pendingClient;if(!pc)return;
    const{data:pd}=await supabase.from("pipeline").insert([{type:pc.type,partner_id:partner.id,partner_name:partner.name,name:pc.name,contact_name:pc.contact_name,email:pc.email,monthly_spend:parseFloat(pc.monthly_spend)||0,notes:pc.notes,stage:"Review"}]).select().single();
    if(pd){
      setPipeline(p=>[pd,...p]);
      await supabase.from("campaign_briefs").insert([{pipeline_id:pd.id,partner_id:partner.id,partner_name:partner.name,client_name:pc.name,client_type:pc.type,...brief,budget_total:parseFloat(brief.budget_total)||0,status:"Submitted"}]).catch(()=>{});
      await supabase.from("slack_notifications").insert([{channel:"#new-client-briefs",message:`New campaign brief: ${partner.name} submitted ${pc.name} (${pc.type}) · ${fmtK(parseFloat(pc.monthly_spend)||0)}/mo`,sent:false}]).catch(()=>{});
    }
    resetAdd();
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

  const brands=pipeline.filter(c=>c.type==="brand");
  const agencies=pipeline.filter(c=>c.type==="agency");

  const sideTop=<div><Logo/><div style={{padding:"0 16px 12px",borderBottom:"0.5px solid var(--line)"}}>
    <div style={{display:"flex",alignItems:"center",gap:9}}><Avatar name={partner.name} size={30}/>
    <div><div style={{fontSize:12,fontWeight:500}}>{(partner.name||"").split(" ")[0]}</div><div style={{fontSize:10,color:"var(--text3)"}}>{partner.agency||partner.vertical}</div></div>
    </div></div></div>;
  const sideBottom=<div><GlobalHelpBtn setHelp={setHelpTopic}/><div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--text3)",marginBottom:7}}>Day {days}</div>
    <button onClick={onLogout} style={{fontSize:11,color:"var(--text3)",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:0,fontFamily:"var(--font)"}}><i className="ti ti-logout" style={{fontSize:12}}/>Sign out</button></div>;

  if(loading)return <div style={{display:"flex",minHeight:"100vh"}}><Sidebar groups={PNAV} active={view} onSelect={setView} top={sideTop} bottom={sideBottom}/><div style={{flex:1}}><Spinner/></div></div>;

  const wrap=ch=><div style={{flex:1,overflowY:"auto",padding:22,background:"var(--bg2)"}}>{ch}</div>;
  const ph=(t,s,action)=><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}><div><div style={{fontSize:18,fontWeight:500,marginBottom:2}}>{t}</div>{s&&<div style={{fontSize:11,color:"var(--text3)"}}>{s}</div>}</div>{action&&<div style={{marginLeft:12,flexShrink:0}}>{action}</div>}</div>;

  return <div style={{display:"flex",minHeight:"100vh",background:"var(--bg2)"}}>
    {helpTopic&&<HelpDrawer topic={helpTopic} onClose={()=>setHelpTopic(null)}/>}
    {activeResource&&<ResourceEmbed resource={activeResource} onClose={()=>setActiveResource(null)}/>}
    <Sidebar groups={PNAV} active={view} onSelect={setView} top={sideTop} bottom={sideBottom}/>
    {wrap(<>

    {view==="dashboard"&&<div>
      {ph("Dashboard",`${partner.vertical} · Day ${days}`,<HelpBtn topic="dashboard" setHelp={setHelpTopic}/>)}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        <KPI label="Active AUM" value={fmtK(totalAUM)} sub={`${active.length} active clients`}/>
        <KPI label="Monthly comp" value={fmt$(comp)} sub="10% of active AUM" accent="green"/>
        <KPI label="Paid this month" value={fmt$(paidMonth)} accent="blue"/>
        <div style={{...S.card,padding:"16px 18px"}}>
          <div style={{...S.label,marginBottom:8}}><Tip text={"Composite score 0–100 based on your AUM, number of clients, and active client count. Higher score = stronger partner standing."}>Partner score</Tip></div>
          <div style={{fontFamily:"var(--mono)",fontSize:22,fontWeight:500,color:score>=70?"var(--green)":score>=40?"var(--amber)":"var(--red)",lineHeight:1}}>{score}<span style={{fontSize:12,color:"var(--text3)",fontFamily:"var(--font)"}}>/ 100</span></div>
          <div style={{marginTop:8}}><Bar pct={score} color={score>=70?"var(--green)":score>=40?"var(--amber)":"var(--red)"}/></div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <CardHead title="Announcements"/>
          <div style={{padding:12,display:"flex",flexDirection:"column",gap:8}}>
            {announcements.length===0?<>
              <div style={{padding:"9px 12px",background:"var(--blue-bg)",borderRadius:5}}><div style={{fontSize:10,fontWeight:600,color:"var(--blue)",marginBottom:2,letterSpacing:"0.4px",textTransform:"uppercase",fontFamily:"var(--mono)"}}>Welcome</div><div style={{fontSize:12,color:"var(--text2)"}}>Your portal is active. Complete your 90-day acceleration window to maximize equity.</div></div>
              <div style={{padding:"9px 12px",background:"var(--amber-bg)",borderRadius:5}}><div style={{fontSize:10,fontWeight:600,color:"var(--amber)",marginBottom:2,letterSpacing:"0.4px",textTransform:"uppercase",fontFamily:"var(--mono)"}}>Reminder</div><div style={{fontSize:12,color:"var(--text2)"}}>Missed acceleration windows are permanently forfeited.</div></div>
            </>:announcements.map(a=>{const[bg,fg]=a.type==="warning"?["var(--amber-bg)","var(--amber)"]:a.type==="success"?["var(--green-bg)","var(--green)"]:["var(--blue-bg)","var(--blue)"];return <div key={a.id} style={{padding:"9px 12px",background:bg,borderRadius:5}}><div style={{fontSize:10,fontWeight:600,color:fg,marginBottom:2,letterSpacing:"0.4px",textTransform:"uppercase",fontFamily:"var(--mono)"}}>{a.title}</div><div style={{fontSize:12,color:"var(--text2)"}}>{a.body}</div></div>;})}
          </div>
        </Card>
        <Card>
          <CardHead title="90-Day Acceleration" sub={`Day ${Math.min(days,90)} of 90`}/>
          <div style={{padding:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {[{l:"Day 1–30",done:days>30,on:days<=30,award:(D30.find(t=>(partner.day30_aum||0)>=t.aum)||{award:0}).award,max:3},
                {l:"Day 31–60",done:days>60,on:days>30&&days<=60,award:(D60.find(t=>(partner.day60_aum||0)>=t.aum)||{award:0}).award,max:3},
                {l:"Day 61–90",done:days>90,on:days>60&&days<=90,award:(D90.find(t=>(partner.day90_aum||0)>=t.aum)||{award:0}).award,max:4},
              ].map(w=><div key={w.l} style={{padding:10,background:w.on?"var(--blue-bg)":w.done?"var(--green-bg)":"var(--bg2)",borderRadius:5,border:`0.5px solid ${w.on?"rgba(26,20,212,0.12)":w.done?"rgba(15,122,82,0.12)":"var(--line)"}`}}>
                <div style={{fontSize:9,fontWeight:600,letterSpacing:"0.5px",color:w.on?"var(--blue)":w.done?"var(--green)":"var(--text3)",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:5}}>{w.l}</div>
                <div style={{fontFamily:"var(--mono)",fontSize:20,fontWeight:500,color:w.on?"var(--blue)":w.done?"var(--green)":"var(--text3)",lineHeight:1}}>{w.award.toFixed(1)}<span style={{fontSize:11}}>%</span></div>
                <div style={{fontSize:10,color:"var(--text3)",marginTop:2}}>max {w.max}%</div>
              </div>)}
            </div>
            <div style={{borderTop:"0.5px solid var(--line)",paddingTop:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:5}}><span style={{color:"var(--text3)"}}>Total equity</span><span style={{fontFamily:"var(--mono)",color:"var(--blue)",fontWeight:500}}>{eq.total.toFixed(2)}% / 15.00%</span></div>
              <Bar pct={(eq.total/15)*100}/>
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <CardHead title="Client pipeline" action={<Btn onClick={()=>setView("pipeline")} variant="link" size="sm">View all →</Btn>}/>
        {pipeline.length===0?<div style={{padding:"22px 16px",textAlign:"center",fontSize:12,color:"var(--text3)"}}>No clients yet. <button onClick={()=>setView("brand-clients")} style={{background:"none",border:"none",color:"var(--blue)",cursor:"pointer",fontSize:12,fontFamily:"var(--font)"}}>Add your first →</button></div>
        :<div>{STAGES.map(stage=>{const ins=pipeline.filter(c=>c.stage===stage);if(!ins.length)return null;
          return <div key={stage} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 16px",borderBottom:"0.5px solid var(--line)"}}>
            <Badge s={stage}/><span style={{fontSize:12,color:"var(--text3)",flex:1}}>{ins.length} client{ins.length>1?"s":""}</span>
            <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--text2)"}}>{fmtK(ins.reduce((s,c)=>s+(c.monthly_spend||0),0))}/mo</span>
          </div>;})}</div>}
      </Card>
    </div>}

    {(view==="brand-clients"||view==="agency-clients")&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        {ph(view==="brand-clients"?"Brand Clients":"Agency Clients",view==="brand-clients"?"Direct advertisers under management":"Agencies and their managed spend",<HelpBtn topic="clients" setHelp={setHelpTopic}/>)}
        <Btn onClick={()=>{setClientType(view==="brand-clients"?"brand":"agency");setShowAdd(true);}} variant="primary">+ Add {view==="brand-clients"?"client":"agency"}</Btn>
      </div>
      {showAdd&&<BriefForm type={view==="brand-clients"?"brand":"agency"} step={briefStep} setStep={setBriefStep} nc={nc} setNc={setNc} brief={brief} setBrief={setBrief} onNext={()=>startBrief(view==="brand-clients"?"brand":"agency")} onSubmit={submitBrief} onCancel={resetAdd}/>}
      {(view==="brand-clients"?brands:agencies).length===0&&!showAdd?<Empty icon={view==="brand-clients"?"building-skyscraper":"briefcase"} title={`No ${view==="brand-clients"?"brand":"agency"} clients yet`} sub="Add your first client to get started." cta="+ Add now" onCta={()=>setShowAdd(true)}/>
      :<Card>
        <THead cols="2fr 1fr 1fr 1fr 1fr" labels={[view==="brand-clients"?"Company":"Agency","Contact","Monthly Spend","Stage","Added"]}/>
        {(view==="brand-clients"?brands:agencies).map((c,i,arr)=><div key={c.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"11px 16px",borderBottom:i<arr.length-1?"0.5px solid var(--line)":"none",alignItems:"center"}}>
          <div><div style={{fontSize:13,fontWeight:500}}>{c.name}</div>{c.notes&&<div style={{fontSize:11,color:"var(--text3)"}}>{c.notes}</div>}</div>
          <div style={{fontSize:12,color:"var(--text3)"}}>{c.contact_name||"—"}</div>
          <div style={{fontFamily:"var(--mono)",fontSize:12,color:c.stage==="Active"?"var(--green)":"var(--text)"}}>{fmtK(c.monthly_spend||0)}</div>
          <Badge s={c.stage}/>
          <div style={{fontSize:11,color:"var(--text3)"}}>{(c.created_at||"").slice(0,10)}</div>
        </div>)}
        <div style={{padding:"9px 16px",background:"var(--bg2)",borderTop:"0.5px solid var(--line)",display:"flex",justifyContent:"space-between"}}>
          <span style={S.label}>Total active AUM</span>
          <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)",fontWeight:500}}>{fmtK((view==="brand-clients"?brands:agencies).filter(c=>c.stage==="Active").reduce((s,c)=>s+(c.monthly_spend||0),0))}/mo</span>
        </div>
      </Card>}
    </div>}

    {view==="pipeline"&&<div>
      {ph("Pipeline","All clients by stage — move a client forward using the dropdown on each card",<HelpBtn topic="pipeline" setHelp={setHelpTopic}/>)}
      {["brand","agency"].map(type=><div key={type} style={{marginBottom:24}}>
        <div style={{...S.label,marginBottom:8}}>{type==="brand"?"Brand":"Agency"} clients <span style={{fontFamily:"var(--mono)"}}>{pipeline.filter(c=>c.type===type).length}</span></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {STAGES.map(stage=>{const stageDesc={Lead:'Initial prospect — not yet submitted',"Deposit Paid":'Client has paid their deposit',Review:'Submitted to DSP Connect for review',Approved:'Approved — campaign setup in progress',Active:'Live and spending — counts toward your AUM'};const ins=pipeline.filter(c=>c.type===type&&c.stage===stage);
            return <div key={stage}>
              <div style={{...S.label,marginBottom:5,textAlign:"center"}}><Tip text={stageDesc[stage]}>{stage}</Tip> <span style={{fontFamily:"var(--mono)"}}>{ins.length}</span></div>
              <div style={{minHeight:50,background:"var(--bg3)",borderRadius:5,padding:5,display:"flex",flexDirection:"column",gap:4,border:"0.5px solid var(--line)"}}>
                {ins.map(c=><div key={c.id} style={{background:"var(--bg)",border:"0.5px solid var(--line2)",borderRadius:4,padding:"7px 9px"}}>
                  <div style={{fontSize:11,fontWeight:500,marginBottom:2}}>{c.name}</div>
                  <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--green)",marginBottom:5}}>{fmtK(c.monthly_spend||0)}</div>
                  <select value={c.stage} onChange={e=>moveStage(c.id,e.target.value)} style={{fontSize:10,padding:"2px 3px",borderRadius:3,width:"100%"}}>{STAGES.map(s=><option key={s}>{s}</option>)}</select>
                </div>)}
                {!ins.length&&<div style={{fontSize:10,color:"var(--text3)",textAlign:"center",padding:"8px 0"}}>—</div>}
              </div>
            </div>;
          })}
        </div>
      </div>)}
    </div>}

    {view==="compensation"&&<div>
      {ph("Compensation","Cash Compensation Policy (Exhibit B) · 10% of Active AUM",<HelpBtn topic="compensation" setHelp={setHelpTopic}/>)}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        <KPI label="Active AUM" value={fmtK(totalAUM)} sub="Monthly managed spend"/>
        <KPI label="Monthly comp" value={fmt$(comp)} accent="green"/>
        <KPI label="Paid this month" value={fmt$(paidMonth)} accent="blue"/>
        <KPI label="Total paid (lifetime)" value={fmt$(paidTotal)} accent="green"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <CardHead title="Active client breakdown"/>
          {!active.length?<div style={{padding:"22px 16px",textAlign:"center",fontSize:12,color:"var(--text3)"}}>No active clients yet</div>:<>
            <THead cols="2fr 1fr 1fr 1fr" labels={["Client","Type","AUM/mo","Comp 10%"]}/>
            {active.map((c,i)=><div key={c.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",padding:"10px 16px",borderBottom:i<active.length-1?"0.5px solid var(--line)":"none",alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:500}}>{c.name}</span>
              <span style={S.pill("var(--blue-bg)","var(--blue)")}>{c.type}</span>
              <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)"}}>{fmtK(c.monthly_spend||0)}</span>
              <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)"}}>{fmt$((c.monthly_spend||0)*REV_RATE)}</span>
            </div>)}
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",padding:"10px 16px",background:"var(--bg2)",borderTop:"0.5px solid var(--line)"}}>
              <span style={{fontSize:12,fontWeight:500}}>Total</span><span/>
              <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)",fontWeight:500}}>{fmtK(totalAUM)}</span>
              <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)",fontWeight:500}}>{fmt$(comp)}</span>
            </div>
          </>}
        </Card>
        <Card>
          <CardHead title="Annual projection"/>
          {[["Annual AUM",fmtK(totalAUM*12)],["Annual comp",fmt$(comp*12)],["YTD est.",fmt$(comp*Math.max(1,Math.floor(days/30)))],["Run rate",fmtK(comp*12)]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 16px",borderBottom:"0.5px solid var(--line)",alignItems:"center"}}>
            <span style={{fontSize:12,color:"var(--text2)"}}>{l}</span>
            <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)",fontWeight:500}}>{v}</span>
          </div>)}
        </Card>
      </div>
      <Card>
        <CardHead title="Payout history" action={<div style={{display:"flex",gap:4}}>{["weekly","monthly","all"].map(v=><button key={v} onClick={()=>setPayView(v)} style={{fontSize:10,padding:"3px 8px",borderRadius:3,border:"0.5px solid var(--line3)",background:payView===v?"var(--blue)":"transparent",color:payView===v?"#fff":"var(--text3)",cursor:"pointer",fontFamily:"var(--mono)"}}>{v}</button>)}</div>}/>
        {!filteredPayouts.length?<div style={{padding:"22px 16px",textAlign:"center",fontSize:12,color:"var(--text3)"}}>No payouts for this period.</div>:<>
          <THead cols="1fr 1fr 1fr 1fr 1fr" labels={["Date","Period","Amount","Reference","Notes"]}/>
          {filteredPayouts.map((p,i,arr)=><div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",padding:"11px 16px",borderBottom:i<arr.length-1?"0.5px solid var(--line)":"none",alignItems:"center"}}>
            <span style={{fontSize:11,color:"var(--text3)"}}>{fmtDate(p.created_at)}</span>
            <span style={{fontSize:12}}>{p.period_label||"—"}</span>
            <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)",fontWeight:500}}>{fmt$(p.amount)}</span>
            <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--text3)"}}>{p.reference||"—"}</span>
            <span style={{fontSize:11,color:"var(--text3)"}}>{p.notes||"—"}</span>
          </div>)}
          <div style={{padding:"9px 16px",background:"var(--bg2)",borderTop:"0.5px solid var(--line)",display:"flex",justifyContent:"space-between"}}>
            <span style={S.label}>Total</span>
            <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)",fontWeight:500}}>{fmt$(filteredPayouts.reduce((s,p)=>s+(p.amount||0),0))}</span>
          </div>
        </>}
      </Card>
    </div>}

    {view==="equity"&&<div>
      {ph("Ownership","Equity Vesting, Performance & Acceleration Policy (Exhibit A)",<HelpBtn topic="equity" setHelp={setHelpTopic}/>)}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        <KPI label="Ownership stake" value={`${eq.total.toFixed(2)}%`} accent="blue"/>
        <KPI label="Vesting status" value={eq.qualifies?"Qualified":"Pending"} sub={eq.qualifies?"$5M AUM met":"$5M AUM required"} accent={eq.qualifies?"green":undefined}/>
        <KPI label="AUM to qualify" value={eq.qualifies?"✓ Met":fmtK(Math.max(0,5000000-(partner.annual_aum||0)))} sub={eq.qualifies?"":"remaining"}/>
        <KPI label="Max equity Yr 1" value="15.00%" sub="5% base + 10% acceleration"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card>
          <CardHead title="Equity breakdown"/>
          <div style={{padding:"14px 16px"}}>
            {[{l:"Base grant",pct:eq.base,max:5,color:"var(--blue)",n:"5% upon qualifying"},{l:"Day 1–30 accel.",pct:eq.a30,max:3,color:"var(--amber)",n:"Max 3%"},{l:"Day 31–60 accel.",pct:eq.a60,max:3,color:"var(--green)",n:"Max 3%"},{l:"Day 61–90 accel.",pct:eq.a90,max:4,color:"var(--blue)",n:"Max 4%"}].map(r=><div key={r.l} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:12,color:"var(--text2)"}}>{r.l} <span style={{fontSize:10,color:"var(--text3)"}}>{r.n}</span></span>
                <span style={{fontFamily:"var(--mono)",fontSize:12,color:r.color}}>{eq.qualifies?r.pct.toFixed(2):0}%</span>
              </div>
              <Bar pct={eq.qualifies?(r.pct/r.max)*100:0} color={r.color}/>
            </div>)}
            <div style={{borderTop:"0.5px solid var(--line)",paddingTop:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:500}}>Total</span>
              <span style={{fontFamily:"var(--mono)",fontSize:16,color:"var(--blue)",fontWeight:500}}>{eq.total.toFixed(2)}% <span style={{fontSize:11,color:"var(--text3)"}}>/ 15.00%</span></span>
            </div>
          </div>
        </Card>
        <Card>
          <CardHead title="Signed documents"/>
          {[{l:"Equity Vesting Policy",t:"Exhibit A"},{l:"Cash Compensation Policy",t:"Exhibit B"},{l:"Managing Partner Admission Notice",t:""},{l:"Master Operating Agreement",t:""}].map((d,i,arr)=><div key={d.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:i<arr.length-1?"0.5px solid var(--line)":"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}><i className="ti ti-file-check" style={{fontSize:13,color:"var(--green)"}}/><div><div style={{fontSize:12}}>{d.l}</div>{d.t&&<div style={{fontSize:10,color:"var(--text3)"}}>{d.t}</div>}</div></div>
            <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--text3)"}}>On file</span>
          </div>)}
          <div style={{padding:"9px 16px",background:"var(--green-bg)",borderTop:"0.5px solid rgba(15,122,82,0.1)"}}><span style={{fontSize:11,color:"var(--green)"}}>✓ Executed on {partner.start_date}</span></div>
        </Card>
      </div>
    </div>}

    {["training","sops","documents"].includes(view)&&<div>
      {ph(view==="training"?"Training":view==="sops"?"SOPs":"Documents",view==="training"?"Click any resource to open it":"",<HelpBtn topic="resources" setHelp={setHelpTopic}/>)}
      {!resources.filter(r=>r.category===view).length?<Empty icon="file-description" title="No resources yet" sub="Admin will upload materials here shortly."/>
      :<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {resources.filter(r=>r.category===view).map(r=><ResourceCard key={r.id} resource={r} onClick={()=>setActiveResource(r)}/>)}
      </div>}
    </div>}

    {view==="support"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        {ph("Help Desk","Submit issues to the DSP Connect operations team — we respond within 1 business day",<HelpBtn topic="support" setHelp={setHelpTopic}/>)}
        <Btn onClick={()=>setShowTicket(true)} variant="primary">+ New ticket</Btn>
      </div>
      {showTicket&&<Card style={{marginBottom:14}}>
        <CardHead title="New support ticket"/>
        <div style={{padding:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <Field label="Issue type"><select value={newTicket.type} onChange={e=>setNewTicket(t=>({...t,type:e.target.value}))} style={{width:"100%"}}>{["Client Issue","Agency Issue","Billing Issue","Technical Issue","Other"].map(t=><option key={t}>{t}</option>)}</select></Field>
            <Field label="Subject *"><input value={newTicket.subject} onChange={e=>setNewTicket(t=>({...t,subject:e.target.value}))}/></Field>
            <Field label="Details" full><textarea value={newTicket.details} onChange={e=>setNewTicket(t=>({...t,details:e.target.value}))} rows={3} style={{resize:"vertical"}}/></Field>
          </div>
          <div style={{display:"flex",gap:8}}><Btn onClick={submitTicket} variant="primary">Submit</Btn><Btn onClick={()=>setShowTicket(false)} variant="ghost">Cancel</Btn></div>
        </div>
      </Card>}
      {!tickets.length?<Empty icon="headset" title="No tickets yet" sub="Submit a ticket for any client, billing, or technical issue."/>
      :<Card>
        {tickets.map((t,i,arr)=><div key={t.id} style={{padding:"12px 16px",borderBottom:i<arr.length-1?"0.5px solid var(--line)":"none"}}>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:t.details||t.admin_reply?5:0}}>
            <span style={S.pill("var(--blue-bg)","var(--blue)")}>{t.type}</span>
            <span style={{fontSize:13,fontWeight:500,flex:1}}>{t.subject}</span>
            <Badge s={t.status}/>
            <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--text3)"}}>{(t.created_at||"").slice(0,10)}</span>
          </div>
          {t.details&&<div style={{fontSize:12,color:"var(--text3)",marginBottom:t.admin_reply?6:0}}>{t.details}</div>}
          {t.admin_reply&&<div style={{padding:"8px 11px",background:"var(--green-bg)",borderRadius:5,fontSize:12,color:"var(--green)"}}><span style={{fontWeight:500}}>Response: </span>{t.admin_reply}</div>}
        </div>)}
      </Card>}
    </div>}

    </>)}
  </div>;
}

// ── ADMIN APP ────────────────────────────────────────────────────────────────
function AdminApp({onLogout}){
  const[partners,setPartners]=useState([]);
  const[pipeline,setPipeline]=useState([]);
  const[resources,setResources]=useState([]);
  const[tickets,setTickets]=useState([]);
  const[payouts,setPayouts]=useState([]);
  const[announcements,setAnnouncements]=useState([]);
  const[briefs,setBriefs]=useState([]);
  const[loading,setLoading]=useState(true);
  const[view,setView]=useState("dashboard");
  const[sel,setSel]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[saving,setSaving]=useState(false);
  const[payoutModal,setPayoutModal]=useState(null);
  const[expandedBrief,setExpandedBrief]=useState(null);
  const[ticketReply,setTicketReply]=useState({});
  const[slackMsgs,setSlackMsgs]=useState([]);
  const[slackMsg,setSlackMsg]=useState("");
  const[slackCh,setSlackCh]=useState("#partner-revenue");
  const[newResource,setNewResource]=useState({title:"",type:"pdf",category:"training",description:"",url:""});
  const[showAddRes,setShowAddRes]=useState(false);
  const[newAnn,setNewAnn]=useState({title:"",body:"",type:"info"});
  const[showAddAnn,setShowAddAnn]=useState(false);
  const[newPayout,setNewPayout]=useState({amount:"",period_label:"",period_start:"",period_end:"",reference:"",notes:""});
  const[formErr,setFormErr]=useState("");
  const blank={name:"",legal_name:"",agency:"",email:"",password:"",vertical:VERTICALS[0],start_date:today(),monthly_spend:"",annual_aum:"",day30_aum:"",day60_aum:"",day90_aum:"",non_compete_days:"90",trailing_option:"A",status:"Pending Setup"};
  const[form,setForm]=useState(blank);

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
      setPartners(p.data||[]);setPipeline(pi.data||[]);setResources(r.data||[]);setTickets(t.data||[]);setPayouts(py.data||[]);setAnnouncements(an.data||[]);setBriefs(cb.data||[]);setLoading(false);
      supabase.from("slack_notifications").select("*").eq("sent",false).order("created_at",{ascending:false})
        .then(({data:sn})=>{if(sn&&sn.length>0){setSlackMsgs(prev=>[...sn.map(n=>({channel:n.channel,message:n.message,time:new Date(n.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})})),...prev]);sn.forEach(n=>supabase.from("slack_notifications").update({sent:true}).eq("id",n.id));}}).catch(()=>{});
    }).catch(()=>setLoading(false));
  },[]);

  const addPartner=async()=>{
    if(!form.name||!form.email||!form.password){setFormErr("Name, email, and password required.");return;}
    if(partners.find(p=>p.email.toLowerCase()===form.email.toLowerCase())){setFormErr("Email already exists.");return;}
    setSaving(true);
    const{data,error}=await supabase.from("partners").insert([{...form,monthly_spend:parseFloat(form.monthly_spend)||0,annual_aum:parseFloat(form.annual_aum)||0,day30_aum:parseFloat(form.day30_aum)||0,day60_aum:parseFloat(form.day60_aum)||0,day90_aum:parseFloat(form.day90_aum)||0,non_compete_days:parseInt(form.non_compete_days)||90,onboarded:false}]).select().single();
    setSaving(false);
    if(error){setFormErr(error.message);return;}
    setPartners(p=>[data,...p]);
    sendSlack("#partner-updates",`New partner admitted: ${data.name} · ${data.vertical} · ${data.start_date}`);
    sendWelcomeEmail({...data,password:form.password});
    setForm(blank);setShowAdd(false);setFormErr("");
  };

  const updatePartner=async(id,updates)=>{
    await supabase.from("partners").update(updates).eq("id",id);
    setPartners(p=>p.map(x=>x.id===id?{...x,...updates}:x));
    if(sel?.id===id)setSel(s=>({...s,...updates}));
  };

  const recordPayout=async()=>{
    if(!payoutModal||!newPayout.amount)return;
    const p=partners.find(x=>x.id===payoutModal);
    const{data}=await supabase.from("payouts").insert([{partner_id:payoutModal,partner_name:p?.name,...newPayout,amount:parseFloat(newPayout.amount)||0}]).select().single();
    if(data)setPayouts(py=>[data,...py]);
    sendSlack("#partner-payouts",`Payout: ${p?.name} · ${fmt$(parseFloat(newPayout.amount)||0)} · ${newPayout.period_label||"—"} · Ref: ${newPayout.reference||"—"}`);
    if(p) sendPayoutEmail(p,{...newPayout,amount:parseFloat(newPayout.amount)||0});
    setNewPayout({amount:"",period_label:"",period_start:"",period_end:"",reference:"",notes:""});setPayoutModal(null);
  };

  const replyTicket=async(id)=>{
    const reply=ticketReply[id];if(!reply)return;
    const t=tickets.find(x=>x.id===id);
    await supabase.from("tickets").update({status:"Closed",admin_reply:reply}).eq("id",id);
    setTickets(ts=>ts.map(x=>x.id===id?{...x,status:"Closed",admin_reply:reply}:x));
    if(t){const p=partners.find(x=>x.id===t.partner_id);if(p)sendTicketReplyEmail(p,t,reply);}
    setTicketReply(r=>({...r,[id]:""}));
  };

  const moveStage=async(id,stage)=>{
    await supabase.from("pipeline").update({stage}).eq("id",id);
    setPipeline(p=>p.map(c=>c.id===id?{...c,stage}:c));
    if(stage==="Approved"||stage==="Active"){const c=pipeline.find(x=>x.id===id);if(c){const p=partners.find(x=>x.id===c.partner_id);if(p)sendClientApprovedEmail(p,c);}}
  };

  const addResource=async()=>{
    if(!newResource.title)return;
    const{data}=await supabase.from("resources").insert([newResource]).select().single();
    if(data)setResources(r=>[data,...r]);
    setNewResource({title:"",type:"pdf",category:"training",description:"",url:""});setShowAddRes(false);
  };

  const delResource=async(id)=>{await supabase.from("resources").delete().eq("id",id);setResources(r=>r.filter(x=>x.id!==id));};

  const addAnn=async()=>{
    if(!newAnn.title||!newAnn.body)return;
    const{data}=await supabase.from("announcements").insert([{...newAnn,active:true}]).select().single();
    if(data)setAnnouncements(a=>[data,...a]);
    setNewAnn({title:"",body:"",type:"info"});setShowAddAnn(false);
  };

  const toggleAnn=async(id,active)=>{await supabase.from("announcements").update({active}).eq("id",id);setAnnouncements(a=>a.map(x=>x.id===id?{...x,active}:x));};
  const delAnn=async(id)=>{await supabase.from("announcements").delete().eq("id",id);setAnnouncements(a=>a.filter(x=>x.id!==id));};
  const sendSlack=(ch,msg)=>{const time=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});setSlackMsgs(p=>[{channel:ch,message:msg,time},...p]);};

  const totalAUM=pipeline.filter(c=>c.stage==="Active").reduce((s,c)=>s+(c.monthly_spend||0),0);
  const totalComp=totalAUM*REV_RATE;
  const activeP=partners.filter(p=>p.status==="Active");
  const pending=pipeline.filter(c=>c.stage==="Review");
  const openT=tickets.filter(t=>t.status==="Open");
  const totalPaid=payouts.reduce((s,p)=>s+(p.amount||0),0);

  const navGroups=ANAV.map(g=>({...g,items:g.items.map(i=>({...i,badge:i.key==="approvals"?pending.length||null:i.key==="admissions"?partners.filter(p=>p.status==="Pending Setup").length||null:i.key==="slack"?openT.length||null:null}))}));
  const sideTop=<div><Logo/><div style={{padding:"0 16px 12px",borderBottom:"0.5px solid var(--line)"}}><div style={{fontSize:10,color:"var(--text3)"}}>Administration</div></div></div>;
  const sideBottom=<button onClick={onLogout} style={{fontSize:11,color:"var(--text3)",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:0,fontFamily:"var(--font)"}}><i className="ti ti-logout" style={{fontSize:12}}/>Sign out</button>;
  const F=({label,children,full})=><div style={full?{gridColumn:"1/-1"}:{}}><label style={{...S.label,display:"block",marginBottom:6}}>{label}</label>{children}</div>;

  if(loading)return <div style={{display:"flex",minHeight:"100vh"}}><Sidebar groups={navGroups} active={view} onSelect={setView} top={sideTop} bottom={sideBottom}/><div style={{flex:1}}><Spinner/></div></div>;

  const wrap=ch=><div style={{flex:1,overflowY:"auto",padding:22,background:"var(--bg2)"}}>{ch}</div>;
  const ph=(t,s,action)=><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}><div><div style={{fontSize:18,fontWeight:500,marginBottom:2}}>{t}</div>{s&&<div style={{fontSize:11,color:"var(--text3)"}}>{s}</div>}</div>{action&&<div style={{marginLeft:12,flexShrink:0}}>{action}</div>}</div>;

  return <div style={{display:"flex",minHeight:"100vh",background:"var(--bg2)"}}>
    <Sidebar groups={navGroups} active={view} onSelect={setView} top={sideTop} bottom={sideBottom}/>

    {payoutModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10000}}>
      <Card style={{width:480}}>
        <CardHead title="Record payout" sub={partners.find(p=>p.id===payoutModal)?.name}/>
        <div style={{padding:18}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <F label="Amount ($) *"><input type="number" value={newPayout.amount} onChange={e=>setNewPayout(p=>({...p,amount:e.target.value}))} placeholder="0.00" style={{fontFamily:"var(--mono)",fontSize:16}}/></F>
            <F label="Period label"><input value={newPayout.period_label} onChange={e=>setNewPayout(p=>({...p,period_label:e.target.value}))} placeholder="e.g. June 2026"/></F>
            <F label="Period start"><input type="date" value={newPayout.period_start} onChange={e=>setNewPayout(p=>({...p,period_start:e.target.value}))}/></F>
            <F label="Period end"><input type="date" value={newPayout.period_end} onChange={e=>setNewPayout(p=>({...p,period_end:e.target.value}))}/></F>
            <F label="Reference # (check/wire/ACH)"><input value={newPayout.reference} onChange={e=>setNewPayout(p=>({...p,reference:e.target.value}))} placeholder="CHK-1042" style={{fontFamily:"var(--mono)"}}/></F>
            <F label="Notes"><input value={newPayout.notes} onChange={e=>setNewPayout(p=>({...p,notes:e.target.value}))}/></F>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn onClick={()=>setPayoutModal(null)} variant="ghost">Cancel</Btn><Btn onClick={recordPayout} variant="success" disabled={!newPayout.amount}>Record payout</Btn></div>
        </div>
      </Card>
    </div>}

    {wrap(<>

    {view==="dashboard"&&<div>
      {ph("Overview","DSP Connect · Managing Partner program")}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        <KPI label="Total partners" value={partners.length} sub={`${activeP.length} active`}/>
        <KPI label="Total active AUM" value={fmtK(totalAUM)}/>
        <KPI label="Monthly comp due" value={fmt$(totalComp)} accent="green"/>
        <KPI label="Total paid out" value={fmt$(totalPaid)} accent="blue"/>
      </div>
      {!partners.length?<Empty icon="users-group" title="No managing partners yet" sub="Create your first partner." cta="Admit first partner →" onCta={()=>setView("admissions")}/>
      :<Card>
        <CardHead title="Partner snapshot"/>
        <THead cols="2fr 1fr 1fr 1fr 1fr 1fr" labels={["Partner","Status","Active clients","AUM","Comp/mo","Paid total"]}/>
        {partners.map((p,i)=>{
          const ac=pipeline.filter(c=>c.partner_id===p.id&&c.stage==="Active");
          const aum=ac.reduce((s,c)=>s+(c.monthly_spend||0),0);
          const paid=payouts.filter(py=>py.partner_id===p.id).reduce((s,py)=>s+(py.amount||0),0);
          return <div key={p.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",padding:"12px 16px",borderBottom:i<partners.length-1?"0.5px solid var(--line)":"none",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}><Avatar name={p.name} size={28}/><div><div style={{fontSize:13,fontWeight:500}}>{p.name}</div><div style={{fontSize:10,color:"var(--text3)"}}>{p.vertical} · Day {daysIn(p.start_date)}</div></div></div>
            <Badge s={p.status}/>
            <span style={{fontFamily:"var(--mono)",fontSize:12}}>{ac.length}</span>
            <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--text2)"}}>{fmtK(aum)}</span>
            <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)"}}>{fmt$(aum*REV_RATE)}</span>
            <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--blue)"}}>{fmt$(paid)}</span>
          </div>;
        })}
      </Card>}
    </div>}

    {view==="admissions"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        {ph("Admissions","Create and manage managing partner accounts")}
        <Btn onClick={()=>setShowAdd(s=>!s)} variant={showAdd?"ghost":"primary"}>{showAdd?"Cancel":"+ Admit new partner"}</Btn>
      </div>
      {showAdd&&<Card style={{marginBottom:18}}>
        <CardHead title="New Managing Partner — Admission Notice" sub="All fields updatable after creation"/>
        <div style={{padding:18}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:14}}>
            <F label="Full legal name *"><input value={form.legal_name} onChange={e=>setForm(f=>({...f,legal_name:e.target.value}))}/></F>
            <F label="Display name *"><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></F>
            <F label="Agency / company"><input value={form.agency} onChange={e=>setForm(f=>({...f,agency:e.target.value}))}/></F>
            <F label="Email *"><input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></F>
            <F label="Portal password *"><input value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/></F>
            <F label="Start date"><input type="date" value={form.start_date} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))}/></F>
            <F label="Vertical"><select value={form.vertical} onChange={e=>setForm(f=>({...f,vertical:e.target.value}))} style={{width:"100%"}}>{VERTICALS.map(v=><option key={v}>{v}</option>)}</select></F>
            <F label="Non-compete (days)"><input type="number" value={form.non_compete_days} onChange={e=>setForm(f=>({...f,non_compete_days:e.target.value}))}/></F>
            <F label="Trailing comp" full><select value={form.trailing_option} onChange={e=>setForm(f=>({...f,trailing_option:e.target.value}))} style={{width:"100%"}}>{TRAILING.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></F>
          </div>
          <div style={{borderTop:"0.5px solid var(--line)",paddingTop:14,marginBottom:11}}>
            <div style={{...S.label,marginBottom:9}}>AUM — enter once spend is active</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
              <F label="Monthly spend ($)"><input type="number" value={form.monthly_spend} onChange={e=>setForm(f=>({...f,monthly_spend:e.target.value}))} placeholder="0"/></F>
              <F label="Annual AUM ($)"><input type="number" value={form.annual_aum} onChange={e=>setForm(f=>({...f,annual_aum:e.target.value}))} placeholder="0"/></F>
              <F label="Day 30 AUM ($)"><input type="number" value={form.day30_aum} onChange={e=>setForm(f=>({...f,day30_aum:e.target.value}))} placeholder="0"/></F>
              <F label="Day 60 AUM ($)"><input type="number" value={form.day60_aum} onChange={e=>setForm(f=>({...f,day60_aum:e.target.value}))} placeholder="0"/></F>
              <F label="Day 90 AUM ($)"><input type="number" value={form.day90_aum} onChange={e=>setForm(f=>({...f,day90_aum:e.target.value}))} placeholder="0"/></F>
            </div>
          </div>
          {formErr&&<div style={{fontSize:12,color:"var(--red)",background:"var(--red-bg)",borderRadius:5,padding:"8px 11px",marginBottom:11}}>{formErr}</div>}
          <div style={{display:"flex",gap:8}}><Btn onClick={addPartner} variant="primary" disabled={saving}>{saving?"Creating…":"Create partner account"}</Btn><Btn onClick={()=>{setShowAdd(false);setForm(blank);setFormErr("");}} variant="ghost">Cancel</Btn></div>
        </div>
      </Card>}
      {partners.filter(p=>p.status==="Pending Setup").length>0&&<div style={{marginBottom:14}}>
        <div style={{...S.label,marginBottom:9}}>Pending setup</div>
        {partners.filter(p=>p.status==="Pending Setup").map(p=><Card key={p.id} style={{marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:11,padding:"12px 16px"}}><Avatar name={p.name}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{p.name}</div><div style={{fontSize:11,color:"var(--text3)"}}>{p.email}</div></div><Badge s={p.status}/>
          <Btn onClick={()=>updatePartner(p.id,{status:"Active"})} variant="success" size="sm">Activate</Btn></div>
        </Card>)}
      </div>}
      {!partners.length&&!showAdd&&<Empty icon="user-plus" title="No partners yet" sub='Click "+ Admit new partner" to begin.'/>}
    </div>}

    {view==="partner-mgmt"&&<div>
      {ph("Partner Management","All partners · clients · AUM · payout history")}
      {!partners.length?<Empty icon="users-group" title="No partners" sub="Add partners from Admissions." cta="Go to admissions" onCta={()=>setView("admissions")}/>
      :partners.map(p=>{
        const open=sel?.id===p.id;
        const eq=calcEquity(p);
        const myC=pipeline.filter(c=>c.partner_id===p.id);
        const myA=myC.filter(c=>c.stage==="Active");
        const myAUM=myA.reduce((s,c)=>s+(c.monthly_spend||0),0);
        const myPay=payouts.filter(py=>py.partner_id===p.id);
        const myPaid=myPay.reduce((s,py)=>s+(py.amount||0),0);
        return <Card key={p.id} style={{marginBottom:10,overflow:"hidden"}}>
          <div onClick={()=>setSel(open?null:p)} style={{display:"flex",alignItems:"center",gap:11,padding:"13px 16px",cursor:"pointer",background:open?"var(--bg3)":"transparent",transition:"background 0.12s"}}>
            <Avatar name={p.name} size={36}/><div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:500}}>{p.name}{p.agency?` · ${p.agency}`:""}</div>
              <div style={{fontSize:11,color:"var(--text3)"}}>{p.email} · {p.vertical} · Day {daysIn(p.start_date)}</div>
            </div>
            <Badge s={p.status}/>
            <span style={S.pill("var(--blue-bg)","var(--blue)")}>{eq.total.toFixed(1)}% equity</span>
            <div style={{textAlign:"right",minWidth:85}}><div style={{fontFamily:"var(--mono)",fontSize:12}}>{fmtK(myAUM)}</div><div style={{fontSize:10,color:"var(--text3)"}}>active AUM</div></div>
            <div style={{textAlign:"right",minWidth:75}}><div style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)"}}>{fmt$(myAUM*REV_RATE)}</div><div style={{fontSize:10,color:"var(--text3)"}}>comp/mo</div></div>
            <i className={`ti ti-chevron-${open?"up":"down"}`} style={{fontSize:13,color:"var(--text3)",marginLeft:4}}/>
          </div>
          {open&&<div style={{padding:16,borderTop:"0.5px solid var(--line)",background:"var(--bg2)"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
              <KPI label="Active clients" value={myA.length} sub={`${myC.length} total`}/>
              <KPI label="Active AUM" value={fmtK(myAUM)}/>
              <KPI label="Monthly comp" value={fmt$(myAUM*REV_RATE)} accent="green"/>
              <KPI label="Total paid" value={fmt$(myPaid)} accent="blue"/>
            </div>
            {myA.length>0&&<><div style={{...S.label,marginBottom:8}}>Active clients</div>
              <Card style={{marginBottom:14}}>
                <THead cols="2fr 1fr 1fr" labels={["Client","Type","Monthly spend"]}/>
                {myA.map((c,i)=><div key={c.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",padding:"9px 16px",borderBottom:i<myA.length-1?"0.5px solid var(--line)":"none",alignItems:"center"}}>
                  <span style={{fontSize:12,fontWeight:500}}>{c.name}</span>
                  <span style={S.pill("var(--blue-bg)","var(--blue)")}>{c.type}</span>
                  <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)"}}>{fmtK(c.monthly_spend||0)}</span>
                </div>)}
              </Card></>}
            <div style={{...S.label,marginBottom:8}}>Update AUM</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
              {[{l:"Monthly spend ($)",f:"monthly_spend"},{l:"Annual AUM ($)",f:"annual_aum"},{l:"Day 30 AUM ($)",f:"day30_aum"},{l:"Day 60 AUM ($)",f:"day60_aum"},{l:"Day 90 AUM ($)",f:"day90_aum"}].map(({l,f})=><div key={f}><label style={{...S.label,display:"block",marginBottom:5}}>{l}</label><input type="number" defaultValue={p[f]||0} onBlur={e=>updatePartner(p.id,{[f]:parseFloat(e.target.value)||0})} style={{fontFamily:"var(--mono)"}}/></div>)}
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <select value={p.status} onChange={e=>updatePartner(p.id,{status:e.target.value})} style={{width:"auto",fontSize:12}}>{["Pending Setup","Onboarding","Active","Inactive"].map(s=><option key={s}>{s}</option>)}</select>
              <Btn onClick={()=>setPayoutModal(p.id)} variant="success">+ Record payout</Btn>
              <Btn onClick={()=>sendSlack("#partner-revenue",`${p.name}: ${fmtK(myAUM)} AUM · ${fmt$(myAUM*REV_RATE)} comp/mo · ${myA.length} active`)} variant="ghost">Notify Slack</Btn>
            </div>
            {myPay.length>0&&<div style={{marginTop:14}}>
              <div style={{...S.label,marginBottom:8}}>Payout history</div>
              <Card><THead cols="1fr 1fr 1fr 1fr" labels={["Date","Period","Amount","Ref"]}/>
                {myPay.map((py,i)=><div key={py.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",padding:"9px 16px",borderBottom:i<myPay.length-1?"0.5px solid var(--line)":"none",fontSize:12,alignItems:"center"}}>
                  <span style={{color:"var(--text3)"}}>{fmtDate(py.created_at)}</span>
                  <span>{py.period_label||"—"}</span>
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
      {ph(view==="admin-brands"?"Brand Clients":"Agency Clients","Across all partners")}
      {!pipeline.filter(c=>c.type===(view==="admin-brands"?"brand":"agency")).length?<Empty icon="building-skyscraper" title="No clients yet" sub="Partners add clients from their dashboard."/>
      :<Card>
        <THead cols="2fr 1fr 1fr 1fr 1fr 1fr" labels={["Name","Contact","Spend","Stage","Partner","Added"]}/>
        {pipeline.filter(c=>c.type===(view==="admin-brands"?"brand":"agency")).map((c,i,arr)=><div key={c.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",padding:"11px 16px",borderBottom:i<arr.length-1?"0.5px solid var(--line)":"none",alignItems:"center"}}>
          <div><div style={{fontSize:13,fontWeight:500}}>{c.name}</div>{c.notes&&<div style={{fontSize:10,color:"var(--text3)"}}>{c.notes}</div>}</div>
          <div style={{fontSize:11,color:"var(--text3)"}}>{c.contact_name||"—"}</div>
          <div style={{fontFamily:"var(--mono)",fontSize:12,color:c.stage==="Active"?"var(--green)":"var(--text)"}}>{fmtK(c.monthly_spend||0)}</div>
          <select value={c.stage} onChange={e=>moveStage(c.id,e.target.value)} style={{fontSize:11,padding:"3px 6px",width:"auto"}}>{STAGES.map(s=><option key={s}>{s}</option>)}</select>
          <div style={{fontSize:11,color:"var(--text3)"}}>{c.partner_name}</div>
          <div style={{fontSize:11,color:"var(--text3)"}}>{(c.created_at||"").slice(0,10)}</div>
        </div>)}
        <div style={{padding:"9px 16px",background:"var(--bg2)",borderTop:"0.5px solid var(--line)",display:"flex",justifyContent:"space-between"}}>
          <span style={S.label}>Total active AUM</span>
          <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)",fontWeight:500}}>{fmtK(pipeline.filter(c=>c.type===(view==="admin-brands"?"brand":"agency")&&c.stage==="Active").reduce((s,c)=>s+(c.monthly_spend||0),0))}/mo</span>
        </div>
      </Card>}
    </div>}

    {view==="approvals"&&<div>
      {ph("Client Approvals","Campaign briefs awaiting review")}
      {!pending.length?<Empty icon="circle-check" title="No pending approvals" sub="Client submissions in Review will appear here."/>
      :pending.map(c=>{
        const cb=briefs.find(b=>b.pipeline_id===c.id);
        const isExp=expandedBrief===c.id;
        return <Card key={c.id} style={{marginBottom:10,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:11,padding:"13px 16px"}}>
            <span style={S.pill("var(--blue-bg)","var(--blue)")}>{c.type}</span>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{c.name}</div>
              <div style={{fontSize:11,color:"var(--text3)"}}>Partner: {c.partner_name} · {c.contact_name||""} · <span style={{fontFamily:"var(--mono)"}}>{fmtK(c.monthly_spend||0)}/mo</span></div>
              {cb&&<div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{[cb.campaign_type,cb.creative_type,cb.geo,cb.budget_total?`Budget: ${fmt$(cb.budget_total)}`:""].filter(Boolean).join(" · ")}</div>}
            </div>
            {cb&&<Btn onClick={()=>setExpandedBrief(isExp?null:c.id)} variant="ghost" size="sm">{isExp?"Hide brief ↑":"View brief ↓"}</Btn>}
            <Btn onClick={()=>{moveStage(c.id,"Approved");sendSlack("#partner-updates",`✅ Approved: ${c.name} · Partner: ${c.partner_name}`);}} variant="success" size="sm">Approve</Btn>
            <Btn onClick={()=>moveStage(c.id,"Lead")} variant="danger" size="sm">Reject</Btn>
          </div>
          {isExp&&cb&&<div style={{padding:"14px 16px",borderTop:"0.5px solid var(--line)",background:"var(--bg2)"}}>
            <div style={{...S.label,marginBottom:10}}>Campaign brief · {fmtDate(cb.created_at)}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {[["Campaign type",cb.campaign_type],["Goals",cb.goals],["KPIs",cb.kpis],["Creative type",cb.creative_type],["Traffic type",cb.traffic_type],["Device type",cb.device_type],["GEO",cb.geo],["Frequency cap",cb.frequency_cap],["Budget",cb.budget_total?fmt$(cb.budget_total):""],["Start date",cb.start_date],["End date",cb.end_date],["Targeting",cb.targeting],["1st party data",cb.first_party_data],["Creative link",cb.creative_file_link],["Tracking tags",cb.tracking_tags],["Notes",cb.notes]].filter(([,v])=>v).map(([k,v])=><div key={k} style={{padding:"8px 10px",background:"var(--bg)",borderRadius:5,border:"0.5px solid var(--line)"}}>
                <div style={S.label}>{k}</div><div style={{fontSize:12,marginTop:3,wordBreak:"break-word"}}>{v}</div>
              </div>)}
            </div>
          </div>}
        </Card>;
      })}
    </div>}

    {view==="comp-tracking"&&<div>
      {ph("Compensation","Active client ad spend · 10% revenue share")}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        <KPI label="Total active AUM" value={fmtK(totalAUM)}/>
        <KPI label="Monthly comp due" value={fmt$(totalComp)} accent="green"/>
        <KPI label="Total paid out" value={fmt$(totalPaid)} accent="blue"/>
        <KPI label="Active partners" value={activeP.length}/>
      </div>
      {partners.map(p=>{
        const myA=pipeline.filter(c=>c.partner_id===p.id&&c.stage==="Active");
        const myAUM=myA.reduce((s,c)=>s+(c.monthly_spend||0),0);
        const myPaid=payouts.filter(py=>py.partner_id===p.id).reduce((s,py)=>s+(py.amount||0),0);
        return <Card key={p.id} style={{marginBottom:10,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:"0.5px solid var(--line)",display:"flex",alignItems:"center",gap:11}}>
            <Avatar name={p.name} size={32}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{p.name}</div><div style={{fontSize:10,color:"var(--text3)"}}>{p.vertical} · {myA.length} active clients</div></div>
            <Badge s={p.status}/>
            <Btn onClick={()=>setPayoutModal(p.id)} variant="success" size="sm">+ Record payout</Btn>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)"}}>
            {[{l:"Active clients",v:myA.length},{l:"AUM/mo",v:fmtK(myAUM)},{l:"Annual AUM",v:fmtK(myAUM*12)},{l:"Comp (10%)",v:fmt$(myAUM*REV_RATE),g:true},{l:"Total paid",v:fmt$(myPaid),b:true}].map((item,i)=><div key={item.l} style={{padding:"10px 16px",borderRight:i<4?"0.5px solid var(--line)":"none"}}>
              <div style={S.label}>{item.l}</div>
              <div style={{marginTop:5,fontFamily:"var(--mono)",fontSize:13,fontWeight:500,color:item.b?"var(--blue)":item.g?"var(--green)":"var(--text)"}}>{item.v}</div>
            </div>)}
          </div>
        </Card>;
      })}
    </div>}

    {view==="payouts"&&<div>
      {ph("Payout Records","Record and track all partner disbursements")}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        <KPI label="Total paid (all time)" value={fmt$(totalPaid)} accent="blue"/>
        <KPI label="Paid this month" value={fmt$(payouts.filter(p=>{const d=new Date(p.created_at);const n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();}).reduce((s,p)=>s+(p.amount||0),0))} accent="green"/>
        <KPI label="Total records" value={payouts.length}/>
      </div>
      <Card style={{marginBottom:14}}>
        <CardHead title="Record a payout" sub="Click a partner to log a payment — enter amount, period, and reference number"/>
        <div style={{padding:14,display:"flex",flexWrap:"wrap",gap:8}}>
          {!partners.filter(p=>p.status==="Active").length
            ?<div style={{fontSize:12,color:"var(--text3)",padding:4}}>No active partners yet.</div>
            :partners.filter(p=>p.status==="Active").map(p=>{
              const myA=pipeline.filter(c=>c.partner_id===p.id&&c.stage==="Active");
              const myAUM=myA.reduce((s,c)=>s+(c.monthly_spend||0),0);
              return <div key={p.id} onClick={()=>setPayoutModal(p.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"var(--bg2)",borderRadius:7,border:"0.5px solid var(--line2)",cursor:"pointer",minWidth:180}} onMouseEnter={e=>{e.currentTarget.style.background="var(--blue-bg)";e.currentTarget.style.borderColor="rgba(26,20,212,0.2)";}} onMouseLeave={e=>{e.currentTarget.style.background="var(--bg2)";e.currentTarget.style.borderColor="var(--line2)";}}>
                <Avatar name={p.name} size={28}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:500}}>{p.name}</div>
                  <div style={{fontSize:10,color:"var(--text3)"}}>Comp due: <span style={{color:"var(--green)",fontFamily:"var(--mono)",fontWeight:500}}>{fmt$(myAUM*REV_RATE)}/mo</span></div>
                </div>
                <i className="ti ti-chevron-right" style={{fontSize:13,color:"var(--blue)",flexShrink:0}}/>
              </div>;
            })}
        </div>
      </Card>
      {!payouts.length?<Empty icon="cash" title="No payouts recorded yet" sub="Click a partner above to record their first payout."/>
      :<Card>
        <THead cols="1fr 1fr 1fr 1fr 1fr 1fr" labels={["Date","Partner","Period","Amount","Reference","Notes"]}/>
        {payouts.map((p,i,arr)=><div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr 1fr",padding:"11px 16px",borderBottom:i<arr.length-1?"0.5px solid var(--line)":"none",alignItems:"center"}}>
          <span style={{fontSize:11,color:"var(--text3)"}}>{fmtDate(p.created_at)}</span>
          <span style={{fontSize:12,fontWeight:500}}>{p.partner_name}</span>
          <span style={{fontSize:12}}>{p.period_label||"—"}</span>
          <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)",fontWeight:500}}>{fmt$(p.amount)}</span>
          <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--text3)"}}>{p.reference||"—"}</span>
          <span style={{fontSize:11,color:"var(--text3)"}}>{p.notes||"—"}</span>
        </div>)}
        <div style={{padding:"9px 16px",background:"var(--bg2)",borderTop:"0.5px solid var(--line)",display:"flex",justifyContent:"space-between"}}>
          <span style={S.label}>Grand total</span>
          <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)",fontWeight:500}}>{fmt$(totalPaid)}</span>
        </div>
      </Card>}
    </div>}

    {view==="content-mgmt"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        {ph("Resources","Training, SOPs, documents · paste any YouTube, Vimeo, PDF, or link URL")}
        <Btn onClick={()=>setShowAddRes(s=>!s)} variant={showAddRes?"ghost":"primary"}>{showAddRes?"Cancel":"+ Add resource"}</Btn>
      </div>
      {showAddRes&&<Card style={{marginBottom:14}}>
        <CardHead title="New resource" sub="YouTube and Vimeo URLs embed automatically"/>
        <div style={{padding:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:11}}>
            <F label="Title *"><input value={newResource.title} onChange={e=>setNewResource(r=>({...r,title:e.target.value}))}/></F>
            <F label="Category"><select value={newResource.category} onChange={e=>setNewResource(r=>({...r,category:e.target.value}))} style={{width:"100%"}}>{["training","sops","documents"].map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}</select></F>
            <F label="URL" full><input value={newResource.url} onChange={e=>setNewResource(r=>({...r,url:e.target.value}))} placeholder="https://…"/></F>
            <F label="Description"><input value={newResource.description} onChange={e=>setNewResource(r=>({...r,description:e.target.value}))}/></F>
            <F label="Type"><select value={newResource.type} onChange={e=>setNewResource(r=>({...r,type:e.target.value}))} style={{width:"100%"}}>{["video","pdf","article","pptx","docx"].map(t=><option key={t}>{t}</option>)}</select></F>
          </div>
          {newResource.url&&<div style={{marginBottom:11,padding:"9px 12px",background:"var(--bg2)",borderRadius:5,fontSize:11,color:"var(--text3)"}}>Detected: <span style={{color:"var(--blue)",fontWeight:500}}>{detectType(newResource.url,newResource.type).toUpperCase()}</span></div>}
          <div style={{display:"flex",gap:8}}><Btn onClick={addResource} variant="primary">Add resource</Btn><Btn onClick={()=>setShowAddRes(false)} variant="ghost">Cancel</Btn></div>
        </div>
      </Card>}
      {["training","sops","documents"].map(cat=><div key={cat} style={{marginBottom:20}}>
        <div style={{...S.label,marginBottom:9,display:"flex",gap:6}}><span style={{textTransform:"capitalize"}}>{cat}</span><span style={{fontFamily:"var(--mono)"}}>{resources.filter(r=>r.category===cat).length}</span></div>
        {!resources.filter(r=>r.category===cat).length?<div style={{fontSize:12,color:"var(--text3)"}}>None yet.</div>
        :<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {resources.filter(r=>r.category===cat).map(r=>{
            const ytId=getYTId(r.url||"");const type=detectType(r.url||"",r.type);
            return <div key={r.id} style={{...S.card,overflow:"hidden"}}>
              {ytId?<div style={{position:"relative",paddingBottom:"40%",background:"#000",overflow:"hidden"}}>
                <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.7}}/>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:36,height:36,background:"rgba(255,0,0,0.85)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}><i className="ti ti-player-play-filled" style={{fontSize:14,color:"#fff",marginLeft:2}}/></div></div>
              </div>:<div style={{height:60,background:"var(--bg2)",display:"flex",alignItems:"center",justifyContent:"center",borderBottom:"0.5px solid var(--line)"}}><i className={`ti ti-${type==="pdf"?"file-type-pdf":"external-link"}`} style={{fontSize:22,color:"var(--blue)"}}/></div>}
              <div style={{padding:"10px 12px"}}>
                <div style={{fontSize:12,fontWeight:500,marginBottom:3}}>{r.title}</div>
                {r.description&&<div style={{fontSize:11,color:"var(--text3)",marginBottom:5}}>{r.description}</div>}
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={S.pill("var(--blue-bg)","var(--blue)")}>{type==="youtube"?"YouTube":type.toUpperCase()}</span>
                  <button onClick={()=>delResource(r.id)} style={{fontSize:10,color:"var(--red)",background:"none",border:"none",cursor:"pointer",fontFamily:"var(--font)",marginLeft:"auto"}}>Delete</button>
                </div>
              </div>
            </div>;
          })}
        </div>}
      </div>)}
    </div>}

    {view==="announcements"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        {ph("Announcements","Posts visible on all partner dashboards")}
        <Btn onClick={()=>setShowAddAnn(s=>!s)} variant={showAddAnn?"ghost":"primary"}>{showAddAnn?"Cancel":"+ Post announcement"}</Btn>
      </div>
      {showAddAnn&&<Card style={{marginBottom:14}}>
        <CardHead title="New announcement"/>
        <div style={{padding:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <F label="Title *"><input value={newAnn.title} onChange={e=>setNewAnn(a=>({...a,title:e.target.value}))}/></F>
            <F label="Type"><select value={newAnn.type} onChange={e=>setNewAnn(a=>({...a,type:e.target.value}))} style={{width:"100%"}}>{["info","warning","success"].map(t=><option key={t}>{t}</option>)}</select></F>
            <F label="Body *" full><textarea value={newAnn.body} onChange={e=>setNewAnn(a=>({...a,body:e.target.value}))} rows={3} style={{resize:"vertical"}}/></F>
          </div>
          <div style={{display:"flex",gap:8}}><Btn onClick={addAnn} variant="primary">Post</Btn><Btn onClick={()=>setShowAddAnn(false)} variant="ghost">Cancel</Btn></div>
        </div>
      </Card>}
      {!announcements.length?<Empty icon="speakerphone" title="No announcements" sub="Posts appear on all partner dashboards immediately."/>
      :announcements.map(a=><Card key={a.id} style={{marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:11,padding:"12px 16px"}}>
          <span style={S.pill(a.type==="warning"?"var(--amber-bg)":a.type==="success"?"var(--green-bg)":"var(--blue-bg)",a.type==="warning"?"var(--amber)":a.type==="success"?"var(--green)":"var(--blue)")}>{a.type}</span>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{a.title}</div><div style={{fontSize:12,color:"var(--text3)",marginTop:1}}>{a.body}</div></div>
          <span style={S.pill(a.active?"var(--green-bg)":"var(--bg3)",a.active?"var(--green)":"var(--text3)")}>{a.active?"Live":"Hidden"}</span>
          <Btn onClick={()=>toggleAnn(a.id,!a.active)} variant="ghost" size="sm">{a.active?"Hide":"Show"}</Btn>
          <Btn onClick={()=>delAnn(a.id)} variant="danger" size="sm">Delete</Btn>
        </div>
      </Card>)}
    </div>}

    {view==="slack"&&<div>
      {ph("Slack","Open tickets and notification log")}
      {openT.length>0&&<Card style={{marginBottom:14}}>
        <CardHead title={`Open tickets (${openT.length})`} sub="Reply to close"/>
        {openT.map((t,i,arr)=><div key={t.id} style={{padding:"12px 16px",borderBottom:i<arr.length-1?"0.5px solid var(--line)":"none"}}>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:7}}>
            <span style={S.pill("var(--blue-bg)","var(--blue)")}>{t.type}</span>
            <span style={{fontSize:13,fontWeight:500,flex:1}}>{t.subject}</span>
            <span style={{fontSize:11,color:"var(--text3)"}}>{t.partner_name}</span>
          </div>
          {t.details&&<div style={{fontSize:12,color:"var(--text3)",marginBottom:8}}>{t.details}</div>}
          <div style={{display:"flex",gap:8}}>
            <input value={ticketReply[t.id]||""} onChange={e=>setTicketReply(r=>({...r,[t.id]:e.target.value}))} placeholder="Reply and close…" style={{flex:1,fontSize:12}}/>
            <Btn onClick={()=>replyTicket(t.id)} variant="success" size="sm">Reply & close</Btn>
          </div>
        </div>)}
      </Card>}
      <Card>
        <CardHead title="Notification log"/>
        <div style={{padding:14}}>
          <div style={{background:"var(--bg2)",border:"0.5px solid var(--line)",borderRadius:5,padding:10,maxHeight:200,overflowY:"auto",marginBottom:11,display:"flex",flexDirection:"column",gap:5}}>
            {!slackMsgs.length?<div style={{fontSize:12,color:"var(--text3)",textAlign:"center",padding:"16px 0"}}>No notifications this session.</div>
            :slackMsgs.map((m,i)=><div key={i} style={{padding:"7px 9px",background:"var(--bg)",borderRadius:4,border:"0.5px solid var(--line)"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--blue)",fontWeight:500}}>{m.channel}</span><span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--text3)"}}>{m.time}</span></div>
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

    </>)}
  </div>;
}

// ── ROOT ─────────────────────────────────────────────────────────────────────
export default function App(){
  const[session,setSession]=useState(null);
  const login=async s=>{
    if(s.role==="partner"){const{data}=await supabase.from("partners").select("*").eq("id",s.partner.id).single();setSession({...s,partner:data||s.partner});}
    else setSession(s);
  };
  const completeOnboarding=async()=>{
    await supabase.from("partners").update({onboarded:true,status:"Active"}).eq("id",session.partner.id);
    sendOnboardingCompleteEmail(session.partner);
    setSession(s=>({...s,partner:{...s.partner,onboarded:true,status:"Active"}}));
  };
  if(!session)return <Login onLogin={login}/>;
  if(session.role==="admin")return <AdminApp onLogout={()=>setSession(null)}/>;
  if(!session.partner.onboarded)return <Onboarding partner={session.partner} onComplete={completeOnboarding}/>;
  return <PartnerApp partner={session.partner} onLogout={()=>setSession(null)}/>;
}
