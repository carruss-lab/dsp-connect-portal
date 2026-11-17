// Tells the chat who a person is once they have proved it: after they submit a form in this browser
// (the server then holds a signed cookie for them) or on a private page the server has already checked.
// The Messenger is only ever logged in with a JWT the server signed, never with an email the browser claims.
type W = Window & { Intercom?: (cmd: string, data?: Record<string, unknown>) => void; intercomSettings?: Record<string, unknown> };
const KEY = "dsp_who";

/** Asks the server for this browser's signed chat identity; null for an anonymous visitor. */
export async function chatToken(): Promise<string | null> {
  try {
    const r = await fetch("/api/chat/token", { cache: "no-store" });
    return r.ok ? ((await r.json()).jwt as string) || null : null;
  } catch { return null; }
}

export async function identify(email: string, name?: string | null, jwt?: string | null) {
  const e = (email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return;
  // Kept only so the site can greet them; it is not what logs them into the chat.
  try { localStorage.setItem(KEY, JSON.stringify({ email: e, ...(name ? { name: String(name).slice(0, 120) } : {}) })); } catch {}
  const token = jwt || (await chatToken());
  if (!token) return;
  const w = window as W;
  const who = { intercom_user_jwt: token, ...(name ? { name: String(name).slice(0, 120) } : {}) };
  w.intercomSettings = { ...(w.intercomSettings || {}), ...who };
  let tries = 0;
  const t = setInterval(() => {
    if (w.Intercom) { w.Intercom("update", who); clearInterval(t); }
    else if (++tries > 20) clearInterval(t);
  }, 500);
}
