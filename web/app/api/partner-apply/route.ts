import { NextResponse } from "next/server";
import { notifyTeam } from "@/lib/email";

const clean = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "We could not read that. Please try again." }, { status: 400 });
  }
  const email = clean(body.email, 200).toLowerCase();
  const name = clean(body.name, 120);
  if (!name) return NextResponse.json({ error: "Please add your name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (body.independent !== true) return NextResponse.json({ error: "Please confirm you understand this is an independent, commission-only role." }, { status: 400 });

  const row = {
    id: crypto.randomUUID(), name, email,
    phone: clean(body.phone, 40), location: clean(body.location, 160), vertical: clean(body.vertical, 60),
    linkedin: clean(body.linkedin, 200), experience: clean(body.experience, 3000), network: clean(body.network, 3000),
  };
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "This form is not connected yet. Please try again shortly." }, { status: 503 });
  const fail = NextResponse.json({ error: "Something went wrong saving your application. Please try again." }, { status: 502 });
  try {
    const res = await fetch(`${url}/rest/v1/partners`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(row),
    });
    if (!res.ok) { console.error("partner insert failed", res.status, await res.text()); return fail; }
  } catch (err) {
    console.error("partner insert failed", err);
    return fail;
  }
  await notifyTeam("Managing Partner application", { ...row, id: undefined });
  return NextResponse.json({ ok: true });
}
