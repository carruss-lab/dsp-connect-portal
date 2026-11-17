// Keeps Intercom's record of each person in step with ours, so Fin and the team see
// who they are talking to. Does nothing until INTERCOM_ACCESS_TOKEN is set.
type Person = {
  email: string; name?: string | null; role: "prospect" | "client" | "agency" | "managing_partner";
  status?: "lead" | "paid_in_setup" | "live" | "paused"; setupDue?: string | null; industry?: string | null; market?: string | null;
  /** Extra facts for Fin, for example setup progress and budget left. */
  extra?: Record<string, string | number>;
};

export async function syncPerson(p: Person) {
  const token = process.env.INTERCOM_ACCESS_TOKEN;
  if (!token || !p.email) return;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json", "Intercom-Version": "2.11" };
  const custom_attributes: Record<string, string | number> = { customer_role: p.role };
  if (p.status) custom_attributes.account_status = p.status;
  if (p.industry) custom_attributes.industry = p.industry;
  if (p.market) custom_attributes.market = p.market;
  if (p.setupDue) custom_attributes.setup_due = Math.floor(new Date(p.setupDue + "T12:00:00Z").getTime() / 1000);
  Object.assign(custom_attributes, p.extra || {});
  const body = { email: p.email, ...(p.name ? { name: p.name } : {}), custom_attributes };
  try {
    const found = await fetch("https://api.intercom.io/contacts/search", {
      method: "POST", headers, body: JSON.stringify({ query: { field: "email", operator: "=", value: p.email } }),
    });
    const id = found.ok ? (await found.json())?.data?.[0]?.id : null;
    const res = id
      ? await fetch(`https://api.intercom.io/contacts/${id}`, { method: "PUT", headers, body: JSON.stringify(body) })
      : await fetch("https://api.intercom.io/contacts", { method: "POST", headers, body: JSON.stringify({ role: p.role === "prospect" ? "lead" : "user", ...body }) });
    if (!res.ok) console.error("intercom sync failed", res.status, await res.text());
    else console.log("intercom synced", p.role, id ? "updated" : "created");
  } catch (err) {
    console.error("intercom sync failed", err);
  }
}

/** The facts we keep on each person for Fin. Creates any that Intercom does not have yet. */
const ATTRIBUTES: [string, "string" | "float" | "date"][] = [
  ["setup_progress", "string"], ["budget_remaining", "float"], ["spend_last_7_days", "float"], ["budget_days_left", "float"], ["went_live", "date"], ["setup_details_received", "string"],
];
export async function ensureAttributes() {
  const token = process.env.INTERCOM_ACCESS_TOKEN;
  if (!token) return;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json", "Intercom-Version": "2.11" };
  try {
    const have = await fetch("https://api.intercom.io/data_attributes?model=contact", { headers });
    const names = new Set<string>(have.ok ? ((await have.json())?.data || []).map((a: { name: string }) => a.name) : []);
    for (const [name, data_type] of ATTRIBUTES) {
      if (names.has(name)) continue;
      const res = await fetch("https://api.intercom.io/data_attributes", { method: "POST", headers, body: JSON.stringify({ name, model: "contact", data_type }) });
      if (!res.ok) console.error("intercom attribute failed", name, res.status, await res.text());
    }
  } catch (err) {
    console.error("intercom attributes failed", err);
  }
}
