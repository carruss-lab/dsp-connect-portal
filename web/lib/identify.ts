// Tells the chat who a person is once they give us their email, and remembers it in this browser,
// so the Messenger, Fin and the team see the same contact the server created, on every later visit.
type W = Window & { Intercom?: (cmd: string, data?: Record<string, unknown>) => void; intercomSettings?: Record<string, unknown> };
const KEY = "dsp_who";

export function identify(email: string, name?: string | null) {
  const e = (email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return;
  const who = { user_id: e, email: e, ...(name ? { name: String(name).slice(0, 120) } : {}) };
  try { localStorage.setItem(KEY, JSON.stringify(who)); } catch {}
  const w = window as W;
  w.intercomSettings = { ...(w.intercomSettings || {}), ...who };
  let tries = 0;
  const t = setInterval(() => {
    if (w.Intercom) { w.Intercom("update", who); clearInterval(t); }
    else if (++tries > 20) clearInterval(t);
  }, 500);
}
