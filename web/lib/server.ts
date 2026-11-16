// Server-side calls to the database. The secret never reaches the browser.
const URL_ = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

export async function rest(path: string, init: RequestInit & { jwt?: string } = {}) {
  if (!URL_ || !KEY) throw new Error("database not configured");
  const { jwt, ...rest_ } = init;
  return fetch(`${URL_}/rest/v1/${path}`, {
    ...rest_,
    headers: { apikey: KEY, Authorization: `Bearer ${jwt || KEY}`, "Content-Type": "application/json", ...(rest_.headers || {}) },
    cache: "no-store",
  });
}

/** Calls a database function that only the server may use. */
export async function secretRpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const secret = process.env.SERVER_SECRET;
  if (!secret) throw new Error("server secret not configured");
  const res = await rest(`rpc/${name}`, { method: "POST", body: JSON.stringify({ p_secret: secret, ...args }) });
  if (!res.ok) throw new Error(`${name} failed: ${res.status} ${await res.text()}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

/** The email of the signed-in person behind a session token, or null. */
export async function authEmail(jwt: string): Promise<string | null> {
  if (!URL_ || !KEY) return null;
  const res = await fetch(`${URL_}/auth/v1/user`, { headers: { apikey: KEY, Authorization: `Bearer ${jwt}` }, cache: "no-store" });
  return res.ok ? ((await res.json()).email as string) || null : null;
}

export const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
