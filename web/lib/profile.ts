// What a visitor has told us, remembered in their own browser so every page can greet them by name,
// fill in forms for them and pick up where they left off. It never leaves the browser from here;
// the forms send it to us only when the visitor submits them. "Not you?" forgets it all.
export type Stage = "demo" | "signup" | "paid" | "agency";
export type Profile = {
  name?: string; email?: string; phone?: string; business?: string; website?: string;
  industry?: string; market?: string; goals?: string; budget?: string; formats?: string;
  stage?: Stage; setup?: string; // the client's private setup page id, once they have paid
  updated?: number;
};

const KEY = "dsp_profile";
const RANK: Record<Stage, number> = { demo: 1, agency: 1, signup: 2, paid: 3 };
const EVENT = "dsp-profile";

export function readProfile(): Profile {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch { return {}; }
}

export function saveProfile(p: Profile) {
  const cur = readProfile();
  const next: Profile = { ...cur };
  for (const [k, v] of Object.entries(p) as [keyof Profile, unknown][]) {
    if (v === undefined || v === null || v === "") continue;
    if (k === "stage" && cur.stage && RANK[cur.stage] > RANK[v as Stage]) continue; // never step backwards
    (next as Record<string, unknown>)[k] = typeof v === "string" ? v.slice(0, 300) : v;
  }
  next.updated = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(next)); window.dispatchEvent(new Event(EVENT)); } catch {}
}

/** Forgets everything about this visitor in this browser, including who the chat thinks they are. */
export function forgetProfile() {
  try { localStorage.removeItem(KEY); localStorage.removeItem("dsp_who"); window.dispatchEvent(new Event(EVENT)); } catch {}
  const w = window as Window & { Intercom?: (cmd: string, data?: Record<string, unknown>) => void; intercomSettings?: Record<string, unknown> };
  fetch("/api/chat/forget", { method: "POST" }).catch(() => {});
  try {
    const { api_base, app_id } = w.intercomSettings || {};
    w.intercomSettings = { api_base, app_id };
    w.Intercom?.("shutdown"); w.Intercom?.("boot", { api_base, app_id });
  } catch {}
}

export const onProfile = (fn: () => void) => { window.addEventListener(EVENT, fn); window.addEventListener("storage", fn); return () => { window.removeEventListener(EVENT, fn); window.removeEventListener("storage", fn); }; };
export const firstName = (p: Profile) => (p.name || "").trim().split(/\s+/)[0] || "";
