"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MEETING_URL } from "@/lib/site";
import { firstName, forgetProfile, onProfile, readProfile, saveProfile, type Profile } from "@/lib/profile";

/** Reads the visitor's remembered details after the page loads, and stays current when they change. */
export function useProfile(): Profile | null {
  const [p, setP] = useState<Profile | null>(null);
  useEffect(() => { setP(readProfile()); return onProfile(() => setP(readProfile())); }, []);
  return p;
}

const demoLink = (p: Profile) => `/demo?${new URLSearchParams({ industry: p.industry || "", market: p.market || "" })}`;

/** A slim welcome-back line under the header, with the visitor's next step. */
export function WelcomeBar() {
  const p = useProfile();
  if (!p) return null;
  const name = firstName(p);
  // Show it to anyone who has told us something: most demo visitors give only an email, industry and area.
  if (!name && !p.business && !p.stage && !p.email) return null;
  let next: [string, string] | null = null;
  if (p.stage === "paid" && p.setup) next = ["Go to your setup page", `/welcome?id=${p.setup}`];
  else if (p.stage === "signup") next = ["Finish opening your account", "/open-account"];
  else if (p.stage === "demo") next = [p.industry && p.market ? `Your ${p.industry.toLowerCase()} demo for ${p.market}` : "Back to your demo", demoLink(p)];
  else if (p.stage === "agency") next = ["Book a call about the agency program", MEETING_URL];
  return (
    <div style={{ background: "#EEF0FF", borderBottom: "1px solid #DADDF7", fontSize: 14 }}>
      <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", alignItems: "center", padding: "8px 32px" }}>
        <span>Welcome back{name ? `, ${name}` : ""}.{p.stage !== "agency" && (p.business || p.industry) ? ` Ads for ${p.business || `your ${p.industry!.toLowerCase()} business`}${p.market ? ` in ${p.market}` : ""}.` : ""}</span>
        {next && <Link href={next[1]} style={{ fontWeight: 600 }}>{next[0]} →</Link>}
        {p.stage === "demo" && <Link href="/open-account" style={{ fontWeight: 600 }}>Open your account →</Link>}
        <button onClick={forgetProfile} style={{ marginLeft: "auto", background: "none", border: 0, color: "#5B6577", cursor: "pointer", fontSize: 13, textDecoration: "underline" }}>Not you?</button>
      </div>
    </div>
  );
}

/** Text that changes with what we know, e.g. a heading that uses the visitor's name. */
export function Hello({ withName, fallback }: { withName: string; fallback: string }) {
  const p = useProfile();
  const name = p ? firstName(p) : "";
  const biz = p?.business || "";
  if (!p || (!name && withName.includes("{name}")) || (!biz && withName.includes("{business}"))) return <>{fallback}</>;
  return <>{withName.replace("{name}", name).replace("{business}", biz).replace("{market}", p.market || "your area")}</>;
}

/** On an industry page: a line for visitors from that industry, pointing at their own demo. */
export function IndustryNote({ industry }: { industry: string }) {
  const p = useProfile();
  if (!p || p.industry !== industry) return null;
  const name = firstName(p);
  return (
    <p className="note note-ok" style={{ maxWidth: 720 }}>
      {name ? `${name}, this` : "This"} is the page for {p.business || "businesses like yours"}{p.market ? ` in ${p.market}` : ""}.{" "}
      <Link href={demoLink(p)} style={{ fontWeight: 600 }}>Open your demo set up for it →</Link>
    </p>
  );
}

/** Remembers details a page already knows, e.g. the industry and area a demo was opened for. */
export function Remember(p: Profile) {
  const key = JSON.stringify(p);
  useEffect(() => { saveProfile(JSON.parse(key)); }, [key]);
  return null;
}
