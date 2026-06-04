import { useState, useEffect } from "react";
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

const C = {
  bg:"#ffffff", bg2:"#f1efe8", bg3:"#e8e6de",
  text:"#1a1a18", muted:"#5f5e5a", border:"rgba(0,0,0,0.12)", border2:"rgba(0,0,0,0.22)",
  blue:"#185FA5", blueBg:"#E6F1FB",
  green:"#3B6D11", greenBg:"#EAF3DE",
  amber:"#854F0B", amberBg:"#FAEEDA",
  purple:"#3C3489", purpleBg:"#EEEDFE",
  red:"#A32D2D", redBg:"#FCEBEB",
  teal:"#0F6E56", tealBg:"#E1F5EE",
};

const fmt$ = n => "$"+Math.round(n||0).toLocaleString();
const fmtK = n => (n||0)>=1000000?"$"+((n||0)/1000000).toFixed(2)+"M":(n||0)>=1000?"$"+Math.round((n||0)/1000)+"k":"$"+Math.round(n||0);
const today = () => new Date().toISOString().slice(0,10);
const daysIn = d => Math.max(0,Math.floor((Date.now()-new Date(d))/86400000));
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—";

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
  let s=0;
  const aum=p.monthly_spend||0;
  if(aum>0)s+=20; if(aum>=100000)s+=15; if(aum>=250000)s+=15;
  const myPipe=pipeline.filter(c=>c.partner_id===p.id);
  s+=Math.min(myPipe.length*5,20);
  s+=Math.min(myPipe.filter(c=>c.stage==="Active").length*5,20);
  return Math.min(s,100);
}

// ── UI PRIMITIVES ─────────────────────────────────────────────────────────
function Avatar({name,size=36}){
  const i=(name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const p=["#E6F1FB|#185FA5","#EAF3DE|#3B6D11","#EEEDFE|#3C3489","#FAEEDA|#854F0B","#FAECE7|#993C1D","#E1F5EE|#0F6E56"];
  const[bg,fg]=p[(name||"?").charCodeAt(0)%p.length].split("|");
  return <div style={{width:size,height:size,borderRadius:"50%",background:bg,color:fg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.34,fontWeight:500,flexShrink:0}}>{i}</div>;
}
function Pill({label,bg,fg}){return <span style={{fontSize:11,fontWeight:500,padding:"3px 10px",borderRadius:20,background:bg,color:fg,whiteSpace:"nowrap"}}>{label}</span>;}
function StatusPill({s}){
  const m={Active:[C.greenBg,C.green],Onboarding:[C.amberBg,C.amber],Inactive:[C.redBg,C.red],"Pending Setup":[C.bg2,C.muted],Lead:["#F1EFE8","#444441"],"Deposit Paid":[C.amberBg,C.amber],Review:[C.blueBg,C.blue],Approved:[C.tealBg,C.teal],Paid:[C.greenBg,C.green],Pending:[C.amberBg,C.amber]};
  const[bg,fg]=m[s]||[C.bg2,C.muted];return <Pill label={s} bg={bg} fg={fg}/>;
}
function StatBox({label,value,sub,icon,green,blue,amber}){
  return <div style={{background:C.bg2,borderRadius:10,padding:"14px 16px"}}>
    <div style={{fontSize:12,color:C.muted,display:"flex",alignItems:"center",gap:5,marginBottom:6}}><i className={`ti ti-${icon}`} style={{fontSize:14}}/>{label}</div>
    <div style={{fontSize:22,fontWeight:500,color:green?C.green:blue?C.blue:amber?C.amber:C.text}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>{sub}</div>}
  </div>;
}
function Card({children,style={}}){return <div style={{background:C.bg,border:`0.5px solid ${C.border}`,borderRadius:12,...style}}>{children}</div>;}
function ProgressBar({pct,color=C.blue}){return <div style={{height:6,background:C.bg2,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(pct||0,100)}%`,background:color,borderRadius:3}}/></div>;}
function SectionHead({title,sub,action}){return <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}><div><h2 style={{margin:"0 0 3px",fontSize:18,fontWeight:500}}>{title}</h2>{sub&&<div style={{fontSize:12,color:C.muted}}>{sub}</div>}</div>{action}</div>;}
function EmptyState({icon,title,sub,cta,onCta}){return <Card style={{padding:48,textAlign:"center"}}><i className={`ti ti-${icon}`} style={{fontSize:36,color:C.muted,display:"block",marginBottom:14}}/><div style={{fontSize:15,fontWeight:500,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.muted,marginBottom:cta?16:0}}>{sub}</div>{cta&&<button onClick={onCta} style={{fontSize:13,padding:"8px 20px",background:C.blue,color:"#fff",border:"none",borderRadius:8,cursor:"pointer"}}>{cta}</button>}</Card>;}
function Spinner(){return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40,color:C.muted,fontSize:13}}><i className="ti ti-loader" style={{fontSize:20,marginRight:8,animation:"spin 1s linear infinite"}}/>Loading…<style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;}
function Btn({onClick,children,color,disabled,small}){return <button onClick={onClick} disabled={disabled} style={{fontSize:small?11:13,padding:small?"4px 10px":"7px 14px",background:color||C.bg,color:color===C.blue||color===C.green||color===C.red?"#fff":C.text,border:color?`none`:`0.5px solid ${C.border2}`,borderRadius:8,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1}}>{children}</button>;}

// ── NAV ───────────────────────────────────────────────────────────────────
const PARTNER_NAV=[
  {section:"HOME",items:[{key:"dashboard",icon:"layout-dashboard",label:"Dashboard"}]},
  {section:"GROWTH",items:[{key:"brand-clients",icon:"building",label:"Brand clients"},{key:"agency-clients",icon:"briefcase",label:"Agency clients"},{key:"pipeline",icon:"chart-arrows-vertical",label:"Pipeline"}]},
  {section:"OWNERSHIP",items:[{key:"compensation",icon:"currency-dollar",label:"Compensation"},{key:"equity",icon:"chart-pie",label:"Equity"}]},
  {section:"RESOURCES",items:[{key:"training",icon:"school",label:"Training"},{key:"sops",icon:"list-check",label:"SOPs"},{key:"documents",icon:"file-text",label:"Documents"}]},
  {section:"SUPPORT",items:[{key:"support",icon:"help-circle",label:"Help desk"}]},
];
const ADMIN_NAV=[
  {section:"HOME",items:[{key:"dashboard",icon:"layout-dashboard",label:"Overview"}]},
  {section:"PARTNERS",items:[{key:"admissions",icon:"user-plus",label:"Admissions"},{key:"partner-mgmt",icon:"users",label:"Partner management"}]},
  {section:"CLIENTS",items:[{key:"admin-brands",icon:"building",label:"Brand clients"},{key:"admin-agencies",icon:"briefcase",label:"Agency clients"},{key:"approvals",icon:"check-circle",label:"Client approvals"}]},
  {section:"FINANCE",items:[{key:"comp-tracking",icon:"currency-dollar",label:"Compensation"},{key:"payouts",icon:"cash",label:"Payout records"}]},
  {section:"CONTENT",items:[{key:"content-mgmt",icon:"upload",label:"Content management"},{key:"announcements",icon:"bell",label:"Announcements"}]},
  {section:"COMMS",items:[{key:"slack",icon:"brand-slack",label:"Slack"}]},
];

function NavSidebar({navGroups,active,onSelect,header,footer}){
  return <div style={{width:196,background:C.bg,borderRight:`0.5px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto"}}>
    <div style={{padding:"16px 14px 12px",borderBottom:`0.5px solid ${C.border}`}}>{header}</div>
    <div style={{flex:1,padding:"8px 0"}}>
      {navGroups.map(g=><div key={g.section}>
        <div style={{fontSize:10,fontWeight:500,color:C.muted,padding:"10px 14px 4px",letterSpacing:"0.5px"}}>{g.section}</div>
        {g.items.map(n=><button key={n.key} onClick={()=>onSelect(n.key)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 14px",width:"100%",border:"none",background:active===n.key?C.bg2:"transparent",color:active===n.key?C.text:C.muted,cursor:"pointer",fontSize:13,fontWeight:active===n.key?500:400,textAlign:"left"}}>
          <i className={`ti ti-${n.icon}`} style={{fontSize:15}}/>{n.label}
          {n.badge?<span style={{marginLeft:"auto",background:C.blue,color:"#fff",fontSize:10,borderRadius:10,padding:"1px 6px"}}>{n.badge}</span>:null}
        </button>)}
      </div>)}
    </div>
    {footer&&<div style={{padding:"12px 14px",borderTop:`0.5px solid ${C.border}`}}>{footer}</div>}
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
    if(error||!data){setErr("Invalid email or password.");return;}
    onLogin({role:"partner",partner:data});
  };
  return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg3}}>
    <div style={{width:400,background:C.bg,border:`0.5px solid ${C.border}`,borderRadius:16,padding:36}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontSize:22,fontWeight:500}}>DSP Connect</div>
        <div style={{fontSize:13,color:C.muted,marginTop:4}}>Managing Partner Portal · getdspconnect.com</div>
      </div>
      <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5}}>Email address</label>
      <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} placeholder="you@agency.com" style={{width:"100%",boxSizing:"border-box",marginBottom:14}}/>
      <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5}}>Password</label>
      <input value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} type="password" placeholder="••••••••" style={{width:"100%",boxSizing:"border-box",marginBottom:20}}/>
      {err&&<div style={{fontSize:12,color:C.red,background:C.redBg,borderRadius:8,padding:"8px 12px",marginBottom:14}}>{err}</div>}
      <button onClick={attempt} disabled={loading} style={{width:"100%",padding:10,fontSize:14,fontWeight:500,background:C.blue,color:"#fff",border:"none",borderRadius:8,cursor:"pointer"}}>{loading?"Signing in…":"Sign in"}</button>
      <div style={{marginTop:20,padding:14,background:C.bg2,borderRadius:10,fontSize:12,color:C.muted}}>
        <div style={{fontWeight:500,color:C.text,marginBottom:4}}>Admin: {ADMIN_EMAIL}</div>
        Partner logins are created by admin and shared directly.
      </div>
    </div>
  </div>;
}

// ── ONBOARDING ────────────────────────────────────────────────────────────
function Onboarding({partner,onComplete}){
  const[step,setStep]=useState(0);const[sig,setSig]=useState("");
  const[checks,setChecks]=useState({comp:false,equity:false,ops:false,noncompete:false,sig:false});
  const steps=[
    {title:"Cash compensation policy",icon:"currency-dollar",content:<div style={{fontSize:13,lineHeight:1.7}}>
      <div style={{fontWeight:500,fontSize:15,marginBottom:12}}>Managing Partner Cash Compensation Policy</div>
      {[["Rate","10% of Qualified Ad Spend Under Management (AUM)"],["Payment schedule","Monthly, after advertiser funds collected by DSP Connect"],["Qualifying spend","Contracted, activated, invoiced, and collected"],["Non-qualifying","Unpaid invoices, chargebacks, refunds, disputes, write-offs"],["No guarantee","Compensation is production-based only — no salary minimum"]].map(([k,v])=><div key={k} style={{display:"flex",gap:14,padding:"7px 0",borderBottom:`0.5px solid ${C.border}`}}><span style={{color:C.muted,minWidth:160,flexShrink:0}}>{k}</span><span>{v}</span></div>)}
      <label style={{display:"flex",alignItems:"center",gap:10,marginTop:16,cursor:"pointer"}}><input type="checkbox" checked={checks.comp} onChange={e=>setChecks(c=>({...c,comp:e.target.checked}))} style={{width:16,height:16,flexShrink:0}}/>I have read and understood the Cash Compensation Policy (Exhibit B)</label>
    </div>},
    {title:"Equity vesting policy",icon:"chart-pie",content:<div style={{fontSize:13,lineHeight:1.7}}>
      <div style={{fontWeight:500,fontSize:15,marginBottom:12}}>Equity Vesting, Performance & Acceleration Policy</div>
      {[["Equity pool","40% of total LLC membership interests"],["Base grant","5.00% upon qualifying"],["Annual minimum","$5,000,000 AUM in first 12 months"],["Vesting cliff","1 year — no partial vesting before anniversary"],["Max first year","15.00% (5% base + 10% acceleration)"]].map(([k,v])=><div key={k} style={{display:"flex",gap:14,padding:"7px 0",borderBottom:`0.5px solid ${C.border}`}}><span style={{color:C.muted,minWidth:160,flexShrink:0}}>{k}</span><span>{v}</span></div>)}
      <div style={{marginTop:12,padding:"10px 12px",background:C.amberBg,borderRadius:8,color:C.amber,fontSize:12}}>Missed acceleration windows are permanently forfeited — they do not carry forward.</div>
      <label style={{display:"flex",alignItems:"center",gap:10,marginTop:14,cursor:"pointer"}}><input type="checkbox" checked={checks.equity} onChange={e=>setChecks(c=>({...c,equity:e.target.checked}))} style={{width:16,height:16,flexShrink:0}}/>I have read and understood the Equity Vesting Policy (Exhibit A)</label>
    </div>},
    {title:"Operating rules",icon:"list-check",content:<div style={{fontSize:13,lineHeight:1.7}}>
      <div style={{fontWeight:500,fontSize:15,marginBottom:12}}>Operating Rules & Required Acknowledgements</div>
      {[["Non-compete",`${partner.non_compete_days||90} days post-termination`],["Trailing comp",TRAILING_OPTIONS.find(o=>o.value===(partner.trailing_option||"A"))?.label],["Account ownership","DSP Connect owns all advertiser accounts"],["IP","All platform materials remain property of DSP Connect"]].map(([k,v])=><div key={k} style={{display:"flex",gap:14,padding:"7px 0",borderBottom:`0.5px solid ${C.border}`}}><span style={{color:C.muted,minWidth:160,flexShrink:0}}>{k}</span><span>{v}</span></div>)}
      <label style={{display:"flex",alignItems:"center",gap:10,marginTop:14,cursor:"pointer"}}><input type="checkbox" checked={checks.ops} onChange={e=>setChecks(c=>({...c,ops:e.target.checked}))} style={{width:16,height:16,flexShrink:0}}/>I acknowledge and agree to the operating rules above</label>
      <label style={{display:"flex",alignItems:"center",gap:10,marginTop:10,cursor:"pointer"}}><input type="checkbox" checked={checks.noncompete} onChange={e=>setChecks(c=>({...c,noncompete:e.target.checked}))} style={{width:16,height:16,flexShrink:0}}/>I acknowledge the non-compete and trailing compensation terms</label>
    </div>},
    {title:"Digital signature",icon:"pencil",content:<div style={{fontSize:13,lineHeight:1.7}}>
      <div style={{fontWeight:500,fontSize:15,marginBottom:12}}>Admission confirmation & digital signature</div>
      {[["Full legal name",partner.legal_name||partner.name],["Email",partner.email],["Vertical",partner.vertical],["Start date",partner.start_date],["LLC entity","DSP Connect Holdings (Influence Crafters, LLC)"],["Max first-year equity","15.00%"]].map(([k,v])=><div key={k} style={{display:"flex",gap:14,padding:"7px 0",borderBottom:`0.5px solid ${C.border}`}}><span style={{color:C.muted,minWidth:160,flexShrink:0}}>{k}</span><span style={{fontWeight:500}}>{v}</span></div>)}
      <div style={{marginTop:16,marginBottom:6,fontWeight:500}}>Type your full legal name to sign</div>
      <input value={sig} onChange={e=>{setSig(e.target.value);setChecks(c=>({...c,sig:e.target.value.trim().length>4}));}} placeholder={partner.legal_name||partner.name} style={{width:"100%",boxSizing:"border-box",fontStyle:"italic"}}/>
      <div style={{marginTop:12,padding:"10px 12px",background:C.greenBg,borderRadius:8,color:C.green,fontSize:12}}>✓ Exhibits A & B acknowledged · Signed {today()}</div>
    </div>},
  ];
  const s=steps[step];
  const canAdvance=step===0?checks.comp:step===1?checks.equity:step===2?(checks.ops&&checks.noncompete):checks.sig;
  const complete=async()=>{
    await supabase.from("signatures").insert([{
      partner_id:partner.id,partner_name:partner.name,legal_name:sig,
      exhibit_a:true,exhibit_b:true,operating_rules:true,non_compete:true,
      policy_version:"v1.0",signed_at:new Date().toISOString()
    }]);
    onComplete();
  };
  return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg3,padding:24}}>
    <div style={{width:"100%",maxWidth:640}}>
      <div style={{textAlign:"center",marginBottom:20}}><div style={{fontSize:18,fontWeight:500}}>Welcome, {(partner.name||"").split(" ")[0]}</div><div style={{fontSize:13,color:C.muted,marginTop:4}}>Complete onboarding to access your dashboard</div></div>
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:6,marginBottom:20}}>
        {steps.map((_,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:500,background:i<step?C.greenBg:i===step?C.blueBg:C.bg2,color:i<step?C.green:i===step?C.blue:C.muted,border:`0.5px solid ${i===step?C.blue:C.border}`}}>
            {i<step?<i className="ti ti-check" style={{fontSize:12}}/>:i+1}
          </div>
          {i<steps.length-1&&<div style={{width:28,height:1,background:i<step?C.green:C.border}}/>}
        </div>)}
      </div>
      <Card style={{padding:24,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,paddingBottom:14,borderBottom:`0.5px solid ${C.border}`}}>
          <i className={`ti ti-${s.icon}`} style={{fontSize:20,color:C.blue}}/><span style={{fontWeight:500,fontSize:15}}>{s.title}</span><span style={{marginLeft:"auto",fontSize:12,color:C.muted}}>Step {step+1} of {steps.length}</span>
        </div>
        {s.content}
      </Card>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        {step>0&&<Btn onClick={()=>setStep(s=>s-1)}>Back</Btn>}
        {step<steps.length-1
          ?<Btn onClick={()=>{if(canAdvance)setStep(s=>s+1);}} color={canAdvance?C.blue:undefined} disabled={!canAdvance}>Continue →</Btn>
          :<Btn onClick={complete} color={canAdvance?C.green:undefined} disabled={!canAdvance}>Access my dashboard →</Btn>}
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
  const[payView,setPayView]=useState("monthly");

  useEffect(()=>{
    Promise.all([
      supabase.from("pipeline").select("*").eq("partner_id",partner.id).order("created_at",{ascending:false}),
      supabase.from("resources").select("*").order("created_at",{ascending:false}),
      supabase.from("tickets").select("*").eq("partner_id",partner.id).order("created_at",{ascending:false}),
      supabase.from("payouts").select("*").eq("partner_id",partner.id).order("created_at",{ascending:false}),
      supabase.from("announcements").select("*").eq("active",true).order("created_at",{ascending:false}),
    ]).then(([p,r,t,py,an])=>{
      setPipeline(p.data||[]);setResources(r.data||[]);setTickets(t.data||[]);setPayouts(py.data||[]);setAnnouncements(an.data||[]);setLoading(false);
    });
  },[partner.id]);

  const days=daysIn(partner.start_date);
  const equity=calcEquity(partner);
  const score=calcScore(partner,pipeline);
  const activeClients=pipeline.filter(c=>c.stage==="Active");
  const totalMonthlyAUM=activeClients.reduce((s,c)=>s+(c.monthly_spend||0),0);
  const monthlyComp=totalMonthlyAUM*REV_RATE;
  const brandClients=pipeline.filter(c=>c.type==="brand");
  const agencyClients=pipeline.filter(c=>c.type==="agency");

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

  // Payout filtering
  const now=new Date();
  const filteredPayouts=payouts.filter(p=>{
    const d=new Date(p.created_at);
    if(payView==="monthly")return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
    if(payView==="weekly"){const ago=new Date(now-7*86400000);return d>=ago;}
    return true;
  });
  const totalPaid=payouts.reduce((s,p)=>s+(p.amount||0),0);
  const paidThisMonth=payouts.filter(p=>{const d=new Date(p.created_at);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();}).reduce((s,p)=>s+(p.amount||0),0);

  const navGroups=PARTNER_NAV.map(g=>({...g,items:g.items.map(i=>i.key==="support"?{...i,badge:tickets.filter(t=>t.status==="Closed"&&false).length||null}:i)}));
  const header=<div><div style={{fontSize:11,color:C.muted,marginBottom:2}}>DSP Connect</div><div style={{fontWeight:500,fontSize:13}}>{(partner.name||"").split(" ")[0]}</div><div style={{fontSize:11,color:C.muted}}>{partner.agency||partner.vertical}</div></div>;
  const footer=<div><div style={{fontSize:11,color:C.muted,marginBottom:8}}>Day {days} · {partner.vertical}</div><button onClick={onLogout} style={{fontSize:12,color:C.muted,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:0}}><i className="ti ti-logout" style={{fontSize:13}}/>Sign out</button></div>;

  if(loading)return <div style={{display:"flex",minHeight:"100vh"}}><NavSidebar navGroups={navGroups} active={view} onSelect={setView} header={header} footer={footer}/><div style={{flex:1}}><Spinner/></div></div>;

  return <div style={{display:"flex",minHeight:"100vh",background:C.bg3}}>
    <NavSidebar navGroups={navGroups} active={view} onSelect={setView} header={header} footer={footer}/>
    <div style={{flex:1,overflowY:"auto",padding:24}}>

      {view==="dashboard"&&<div>
        <div style={{marginBottom:20}}><h2 style={{margin:"0 0 4px",fontSize:18,fontWeight:500}}>Dashboard</h2><div style={{fontSize:12,color:C.muted}}>{partner.vertical} · Started {partner.start_date} · Day {days}</div></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          <StatBox label="Active client AUM" value={fmtK(totalMonthlyAUM)} sub={`${activeClients.length} active clients`} icon="chart-bar"/>
          <StatBox label="Monthly compensation" value={fmt$(monthlyComp)} sub="10% of active AUM" icon="currency-dollar" green/>
          <StatBox label="Total clients" value={pipeline.length} sub={`${activeClients.length} active`} icon="building"/>
          <div style={{background:C.bg2,borderRadius:10,padding:"14px 16px"}}>
            <div style={{fontSize:12,color:C.muted,marginBottom:6,display:"flex",alignItems:"center",gap:5}}><i className="ti ti-star" style={{fontSize:14}}/>Partner score</div>
            <div style={{fontSize:22,fontWeight:500,color:score>=70?C.green:score>=40?C.amber:C.red}}>{score}</div>
            <div style={{marginTop:6}}><ProgressBar pct={score} color={score>=70?C.green:score>=40?C.amber:C.red}/></div>
            <div style={{fontSize:10,color:C.muted,marginTop:4}}>out of 100</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <Card style={{padding:16}}>
            <div style={{fontWeight:500,fontSize:14,marginBottom:14,display:"flex",alignItems:"center",gap:8}}><i className="ti ti-bell" style={{fontSize:15,color:C.blue}}/>Announcements</div>
            {announcements.length===0
              ?<><div style={{background:C.blueBg,borderRadius:8,padding:"10px 12px",marginBottom:8}}><div style={{fontSize:12,fontWeight:500,color:C.blue,marginBottom:2}}>Welcome to DSP Connect</div><div style={{fontSize:12,color:C.blue}}>Your Managing Partner portal is active. Complete your 90-day acceleration window to maximize equity.</div></div><div style={{background:C.amberBg,borderRadius:8,padding:"10px 12px"}}><div style={{fontSize:12,fontWeight:500,color:C.amber,marginBottom:2}}>Reminder: 90-day windows</div><div style={{fontSize:12,color:C.amber}}>Missed acceleration windows are permanently forfeited.</div></div></>
              :announcements.map(a=>{const bg=a.type==="warning"?C.amberBg:a.type==="success"?C.greenBg:C.blueBg;const fg=a.type==="warning"?C.amber:a.type==="success"?C.green:C.blue;return <div key={a.id} style={{background:bg,borderRadius:8,padding:"10px 12px",marginBottom:8}}><div style={{fontSize:12,fontWeight:500,color:fg,marginBottom:2}}>{a.title}</div><div style={{fontSize:12,color:fg}}>{a.body}</div></div>;})}
          </Card>
          <Card style={{padding:16}}>
            <div style={{fontWeight:500,fontSize:14,marginBottom:14,display:"flex",alignItems:"center",gap:8}}><i className="ti ti-bolt" style={{fontSize:15,color:C.amber}}/>90-Day acceleration — Day {Math.min(days,90)} of 90</div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              {[{label:"Day 1–30",done:days>30,active:days<=30,award:(DAY30.find(t=>(partner.day30_aum||0)>=t.aum)||{award:0}).award,max:3},
                {label:"Day 31–60",done:days>60,active:days>30&&days<=60,award:(DAY60.find(t=>(partner.day60_aum||0)>=t.aum)||{award:0}).award,max:3},
                {label:"Day 61–90",done:days>90,active:days>60&&days<=90,award:(DAY90.find(t=>(partner.day90_aum||0)>=t.aum)||{award:0}).award,max:4},
              ].map(w=><div key={w.label} style={{flex:1,background:w.active?C.amberBg:w.done?C.greenBg:C.bg2,borderRadius:8,padding:"10px"}}>
                <div style={{fontSize:10,fontWeight:500,color:w.active?C.amber:w.done?C.green:C.muted,marginBottom:4}}>{w.label}</div>
                <div style={{fontSize:18,fontWeight:500,color:w.active?C.amber:w.done?C.green:C.muted}}>{w.award.toFixed(1)}%</div>
                <div style={{fontSize:10,color:C.muted}}>of {w.max}% max</div>
              </div>)}
            </div>
            <div style={{borderTop:`0.5px solid ${C.border}`,paddingTop:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}><span style={{color:C.muted}}>Total equity</span><span style={{fontWeight:500,color:C.purple}}>{equity.total.toFixed(2)}% / 15%</span></div>
              <ProgressBar pct={(equity.total/15)*100} color={C.purple}/>
            </div>
          </Card>
        </div>
        <Card style={{padding:16}}>
          <div style={{fontWeight:500,fontSize:14,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>Client pipeline<button onClick={()=>setView("pipeline")} style={{fontSize:12,color:C.blue,background:"none",border:"none",cursor:"pointer"}}>View all →</button></div>
          {pipeline.length===0?<div style={{fontSize:13,color:C.muted,textAlign:"center",padding:"16px 0"}}>No clients yet. <button onClick={()=>setView("brand-clients")} style={{background:"none",border:"none",color:C.blue,cursor:"pointer",fontSize:13}}>Add your first client →</button></div>
          :PIPELINE_STAGES.map(stage=>{const inStage=pipeline.filter(c=>c.stage===stage);if(!inStage.length)return null;
            return <div key={stage} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`0.5px solid ${C.border}`}}><StatusPill s={stage}/><span style={{fontSize:13,color:C.muted}}>{inStage.length} client{inStage.length>1?"s":""}</span><span style={{fontSize:13,color:C.muted,marginLeft:"auto"}}>{fmtK(inStage.reduce((s,c)=>s+(c.monthly_spend||0),0))}/mo</span></div>;
          })}
        </Card>
      </div>}

      {view==="brand-clients"&&<div>
        <SectionHead title="Brand clients" sub="Direct advertisers you manage" action={<Btn onClick={()=>{setClientType("brand");setShowAddClient(true);}}>+ Add brand client</Btn>}/>
        {showAddClient&&clientType==="brand"&&<Card style={{padding:16,marginBottom:16}}>
          <div style={{fontWeight:500,fontSize:13,marginBottom:12}}>New brand client</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["Company name *","name","text"],["Contact name","contact_name","text"],["Contact email","email","email"],["Monthly ad spend ($)","monthly_spend","number"]].map(([label,field,type])=><div key={field}><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>{label}</label><input type={type} value={newClient[field]} onChange={e=>setNewClient(c=>({...c,[field]:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}/></div>)}
            <div style={{gridColumn:"1/-1"}}><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Notes</label><input value={newClient.notes} onChange={e=>setNewClient(c=>({...c,notes:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}/></div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:12}}><Btn onClick={()=>addClient("brand")} color={C.blue}>Add client</Btn><Btn onClick={()=>setShowAddClient(false)}>Cancel</Btn></div>
        </Card>}
        {brandClients.length===0?<EmptyState icon="building" title="No brand clients yet" sub="Add your first direct advertiser." cta="Add brand client" onCta={()=>{setClientType("brand");setShowAddClient(true);}}/>
        :<Card style={{overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"10px 16px",background:C.bg2,borderBottom:`0.5px solid ${C.border}`,fontSize:11,fontWeight:500,color:C.muted}}><span>Company</span><span>Contact</span><span>Monthly spend</span><span>Stage</span><span>Added</span></div>
          {brandClients.map((c,i)=><div key={c.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"12px 16px",borderBottom:i<brandClients.length-1?`0.5px solid ${C.border}`:"none",alignItems:"center"}}>
            <div><div style={{fontWeight:500,fontSize:13}}>{c.name}</div>{c.notes&&<div style={{fontSize:11,color:C.muted}}>{c.notes}</div>}</div>
            <div style={{fontSize:12,color:C.muted}}>{c.contact_name||"—"}</div>
            <div style={{fontSize:13,fontWeight:500,color:c.stage==="Active"?C.green:C.text}}>{fmtK(c.monthly_spend||0)}</div>
            <StatusPill s={c.stage}/>
            <div style={{fontSize:12,color:C.muted}}>{(c.created_at||"").slice(0,10)}</div>
          </div>)}
          <div style={{padding:"10px 16px",background:C.bg2,borderTop:`0.5px solid ${C.border}`,display:"flex",justifyContent:"space-between",fontSize:12}}>
            <span style={{color:C.muted}}>Total brand AUM</span>
            <span style={{fontWeight:500}}>{fmtK(brandClients.filter(c=>c.stage==="Active").reduce((s,c)=>s+(c.monthly_spend||0),0))}/mo active</span>
          </div>
        </Card>}
      </div>}

      {view==="agency-clients"&&<div>
        <SectionHead title="Agency clients" sub="Agencies whose ad spend you manage" action={<Btn onClick={()=>{setClientType("agency");setShowAddClient(true);}}>+ Add agency client</Btn>}/>
        {showAddClient&&clientType==="agency"&&<Card style={{padding:16,marginBottom:16}}>
          <div style={{fontWeight:500,fontSize:13,marginBottom:12}}>New agency client</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["Agency name *","name","text"],["Contact name","contact_name","text"],["Contact email","email","email"],["Monthly ad spend ($)","monthly_spend","number"]].map(([label,field,type])=><div key={field}><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>{label}</label><input type={type} value={newClient[field]} onChange={e=>setNewClient(c=>({...c,[field]:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}/></div>)}
            <div style={{gridColumn:"1/-1"}}><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Notes</label><input value={newClient.notes} onChange={e=>setNewClient(c=>({...c,notes:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}/></div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:12}}><Btn onClick={()=>addClient("agency")} color={C.blue}>Add agency</Btn><Btn onClick={()=>setShowAddClient(false)}>Cancel</Btn></div>
        </Card>}
        {agencyClients.length===0?<EmptyState icon="briefcase" title="No agency clients yet" sub="Add agencies to track their managed spend." cta="Add agency client" onCta={()=>{setClientType("agency");setShowAddClient(true);}}/>
        :<Card style={{overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"10px 16px",background:C.bg2,borderBottom:`0.5px solid ${C.border}`,fontSize:11,fontWeight:500,color:C.muted}}><span>Agency</span><span>Contact</span><span>Monthly spend</span><span>Stage</span><span>Added</span></div>
          {agencyClients.map((c,i)=><div key={c.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"12px 16px",borderBottom:i<agencyClients.length-1?`0.5px solid ${C.border}`:"none",alignItems:"center"}}>
            <div><div style={{fontWeight:500,fontSize:13}}>{c.name}</div>{c.notes&&<div style={{fontSize:11,color:C.muted}}>{c.notes}</div>}</div>
            <div style={{fontSize:12,color:C.muted}}>{c.contact_name||"—"}</div>
            <div style={{fontSize:13,fontWeight:500,color:c.stage==="Active"?C.green:C.text}}>{fmtK(c.monthly_spend||0)}</div>
            <StatusPill s={c.stage}/>
            <div style={{fontSize:12,color:C.muted}}>{(c.created_at||"").slice(0,10)}</div>
          </div>)}
          <div style={{padding:"10px 16px",background:C.bg2,borderTop:`0.5px solid ${C.border}`,display:"flex",justifyContent:"space-between",fontSize:12}}>
            <span style={{color:C.muted}}>Total agency AUM</span>
            <span style={{fontWeight:500}}>{fmtK(agencyClients.filter(c=>c.stage==="Active").reduce((s,c)=>s+(c.monthly_spend||0),0))}/mo active</span>
          </div>
        </Card>}
      </div>}

      {view==="pipeline"&&<div>
        <h2 style={{margin:"0 0 4px",fontSize:18,fontWeight:500}}>Pipeline</h2>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>All clients by stage — drag the dropdown to move a client forward</div>
        {["brand","agency"].map(type=><div key={type} style={{marginBottom:28}}>
          <div style={{fontWeight:500,fontSize:14,marginBottom:12,display:"flex",alignItems:"center",gap:8}}><i className={`ti ti-${type==="brand"?"building":"briefcase"}`} style={{fontSize:15,color:C.blue}}/>{type==="brand"?"Brand clients":"Agency clients"} <span style={{fontSize:12,color:C.muted,fontWeight:400}}>({pipeline.filter(c=>c.type===type).length})</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
            {PIPELINE_STAGES.map(stage=>{const inStage=pipeline.filter(c=>c.type===type&&c.stage===stage);
              return <div key={stage}>
                <div style={{fontSize:11,fontWeight:500,color:C.muted,marginBottom:6,textAlign:"center"}}>{stage} ({inStage.length})</div>
                <div style={{minHeight:60,background:C.bg2,borderRadius:8,padding:6,display:"flex",flexDirection:"column",gap:6}}>
                  {inStage.map(c=><div key={c.id} style={{background:C.bg,border:`0.5px solid ${C.border}`,borderRadius:6,padding:"8px 10px"}}>
                    <div style={{fontSize:12,fontWeight:500,marginBottom:2}}>{c.name}</div>
                    <div style={{fontSize:11,color:C.green,marginBottom:6,fontWeight:500}}>{fmtK(c.monthly_spend||0)}/mo</div>
                    <select value={c.stage} onChange={e=>moveStage(c.id,e.target.value)} style={{fontSize:10,width:"100%",padding:"2px 4px",borderRadius:4,border:`0.5px solid ${C.border}`}}>{PIPELINE_STAGES.map(s=><option key={s}>{s}</option>)}</select>
                  </div>)}
                  {inStage.length===0&&<div style={{fontSize:11,color:C.muted,textAlign:"center",padding:"8px 4px"}}>—</div>}
                </div>
              </div>;
            })}
          </div>
        </div>)}
      </div>}

      {view==="compensation"&&<div>
        <h2 style={{margin:"0 0 4px",fontSize:18,fontWeight:500}}>Compensation center</h2>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>10% of Qualified Active AUM · Cash Compensation Policy (Exhibit B)</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          <StatBox label="Active AUM" value={fmtK(totalMonthlyAUM)} sub="Monthly managed spend" icon="chart-bar"/>
          <StatBox label="Monthly comp" value={fmt$(monthlyComp)} sub="10% of active AUM" icon="currency-dollar" green/>
          <StatBox label="Paid this month" value={fmt$(paidThisMonth)} sub="Recorded payouts" icon="check" green/>
          <StatBox label="Total paid (lifetime)" value={fmt$(totalPaid)} sub="All recorded payouts" icon="trophy" green/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <Card style={{padding:16}}>
            <div style={{fontWeight:500,fontSize:14,marginBottom:12}}>Active client breakdown</div>
            {activeClients.length===0?<div style={{fontSize:13,color:C.muted,textAlign:"center",padding:16}}>No active clients yet</div>
            :<>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",padding:"8px 0",borderBottom:`0.5px solid ${C.border}`,fontSize:11,fontWeight:500,color:C.muted}}><span>Client</span><span>Type</span><span>AUM/mo</span><span>10% comp</span></div>
              {activeClients.map(c=><div key={c.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",padding:"9px 0",borderBottom:`0.5px solid ${C.border}`,fontSize:13,alignItems:"center"}}>
                <span style={{fontWeight:500}}>{c.name}</span>
                <Pill label={c.type} bg={c.type==="brand"?C.blueBg:C.purpleBg} fg={c.type==="brand"?C.blue:C.purple}/>
                <span style={{color:C.green,fontWeight:500}}>{fmtK(c.monthly_spend||0)}</span>
                <span style={{color:C.green,fontWeight:500}}>{fmt$((c.monthly_spend||0)*REV_RATE)}</span>
              </div>)}
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",padding:"10px 0",fontSize:13,fontWeight:500}}>
                <span>Total</span><span/><span style={{color:C.green}}>{fmtK(totalMonthlyAUM)}</span><span style={{color:C.green}}>{fmt$(monthlyComp)}</span>
              </div>
            </>}
          </Card>
          <Card style={{padding:16}}>
            <div style={{fontWeight:500,fontSize:14,marginBottom:4}}>Annual projection</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Based on current active AUM</div>
            {[["Annual AUM",fmtK(totalMonthlyAUM*12)],["Annual compensation",fmt$(monthlyComp*12)],["YTD compensation (est.)",fmt$(monthlyComp*Math.max(1,Math.floor(days/30)))],["Annual run rate",fmtK(monthlyComp*12)]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`0.5px solid ${C.border}`,fontSize:13}}><span style={{color:C.muted}}>{l}</span><span style={{fontWeight:500,color:C.green}}>{v}</span></div>)}
          </Card>
        </div>
        <Card style={{overflow:"hidden"}}>
          <div style={{padding:"13px 16px",borderBottom:`0.5px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontWeight:500,fontSize:14}}>Payout history</div>
            <div style={{display:"flex",gap:6}}>
              {["weekly","monthly","all"].map(v=><button key={v} onClick={()=>setPayView(v)} style={{fontSize:11,padding:"4px 10px",borderRadius:6,border:`0.5px solid ${C.border}`,background:payView===v?C.blue:"transparent",color:payView===v?"#fff":C.muted,cursor:"pointer",textTransform:"capitalize"}}>{v}</button>)}
            </div>
          </div>
          {filteredPayouts.length===0?<div style={{padding:32,textAlign:"center",fontSize:13,color:C.muted}}>No payouts recorded for this period.</div>
          :<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",padding:"9px 16px",background:C.bg2,borderBottom:`0.5px solid ${C.border}`,fontSize:11,fontWeight:500,color:C.muted}}><span>Date</span><span>Period</span><span>Amount</span><span>Reference</span><span>Notes</span></div>
            {filteredPayouts.map((p,i,arr)=><div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",padding:"11px 16px",borderBottom:i<arr.length-1?`0.5px solid ${C.border}`:"none",alignItems:"center",fontSize:13}}>
              <span style={{color:C.muted}}>{fmtDate(p.created_at)}</span>
              <span>{p.period_label||"—"}</span>
              <span style={{fontWeight:500,color:C.green}}>{fmt$(p.amount)}</span>
              <span style={{fontSize:12,color:C.muted,fontFamily:"monospace"}}>{p.reference||"—"}</span>
              <span style={{fontSize:12,color:C.muted}}>{p.notes||"—"}</span>
            </div>)}
            <div style={{padding:"10px 16px",background:C.bg2,borderTop:`0.5px solid ${C.border}`,display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:500}}>
              <span style={{color:C.muted}}>Total shown</span>
              <span style={{color:C.green}}>{fmt$(filteredPayouts.reduce((s,p)=>s+(p.amount||0),0))}</span>
            </div>
          </>}
        </Card>
      </div>}

      {view==="equity"&&<div>
        <h2 style={{margin:"0 0 4px",fontSize:18,fontWeight:500}}>Ownership center</h2>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Equity Vesting, Performance & Acceleration Policy (Exhibit A)</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          <StatBox label="Ownership %" value={`${equity.total.toFixed(2)}%`} icon="chart-pie" blue/>
          <StatBox label="Vesting status" value={equity.qualifies?"Qualified":"Not yet"} sub={equity.qualifies?"$5M AUM met":"$5M AUM required"} icon="lock"/>
          <StatBox label="AUM to qualify" value={equity.qualifies?"✓ Met":fmtK(Math.max(0,MIN_EQUITY_AUM-(partner.annual_aum||0)))} sub={equity.qualifies?"":"remaining"} icon="flag"/>
          <StatBox label="Max equity" value="15.00%" sub="5% base + 10% accel" icon="trophy"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card style={{padding:16}}>
            <div style={{fontWeight:500,fontSize:14,marginBottom:16}}>Equity breakdown</div>
            {[{label:"Base grant",pct:equity.base,max:5,color:C.blue,note:"5% upon qualifying"},{label:"Day 1–30 acceleration",pct:equity.a30,max:3,color:C.amber,note:"Max 3%"},{label:"Day 31–60 acceleration",pct:equity.a60,max:3,color:C.green,note:"Max 3%"},{label:"Day 61–90 acceleration",pct:equity.a90,max:4,color:C.purple,note:"Max 4%"}].map(r=><div key={r.label} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:C.muted}}>{r.label} <span style={{fontSize:11}}>({r.note})</span></span><span style={{fontWeight:500}}>{equity.qualifies?r.pct.toFixed(2):0}%</span></div>
              <ProgressBar pct={equity.qualifies?(r.pct/r.max)*100:0} color={r.color}/>
            </div>)}
            <div style={{borderTop:`0.5px solid ${C.border}`,marginTop:4,paddingTop:12,display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:500}}><span>Total</span><span style={{color:C.purple}}>{equity.total.toFixed(2)}% / 15.00%</span></div>
          </Card>
          <Card style={{padding:16}}>
            <div style={{fontWeight:500,fontSize:14,marginBottom:14}}>Signed documents</div>
            {[{label:"Equity Vesting Policy (Exhibit A)",date:"On file"},{label:"Cash Compensation Policy (Exhibit B)",date:"On file"},{label:"Managing Partner Admission Notice",date:partner.start_date},{label:"Master Operating Agreement",date:"On file"}].map(doc=><div key={doc.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`0.5px solid ${C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}><i className="ti ti-file-text" style={{fontSize:15,color:C.muted}}/><span style={{fontSize:13}}>{doc.label}</span></div>
              <span style={{fontSize:12,color:C.muted}}>{doc.date}</span>
            </div>)}
            <div style={{marginTop:12,padding:"10px 12px",background:C.greenBg,borderRadius:8,fontSize:12,color:C.green}}>✓ All documents signed on {partner.start_date}</div>
          </Card>
        </div>
      </div>}

      {["training","sops","documents"].includes(view)&&<div>
        <h2 style={{margin:"0 0 20px",fontSize:18,fontWeight:500}}>{view==="training"?"Training":view==="sops"?"SOPs":"Documents"}</h2>
        {resources.filter(r=>r.category===view).length===0
          ?<EmptyState icon="file-text" title="No resources yet" sub="Admin will upload materials here. Check back soon."/>
          :<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
            {resources.filter(r=>r.category===view).map(r=><Card key={r.id} style={{padding:14}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:r.description?8:0}}><i className={`ti ti-${r.type==="video"?"player-play":r.type==="article"?"article":"file-text"}`} style={{fontSize:18,color:C.blue}}/>
              <div><div style={{fontWeight:500,fontSize:13}}>{r.title}</div><div style={{fontSize:11,color:C.muted}}>{r.type?.toUpperCase()} · {(r.created_at||"").slice(0,10)}</div></div></div>
              {r.description&&<div style={{fontSize:12,color:C.muted,paddingLeft:28}}>{r.description}</div>}
              {r.url&&<a href={r.url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:C.blue,marginTop:8,paddingLeft:28,textDecoration:"none"}}><i className="ti ti-external-link" style={{fontSize:12}}/>Open resource</a>}
            </Card>)}
          </div>}
      </div>}

      {view==="support"&&<div>
        <SectionHead title="Help desk" action={<Btn onClick={()=>setShowTicket(true)}>+ Submit ticket</Btn>}/>
        {showTicket&&<Card style={{padding:16,marginBottom:16}}>
          <div style={{fontWeight:500,fontSize:13,marginBottom:12}}>New support ticket</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Issue type</label><select value={newTicket.type} onChange={e=>setNewTicket(t=>({...t,type:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}>{["Client Issue","Agency Issue","Billing Issue","Technical Issue","Other"].map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Subject *</label><input value={newTicket.subject} onChange={e=>setNewTicket(t=>({...t,subject:e.target.value}))} placeholder="Brief description" style={{width:"100%",boxSizing:"border-box"}}/></div>
          </div>
          <div style={{marginBottom:10}}><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Details</label><textarea value={newTicket.details} onChange={e=>setNewTicket(t=>({...t,details:e.target.value}))} placeholder="Full description…" rows={3} style={{width:"100%",boxSizing:"border-box",resize:"vertical",padding:"7px 10px",border:`0.5px solid ${C.border2}`,borderRadius:7,fontFamily:"inherit",fontSize:13}}/></div>
          <div style={{display:"flex",gap:8}}><Btn onClick={submitTicket} color={C.blue}>Submit</Btn><Btn onClick={()=>setShowTicket(false)}>Cancel</Btn></div>
        </Card>}
        {tickets.length===0?<EmptyState icon="help-circle" title="No tickets yet" sub="Submit a ticket for any client, billing, or technical issue."/>
        :<Card style={{overflow:"hidden"}}>
          {tickets.map((t,i,arr)=><div key={t.id} style={{padding:"12px 16px",borderBottom:i<arr.length-1?`0.5px solid ${C.border}`:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:t.details?4:0}}><Pill label={t.type} bg={C.blueBg} fg={C.blue}/><span style={{fontWeight:500,fontSize:13,flex:1}}>{t.subject}</span><StatusPill s={t.status}/><span style={{fontSize:12,color:C.muted}}>{(t.created_at||"").slice(0,10)}</span></div>
            {t.details&&<div style={{fontSize:12,color:C.muted,marginTop:4,paddingLeft:0}}>{t.details}</div>}
            {t.admin_reply&&<div style={{marginTop:8,padding:"8px 12px",background:C.greenBg,borderRadius:8,fontSize:12,color:C.green}}><span style={{fontWeight:500}}>Admin: </span>{t.admin_reply}</div>}
          </div>)}
        </Card>}
      </div>}

    </div>
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
  const[loading,setLoading]=useState(true);
  const[view,setView]=useState("dashboard");
  const[selected,setSelected]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[slackMsgs,setSlackMsgs]=useState([]);
  const[slackMsg,setSlackMsg]=useState("");
  const[slackCh,setSlackCh]=useState("#partner-revenue");
  const[newResource,setNewResource]=useState({title:"",type:"pdf",category:"training",description:"",url:""});
  const[showAddResource,setShowAddResource]=useState(false);
  const[newAnnouncement,setNewAnnouncement]=useState({title:"",body:"",type:"info"});
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
    ]).then(([p,pi,r,t,py,an])=>{
      setPartners(p.data||[]);setPipeline(pi.data||[]);setResources(r.data||[]);setTickets(t.data||[]);setPayouts(py.data||[]);setAnnouncements(an.data||[]);setLoading(false);
    });
  },[]);

  const addPartner=async()=>{
    if(!form.name||!form.email||!form.password){setFormErr("Name, email, and password required.");return;}
    if(partners.find(p=>p.email.toLowerCase()===form.email.toLowerCase())){setFormErr("Email already exists.");return;}
    setSaving(true);
    const{data,error}=await supabase.from("partners").insert([{...form,monthly_spend:parseFloat(form.monthly_spend)||0,annual_aum:parseFloat(form.annual_aum)||0,day30_aum:parseFloat(form.day30_aum)||0,day60_aum:parseFloat(form.day60_aum)||0,day90_aum:parseFloat(form.day90_aum)||0,non_compete_days:parseInt(form.non_compete_days)||90,onboarded:false}]).select().single();
    setSaving(false);
    if(error){setFormErr(error.message);return;}
    setPartners(p=>[data,...p]);
    sendSlack("#partner-updates",`🤝 New partner: ${data.name} (${data.agency||data.vertical}) · starts ${data.start_date}`);
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
    sendSlack("#partner-payouts",`💰 Payout recorded: ${p?.name} · ${fmt$(parseFloat(newPayout.amount)||0)} · ${newPayout.period_label||"—"} · Ref: ${newPayout.reference||"—"}`);
    setNewPayout({amount:"",period_label:"",period_start:"",period_end:"",reference:"",notes:""});
    setPayoutModal(null);
  };

  const replyTicket=async(id)=>{
    const reply=ticketReply[id];
    if(!reply)return;
    await supabase.from("tickets").update({status:"Closed",admin_reply:reply}).eq("id",id);
    setTickets(t=>t.map(x=>x.id===id?{...x,status:"Closed",admin_reply:reply}:x));
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
    if(!newAnnouncement.title||!newAnnouncement.body)return;
    const{data}=await supabase.from("announcements").insert([{...newAnnouncement,active:true}]).select().single();
    if(data)setAnnouncements(a=>[data,...a]);
    setNewAnnouncement({title:"",body:"",type:"info"});setShowAddAnn(false);
  };

  const toggleAnnouncement=async(id,active)=>{
    await supabase.from("announcements").update({active}).eq("id",id);
    setAnnouncements(a=>a.map(x=>x.id===id?{...x,active}:x));
  };

  const deleteAnnouncement=async(id)=>{
    await supabase.from("announcements").delete().eq("id",id);
    setAnnouncements(a=>a.filter(x=>x.id!==id));
  };

  const movePipelineStage=async(id,stage)=>{
    await supabase.from("pipeline").update({stage}).eq("id",id);
    setPipeline(p=>p.map(c=>c.id===id?{...c,stage}:c));
  };

  const sendSlack=(ch,msg)=>{const time=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});setSlackMsgs(p=>[{channel:ch,message:msg,time},...p]);};

  const totalAUM=partners.reduce((s,p)=>s+(p.monthly_spend||0),0);
  const totalComp=totalAUM*REV_RATE;
  const active=partners.filter(p=>p.status==="Active");
  const pendingApprovals=pipeline.filter(c=>c.stage==="Review");
  const openTickets=tickets.filter(t=>t.status==="Open");

  const navGroups=ADMIN_NAV.map(g=>({...g,items:g.items.map(i=>({...i,
    badge:i.key==="approvals"?pendingApprovals.length||null:i.key==="admissions"?partners.filter(p=>p.status==="Pending Setup").length||null:i.key==="slack"?tickets.filter(t=>t.status==="Open").length||null:null
  }))}));
  const header=<div><div style={{fontSize:11,color:C.muted,marginBottom:2}}>DSP Connect</div><div style={{fontWeight:500,fontSize:13}}>Admin Portal</div><div style={{fontSize:11,color:C.muted}}>getdspconnect.com</div></div>;
  const footer=<button onClick={onLogout} style={{fontSize:12,color:C.muted,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:0}}><i className="ti ti-logout" style={{fontSize:13}}/>Sign out</button>;
  const F=({label,children,full})=><div style={full?{gridColumn:"1/-1"}:{}}><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5}}>{label}</label>{children}</div>;

  if(loading)return <div style={{display:"flex",minHeight:"100vh"}}><NavSidebar navGroups={navGroups} active={view} onSelect={setView} header={header} footer={footer}/><div style={{flex:1}}><Spinner/></div></div>;

  return <div style={{display:"flex",minHeight:"100vh",background:C.bg3}}>
    <NavSidebar navGroups={navGroups} active={view} onSelect={setView} header={header} footer={footer}/>
    <div style={{flex:1,overflowY:"auto",padding:24}}>

      {/* PAYOUT MODAL */}
      {payoutModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
        <Card style={{width:480,padding:24}}>
          <div style={{fontWeight:500,fontSize:15,marginBottom:4}}>Record payout</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:16}}>{partners.find(p=>p.id===payoutModal)?.name}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <F label="Amount ($) *"><input type="number" value={newPayout.amount} onChange={e=>setNewPayout(p=>({...p,amount:e.target.value}))} placeholder="0.00" style={{width:"100%",boxSizing:"border-box"}}/></F>
            <F label="Period label"><input value={newPayout.period_label} onChange={e=>setNewPayout(p=>({...p,period_label:e.target.value}))} placeholder="e.g. June 2026" style={{width:"100%",boxSizing:"border-box"}}/></F>
            <F label="Period start"><input type="date" value={newPayout.period_start} onChange={e=>setNewPayout(p=>({...p,period_start:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}/></F>
            <F label="Period end"><input type="date" value={newPayout.period_end} onChange={e=>setNewPayout(p=>({...p,period_end:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}/></F>
            <F label="Reference # (check/wire/ACH)"><input value={newPayout.reference} onChange={e=>setNewPayout(p=>({...p,reference:e.target.value}))} placeholder="e.g. CHK-1042" style={{width:"100%",boxSizing:"border-box"}}/></F>
            <F label="Notes"><input value={newPayout.notes} onChange={e=>setNewPayout(p=>({...p,notes:e.target.value}))} placeholder="Optional" style={{width:"100%",boxSizing:"border-box"}}/></F>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn onClick={()=>setPayoutModal(null)}>Cancel</Btn>
            <Btn onClick={recordPayout} color={C.green} disabled={!newPayout.amount}>Record payout</Btn>
          </div>
        </Card>
      </div>}

      {view==="dashboard"&&<div>
        <div style={{marginBottom:20}}><h2 style={{margin:"0 0 4px",fontSize:18,fontWeight:500}}>Admin overview</h2><div style={{fontSize:12,color:C.muted}}>DSP Connect · Managing Partner program</div></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          <StatBox label="Total partners" value={partners.length} sub={`${active.length} active`} icon="users"/>
          <StatBox label="Total monthly AUM" value={fmtK(totalAUM)} sub="All active client spend" icon="chart-bar"/>
          <StatBox label="Monthly comp due" value={fmt$(totalComp)} sub="10% of total AUM" icon="currency-dollar" green/>
          <StatBox label="Open tickets" value={openTickets.length} sub={`${pendingApprovals.length} pending approvals`} icon="help-circle" amber/>
        </div>
        {partners.length===0?<EmptyState icon="users" title="No managing partners yet" sub="Create your first managing partner to get started." cta="Add first partner →" onCta={()=>setView("admissions")}/>
        :<Card style={{overflow:"hidden"}}>
          <div style={{padding:"13px 16px",borderBottom:`0.5px solid ${C.border}`,fontWeight:500,fontSize:14}}>Partner snapshot</div>
          {partners.map((p,i)=>{
            const eq=calcEquity(p);
            const myClients=pipeline.filter(c=>c.partner_id===p.id&&c.stage==="Active");
            const myAUM=myClients.reduce((s,c)=>s+(c.monthly_spend||0),0);
            const myPayouts=payouts.filter(py=>py.partner_id===p.id).reduce((s,py)=>s+(py.amount||0),0);
            return <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:i<partners.length-1?`0.5px solid ${C.border}`:"none"}}>
              <Avatar name={p.name}/><div style={{flex:1,minWidth:0}}><div style={{fontWeight:500,fontSize:13}}>{p.name}{p.agency?` · ${p.agency}`:""}</div><div style={{fontSize:11,color:C.muted}}>{p.vertical} · Day {daysIn(p.start_date)} · {myClients.length} active clients</div></div>
              <StatusPill s={p.status}/>
              <div style={{textAlign:"right",minWidth:90}}><div style={{fontSize:13,fontWeight:500}}>{fmtK(myAUM)}</div><div style={{fontSize:11,color:C.muted}}>AUM/mo</div></div>
              <div style={{textAlign:"right",minWidth:75}}><div style={{fontSize:13,fontWeight:500,color:C.green}}>{fmt$(myAUM*REV_RATE)}</div><div style={{fontSize:11,color:C.muted}}>comp/mo</div></div>
              <div style={{textAlign:"right",minWidth:75}}><div style={{fontSize:13,fontWeight:500,color:C.amber}}>{fmt$(myPayouts)}</div><div style={{fontSize:11,color:C.muted}}>paid total</div></div>
              <div style={{textAlign:"right",minWidth:55}}><div style={{fontSize:13,fontWeight:500,color:C.purple}}>{eq.total.toFixed(1)}%</div><div style={{fontSize:11,color:C.muted}}>equity</div></div>
            </div>;
          })}
        </Card>}
      </div>}

      {view==="admissions"&&<div>
        <SectionHead title="Partner admissions" action={<Btn onClick={()=>setShowAdd(s=>!s)} color={showAdd?undefined:C.blue}>{showAdd?"Cancel":"+ New partner"}</Btn>}/>
        {showAdd&&<Card style={{padding:20,marginBottom:20}}>
          <div style={{fontWeight:500,fontSize:14,marginBottom:16,paddingBottom:12,borderBottom:`0.5px solid ${C.border}`}}>New Managing Partner — Admission Notice</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <F label="Full legal name *"><input value={form.legal_name} onChange={e=>setForm(f=>({...f,legal_name:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}/></F>
            <F label="Display name *"><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}/></F>
            <F label="Agency / company"><input value={form.agency} onChange={e=>setForm(f=>({...f,agency:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}/></F>
            <F label="Email *"><input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}/></F>
            <F label="Portal password *"><input value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}/></F>
            <F label="Start date"><input type="date" value={form.start_date} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}/></F>
            <F label="Vertical"><select value={form.vertical} onChange={e=>setForm(f=>({...f,vertical:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}>{VERTICALS.map(v=><option key={v}>{v}</option>)}</select></F>
            <F label="Non-compete (days)"><input type="number" value={form.non_compete_days} onChange={e=>setForm(f=>({...f,non_compete_days:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}/></F>
            <F label="Trailing compensation" full><select value={form.trailing_option} onChange={e=>setForm(f=>({...f,trailing_option:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}>{TRAILING_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></F>
            <div style={{gridColumn:"1/-1",paddingTop:12,borderTop:`0.5px solid ${C.border}`}}>
              <div style={{fontSize:12,color:C.muted,marginBottom:10,fontWeight:500}}>AUM — enter once spend is active</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <F label="Monthly spend ($)"><input type="number" value={form.monthly_spend} onChange={e=>setForm(f=>({...f,monthly_spend:e.target.value}))} placeholder="0" style={{width:"100%",boxSizing:"border-box"}}/></F>
                <F label="Annual AUM ($)"><input type="number" value={form.annual_aum} onChange={e=>setForm(f=>({...f,annual_aum:e.target.value}))} placeholder="0" style={{width:"100%",boxSizing:"border-box"}}/></F>
                <F label="Day 30 AUM ($)"><input type="number" value={form.day30_aum} onChange={e=>setForm(f=>({...f,day30_aum:e.target.value}))} placeholder="0" style={{width:"100%",boxSizing:"border-box"}}/></F>
                <F label="Day 60 AUM ($)"><input type="number" value={form.day60_aum} onChange={e=>setForm(f=>({...f,day60_aum:e.target.value}))} placeholder="0" style={{width:"100%",boxSizing:"border-box"}}/></F>
                <F label="Day 90 AUM ($)"><input type="number" value={form.day90_aum} onChange={e=>setForm(f=>({...f,day90_aum:e.target.value}))} placeholder="0" style={{width:"100%",boxSizing:"border-box"}}/></F>
              </div>
            </div>
          </div>
          {formErr&&<div style={{marginTop:10,fontSize:12,color:C.red,background:C.redBg,padding:"8px 12px",borderRadius:8}}>{formErr}</div>}
          <div style={{display:"flex",gap:10,marginTop:14}}>
            <Btn onClick={addPartner} color={C.blue} disabled={saving}>{saving?"Saving…":"Create partner account"}</Btn>
            <Btn onClick={()=>{setShowAdd(false);setForm(blank);setFormErr("");}}>Cancel</Btn>
          </div>
        </Card>}
        {partners.filter(p=>p.status==="Pending Setup").length>0&&<div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:500,color:C.muted,marginBottom:10}}>Pending setup ({partners.filter(p=>p.status==="Pending Setup").length})</div>
          {partners.filter(p=>p.status==="Pending Setup").map(p=><Card key={p.id} style={{padding:14,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}><Avatar name={p.name}/><div style={{flex:1}}><div style={{fontWeight:500,fontSize:13}}>{p.name}{p.agency?` · ${p.agency}`:""}</div><div style={{fontSize:11,color:C.muted}}>{p.email} · {p.vertical}</div></div><StatusPill s={p.status}/>
            <Btn onClick={()=>updatePartner(p.id,{status:"Active"})} color={C.green} small>Activate</Btn></div>
          </Card>)}
        </div>}
        {partners.length===0&&!showAdd&&<EmptyState icon="user-plus" title="No partners yet" sub='Click "+ New partner" to create the first managing partner.'/>}
      </div>}

      {view==="partner-mgmt"&&<div>
        <h2 style={{margin:"0 0 20px",fontSize:18,fontWeight:500}}>Partner management</h2>
        {partners.length===0?<EmptyState icon="users" title="No partners" sub="Add partners from Admissions." cta="Go to admissions" onCta={()=>setView("admissions")}/>
        :partners.map(p=>{
          const eq=calcEquity(p);const open=selected?.id===p.id;
          const myClients=pipeline.filter(c=>c.partner_id===p.id);
          const myActive=myClients.filter(c=>c.stage==="Active");
          const myAUM=myActive.reduce((s,c)=>s+(c.monthly_spend||0),0);
          const myPayouts=payouts.filter(py=>py.partner_id===p.id);
          const totalPaid=myPayouts.reduce((s,py)=>s+(py.amount||0),0);
          return <Card key={p.id} style={{marginBottom:12,overflow:"hidden"}}>
            <div onClick={()=>setSelected(open?null:p)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",cursor:"pointer",background:open?C.bg2:"transparent"}}>
              <Avatar name={p.name} size={42}/><div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:500,fontSize:14}}>{p.name}{p.agency?` · ${p.agency}`:""}</div>
                <div style={{fontSize:12,color:C.muted}}>{p.email} · {p.vertical} · Day {daysIn(p.start_date)}</div>
              </div>
              <StatusPill s={p.status}/><Pill label={`${eq.total.toFixed(1)}% equity`} bg={C.purpleBg} fg={C.purple}/>
              <div style={{textAlign:"right",minWidth:90}}><div style={{fontSize:14,fontWeight:500}}>{fmtK(myAUM)}</div><div style={{fontSize:11,color:C.muted}}>active AUM</div></div>
              <div style={{textAlign:"right",minWidth:80}}><div style={{fontSize:14,fontWeight:500,color:C.green}}>{fmt$(myAUM*REV_RATE)}</div><div style={{fontSize:11,color:C.muted}}>comp/mo</div></div>
            </div>
            {open&&<div style={{padding:16,borderTop:`0.5px solid ${C.border}`,background:C.bg2}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
                <StatBox label="Active clients" value={myActive.length} sub={`${myClients.length} total`} icon="building"/>
                <StatBox label="Active AUM" value={fmtK(myAUM)} icon="chart-bar"/>
                <StatBox label="Monthly comp" value={fmt$(myAUM*REV_RATE)} icon="currency-dollar" green/>
                <StatBox label="Total paid out" value={fmt$(totalPaid)} icon="cash" green/>
              </div>
              <div style={{fontWeight:500,fontSize:13,marginBottom:10}}>Active clients</div>
              {myActive.length===0?<div style={{fontSize:13,color:C.muted,marginBottom:14}}>No active clients yet.</div>
              :<Card style={{marginBottom:14,overflow:"hidden"}}>
                <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",padding:"8px 12px",background:C.bg2,borderBottom:`0.5px solid ${C.border}`,fontSize:11,fontWeight:500,color:C.muted}}><span>Client</span><span>Type</span><span>Monthly spend</span></div>
                {myActive.map((c,i)=><div key={c.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",padding:"9px 12px",borderBottom:i<myActive.length-1?`0.5px solid ${C.border}`:"none",fontSize:13,alignItems:"center"}}>
                  <span style={{fontWeight:500}}>{c.name}</span>
                  <Pill label={c.type} bg={c.type==="brand"?C.blueBg:C.purpleBg} fg={c.type==="brand"?C.blue:C.purple}/>
                  <span style={{color:C.green,fontWeight:500}}>{fmtK(c.monthly_spend||0)}</span>
                </div>)}
              </Card>}
              <div style={{fontWeight:500,fontSize:13,marginBottom:10}}>Update AUM</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
                {[{label:"Monthly spend ($)",f:"monthly_spend"},{label:"Annual AUM ($)",f:"annual_aum"},{label:"Day 30 AUM ($)",f:"day30_aum"},{label:"Day 60 AUM ($)",f:"day60_aum"},{label:"Day 90 AUM ($)",f:"day90_aum"}].map(({label,f})=><div key={f}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{label}</label><input type="number" defaultValue={p[f]||0} onBlur={e=>updatePartner(p.id,{[f]:parseFloat(e.target.value)||0})} style={{width:"100%",boxSizing:"border-box",fontSize:13}}/></div>)}
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <select value={p.status} onChange={e=>updatePartner(p.id,{status:e.target.value})} style={{fontSize:12,padding:"6px 10px",borderRadius:8,border:`0.5px solid ${C.border}`,background:C.bg}}>{["Pending Setup","Onboarding","Active","Inactive"].map(s=><option key={s}>{s}</option>)}</select>
                <Btn onClick={()=>setPayoutModal(p.id)} color={C.green}>+ Record payout</Btn>
                <Btn onClick={()=>sendSlack("#partner-revenue",`💰 ${p.name}: ${fmtK(myAUM)} AUM · ${fmt$(myAUM*REV_RATE)} comp/mo · ${myActive.length} active clients`)}>Notify Slack</Btn>
              </div>
              {myPayouts.length>0&&<div style={{marginTop:14}}>
                <div style={{fontWeight:500,fontSize:13,marginBottom:8}}>Payout history</div>
                <Card style={{overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",padding:"8px 12px",background:C.bg2,borderBottom:`0.5px solid ${C.border}`,fontSize:11,fontWeight:500,color:C.muted}}><span>Date</span><span>Period</span><span>Amount</span><span>Reference</span></div>
                  {myPayouts.map((py,i)=><div key={py.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",padding:"9px 12px",borderBottom:i<myPayouts.length-1?`0.5px solid ${C.border}`:"none",fontSize:12,alignItems:"center"}}>
                    <span style={{color:C.muted}}>{fmtDate(py.created_at)}</span>
                    <span>{py.period_label||"—"}</span>
                    <span style={{fontWeight:500,color:C.green}}>{fmt$(py.amount)}</span>
                    <span style={{fontFamily:"monospace",color:C.muted}}>{py.reference||"—"}</span>
                  </div>)}
                </Card>
              </div>}
            </div>}
          </Card>;
        })}
      </div>}

      {(view==="admin-brands"||view==="admin-agencies")&&<div>
        <h2 style={{margin:"0 0 4px",fontSize:18,fontWeight:500}}>{view==="admin-brands"?"All brand clients":"All agency clients"}</h2>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Across all partners</div>
        {pipeline.filter(c=>c.type===(view==="admin-brands"?"brand":"agency")).length===0
          ?<EmptyState icon={view==="admin-brands"?"building":"briefcase"} title="No clients yet" sub="Partners add clients from their dashboard."/>
          :<Card style={{overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",padding:"10px 16px",background:C.bg2,borderBottom:`0.5px solid ${C.border}`,fontSize:11,fontWeight:500,color:C.muted}}><span>Name</span><span>Contact</span><span>Monthly spend</span><span>Stage</span><span>Partner</span><span>Added</span></div>
            {pipeline.filter(c=>c.type===(view==="admin-brands"?"brand":"agency")).map((c,i,arr)=><div key={c.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",padding:"12px 16px",borderBottom:i<arr.length-1?`0.5px solid ${C.border}`:"none",alignItems:"center"}}>
              <div><div style={{fontWeight:500,fontSize:13}}>{c.name}</div>{c.notes&&<div style={{fontSize:11,color:C.muted}}>{c.notes}</div>}</div>
              <div style={{fontSize:12,color:C.muted}}>{c.contact_name||"—"}</div>
              <div style={{fontSize:13,fontWeight:500,color:c.stage==="Active"?C.green:C.text}}>{fmtK(c.monthly_spend||0)}</div>
              <select value={c.stage} onChange={e=>movePipelineStage(c.id,e.target.value)} style={{fontSize:11,padding:"2px 6px",borderRadius:4,border:`0.5px solid ${C.border}`,background:C.bg}}>{PIPELINE_STAGES.map(s=><option key={s}>{s}</option>)}</select>
              <div style={{fontSize:12,color:C.muted}}>{c.partner_name}</div>
              <div style={{fontSize:12,color:C.muted}}>{(c.created_at||"").slice(0,10)}</div>
            </div>)}
            <div style={{padding:"10px 16px",background:C.bg2,borderTop:`0.5px solid ${C.border}`,display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:500}}>
              <span style={{color:C.muted}}>Total active AUM</span>
              <span style={{color:C.green}}>{fmtK(pipeline.filter(c=>c.type===(view==="admin-brands"?"brand":"agency")&&c.stage==="Active").reduce((s,c)=>s+(c.monthly_spend||0),0))}/mo</span>
            </div>
          </Card>}
      </div>}

      {view==="approvals"&&<div>
        <h2 style={{margin:"0 0 4px",fontSize:18,fontWeight:500}}>Client approvals</h2>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Clients submitted by partners awaiting your approval</div>
        {pendingApprovals.length===0?<EmptyState icon="check-circle" title="No pending approvals" sub="Clients in Review stage will appear here."/>
        :pendingApprovals.map(c=><Card key={c.id} style={{padding:14,marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <Pill label={c.type==="brand"?"Brand":"Agency"} bg={C.blueBg} fg={C.blue}/>
            <div style={{flex:1}}><div style={{fontWeight:500,fontSize:13}}>{c.name}</div><div style={{fontSize:11,color:C.muted}}>Partner: {c.partner_name} · {c.contact_name||""} · {fmtK(c.monthly_spend||0)}/mo</div>{c.notes&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>{c.notes}</div>}</div>
            <Btn onClick={()=>movePipelineStage(c.id,"Approved")} color={C.green} small>Approve</Btn>
            <Btn onClick={()=>movePipelineStage(c.id,"Lead")} color={C.red} small>Reject</Btn>
          </div>
        </Card>)}
      </div>}

      {view==="comp-tracking"&&<div>
        <h2 style={{margin:"0 0 4px",fontSize:18,fontWeight:500}}>Compensation tracking</h2>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Active client ad spend per partner · 10% revenue share</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          <StatBox label="Total active AUM" value={fmtK(pipeline.filter(c=>c.stage==="Active").reduce((s,c)=>s+(c.monthly_spend||0),0))} icon="chart-bar"/>
          <StatBox label="Monthly comp due" value={fmt$(pipeline.filter(c=>c.stage==="Active").reduce((s,c)=>s+(c.monthly_spend||0),0)*REV_RATE)} icon="currency-dollar" green/>
          <StatBox label="Total paid (all time)" value={fmt$(payouts.reduce((s,p)=>s+(p.amount||0),0))} icon="cash" green/>
          <StatBox label="Active partners" value={active.length} icon="users"/>
        </div>
        {partners.map(p=>{
          const myClients=pipeline.filter(c=>c.partner_id===p.id&&c.stage==="Active");
          const myAUM=myClients.reduce((s,c)=>s+(c.monthly_spend||0),0);
          const myPaid=payouts.filter(py=>py.partner_id===p.id).reduce((s,py)=>s+(py.amount||0),0);
          return <Card key={p.id} style={{marginBottom:12,overflow:"hidden"}}>
            <div style={{padding:"12px 16px",borderBottom:`0.5px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
              <Avatar name={p.name} size={36}/><div style={{flex:1}}><div style={{fontWeight:500,fontSize:13}}>{p.name}{p.agency?` · ${p.agency}`:""}</div><div style={{fontSize:11,color:C.muted}}>{p.vertical} · {myClients.length} active clients</div></div>
              <StatusPill s={p.status}/>
              <Btn onClick={()=>{setPayoutModal(p.id);setView("partner-mgmt");setSelected(p);}} color={C.green} small>+ Record payout</Btn>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)"}}>
              {[{l:"Active clients",v:myClients.length},{l:"Active AUM/mo",v:fmtK(myAUM)},{l:"Annual AUM",v:fmtK(myAUM*12)},{l:"Monthly comp (10%)",v:fmt$(myAUM*REV_RATE),green:true},{l:"Total paid out",v:fmt$(myPaid),green:true}].map((m,i)=><div key={m.l} style={{padding:"10px 16px",borderRight:i<4?`0.5px solid ${C.border}`:"none"}}><div style={{fontSize:11,color:C.muted,marginBottom:3}}>{m.l}</div><div style={{fontSize:15,fontWeight:500,color:m.green?C.green:C.text}}>{m.v}</div></div>)}
            </div>
          </Card>;
        })}
      </div>}

      {view==="payouts"&&<div>
        <h2 style={{margin:"0 0 4px",fontSize:18,fontWeight:500}}>Payout records</h2>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>All recorded payouts across all partners</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          <StatBox label="Total paid (all time)" value={fmt$(payouts.reduce((s,p)=>s+(p.amount||0),0))} icon="cash" green/>
          <StatBox label="Paid this month" value={fmt$(payouts.filter(p=>{const d=new Date(p.created_at);const n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();}).reduce((s,p)=>s+(p.amount||0),0))} icon="calendar" green/>
          <StatBox label="Total payout records" value={payouts.length} icon="list"/>
        </div>
        {payouts.length===0?<EmptyState icon="cash" title="No payouts recorded yet" sub="Record payouts from Partner Management."/>
        :<Card style={{overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr 1fr",padding:"10px 16px",background:C.bg2,borderBottom:`0.5px solid ${C.border}`,fontSize:11,fontWeight:500,color:C.muted}}><span>Date</span><span>Partner</span><span>Period</span><span>Amount</span><span>Reference</span><span>Notes</span></div>
          {payouts.map((p,i,arr)=><div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr 1fr",padding:"11px 16px",borderBottom:i<arr.length-1?`0.5px solid ${C.border}`:"none",alignItems:"center",fontSize:13}}>
            <span style={{color:C.muted,fontSize:12}}>{fmtDate(p.created_at)}</span>
            <span style={{fontWeight:500}}>{p.partner_name}</span>
            <span style={{fontSize:12}}>{p.period_label||"—"}</span>
            <span style={{fontWeight:500,color:C.green}}>{fmt$(p.amount)}</span>
            <span style={{fontSize:12,fontFamily:"monospace",color:C.muted}}>{p.reference||"—"}</span>
            <span style={{fontSize:12,color:C.muted}}>{p.notes||"—"}</span>
          </div>)}
          <div style={{padding:"10px 16px",background:C.bg2,borderTop:`0.5px solid ${C.border}`,display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:500}}>
            <span style={{color:C.muted}}>Grand total</span>
            <span style={{color:C.green}}>{fmt$(payouts.reduce((s,p)=>s+(p.amount||0),0))}</span>
          </div>
        </Card>}
      </div>}

      {view==="content-mgmt"&&<div>
        <SectionHead title="Content management" action={<Btn onClick={()=>setShowAddResource(s=>!s)} color={showAddResource?undefined:C.blue}>{showAddResource?"Cancel":"+ Add resource"}</Btn>}/>
        {showAddResource&&<Card style={{padding:16,marginBottom:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <F label="Title *"><input value={newResource.title} onChange={e=>setNewResource(r=>({...r,title:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}/></F>
            <F label="Type"><select value={newResource.type} onChange={e=>setNewResource(r=>({...r,type:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}>{["pdf","video","pptx","docx","article"].map(t=><option key={t}>{t}</option>)}</select></F>
            <F label="Category"><select value={newResource.category} onChange={e=>setNewResource(r=>({...r,category:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}>{["training","sops","documents"].map(c=><option key={c}>{c}</option>)}</select></F>
            <F label="Description"><input value={newResource.description} onChange={e=>setNewResource(r=>({...r,description:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}/></F>
            <F label="URL (link to file)" full><input value={newResource.url} onChange={e=>setNewResource(r=>({...r,url:e.target.value}))} placeholder="https://…" style={{width:"100%",boxSizing:"border-box"}}/></F>
          </div>
          <div style={{display:"flex",gap:8}}><Btn onClick={addResource} color={C.blue}>Add resource</Btn><Btn onClick={()=>setShowAddResource(false)}>Cancel</Btn></div>
        </Card>}
        {["training","sops","documents"].map(cat=><div key={cat} style={{marginBottom:20}}>
          <div style={{fontWeight:500,fontSize:13,color:C.muted,marginBottom:8,textTransform:"capitalize"}}>{cat} ({resources.filter(r=>r.category===cat).length})</div>
          {resources.filter(r=>r.category===cat).length===0?<div style={{fontSize:13,color:C.muted,padding:"8px 0"}}>None yet.</div>
          :resources.filter(r=>r.category===cat).map(r=><Card key={r.id} style={{padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
            <i className={`ti ti-${r.type==="video"?"player-play":"file-text"}`} style={{fontSize:18,color:C.blue}}/>
            <div style={{flex:1}}><div style={{fontWeight:500,fontSize:13}}>{r.title}</div><div style={{fontSize:11,color:C.muted}}>{r.type?.toUpperCase()} · {r.category} · {r.description}</div>{r.url&&<div style={{fontSize:11,color:C.blue,marginTop:2}}>{r.url}</div>}</div>
            <Btn onClick={()=>deleteResource(r.id)} color={C.red} small>Delete</Btn>
          </Card>)}
        </div>)}
      </div>}

      {view==="announcements"&&<div>
        <SectionHead title="Announcements" sub="Visible on all partner dashboards" action={<Btn onClick={()=>setShowAddAnn(s=>!s)} color={showAddAnn?undefined:C.blue}>{showAddAnn?"Cancel":"+ New announcement"}</Btn>}/>
        {showAddAnn&&<Card style={{padding:16,marginBottom:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <F label="Title *"><input value={newAnnouncement.title} onChange={e=>setNewAnnouncement(a=>({...a,title:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}/></F>
            <F label="Type"><select value={newAnnouncement.type} onChange={e=>setNewAnnouncement(a=>({...a,type:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}>{["info","warning","success"].map(t=><option key={t}>{t}</option>)}</select></F>
            <F label="Body *" full><textarea value={newAnnouncement.body} onChange={e=>setNewAnnouncement(a=>({...a,body:e.target.value}))} rows={3} style={{width:"100%",boxSizing:"border-box",resize:"vertical",padding:"7px 10px",border:`0.5px solid ${C.border2}`,borderRadius:7,fontFamily:"inherit",fontSize:13}}/></F>
          </div>
          <div style={{display:"flex",gap:8}}><Btn onClick={addAnnouncement} color={C.blue}>Post announcement</Btn><Btn onClick={()=>setShowAddAnn(false)}>Cancel</Btn></div>
        </Card>}
        {announcements.length===0?<EmptyState icon="bell" title="No announcements yet" sub="Post announcements that appear on all partner dashboards."/>
        :announcements.map(a=><Card key={a.id} style={{padding:14,marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Pill label={a.type} bg={a.type==="warning"?C.amberBg:a.type==="success"?C.greenBg:C.blueBg} fg={a.type==="warning"?C.amber:a.type==="success"?C.green:C.blue}/>
            <div style={{flex:1}}><div style={{fontWeight:500,fontSize:13}}>{a.title}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{a.body}</div></div>
            <Pill label={a.active?"Live":"Hidden"} bg={a.active?C.greenBg:C.bg2} fg={a.active?C.green:C.muted}/>
            <Btn onClick={()=>toggleAnnouncement(a.id,!a.active)} small>{a.active?"Hide":"Show"}</Btn>
            <Btn onClick={()=>deleteAnnouncement(a.id)} color={C.red} small>Delete</Btn>
          </div>
        </Card>)}
      </div>}

      {view==="slack"&&<div>
        <h2 style={{margin:"0 0 20px",fontSize:18,fontWeight:500}}>Slack</h2>
        {openTickets.length>0&&<Card style={{padding:16,marginBottom:14}}>
          <div style={{fontWeight:500,fontSize:14,marginBottom:12,display:"flex",alignItems:"center",gap:8}}><i className="ti ti-help-circle" style={{fontSize:15,color:C.amber}}/>Open tickets ({openTickets.length})</div>
          {openTickets.map(t=><div key={t.id} style={{padding:"10px 0",borderBottom:`0.5px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><Pill label={t.type} bg={C.blueBg} fg={C.blue}/><span style={{fontWeight:500,fontSize:13,flex:1}}>{t.subject}</span><span style={{fontSize:12,color:C.muted}}>{t.partner_name}</span></div>
            {t.details&&<div style={{fontSize:12,color:C.muted,marginBottom:8}}>{t.details}</div>}
            <div style={{display:"flex",gap:8}}>
              <input value={ticketReply[t.id]||""} onChange={e=>setTicketReply(r=>({...r,[t.id]:e.target.value}))} placeholder="Reply and close…" style={{flex:1,fontSize:12,padding:"5px 10px",borderRadius:6,border:`0.5px solid ${C.border2}`}}/>
              <Btn onClick={()=>replyTicket(t.id)} color={C.green} small>Reply & close</Btn>
            </div>
          </div>)}
        </Card>}
        <Card style={{padding:20}}>
          <div style={{fontWeight:500,fontSize:13,marginBottom:12}}>Notification log</div>
          <div style={{background:C.bg2,borderRadius:10,padding:12,maxHeight:240,overflowY:"auto",display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
            {slackMsgs.length===0&&<div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"2rem 0"}}>No notifications sent this session.</div>}
            {slackMsgs.map((m,i)=><div key={i} style={{background:C.bg,borderRadius:8,padding:"10px 12px",border:`0.5px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,fontWeight:500,color:C.blue}}>{m.channel}</span><span style={{fontSize:11,color:C.muted}}>{m.time}</span></div>
              <div style={{fontSize:13}}>{m.message}</div>
            </div>)}
          </div>
          <div style={{display:"flex",gap:8}}>
            <select value={slackCh} onChange={e=>setSlackCh(e.target.value)} style={{fontSize:12,padding:"6px 10px",borderRadius:8,border:`0.5px solid ${C.border}`,background:C.bg}}><option>#partner-revenue</option><option>#partner-payouts</option><option>#partner-updates</option></select>
            <input value={slackMsg} onChange={e=>setSlackMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&slackMsg.trim()){sendSlack(slackCh,slackMsg);setSlackMsg("");}}} placeholder="Send message…" style={{flex:1}}/>
            <Btn onClick={()=>{if(slackMsg.trim()){sendSlack(slackCh,slackMsg);setSlackMsg("");}}} color={C.blue}>Send</Btn>
          </div>
        </Card>
      </div>}

    </div>
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
    setSession(s=>({...s,partner:{...s.partner,onboarded:true,status:"Active"}}));
  };
  if(!session)return <Login onLogin={handleLogin}/>;
  if(session.role==="admin")return <AdminApp onLogout={()=>setSession(null)}/>;
  if(!session.partner.onboarded)return <Onboarding partner={session.partner} onComplete={completeOnboarding}/>;
  return <PartnerApp partner={session.partner} onLogout={()=>setSession(null)}/>;
}
