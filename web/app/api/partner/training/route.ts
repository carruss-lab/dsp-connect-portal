import { NextResponse } from "next/server";
import { session } from "@/lib/partner";
import { secretRpc } from "@/lib/server";
import { LESSON_IDS } from "@/lib/training";

export async function POST(req: Request) {
  const { lesson } = (await req.json().catch(() => ({}))) as { lesson?: string };
  if (!lesson || !LESSON_IDS.includes(lesson)) return NextResponse.json({ error: "Unknown lesson." }, { status: 400 });
  const ok = await secretRpc<boolean>("partner_training_done", { p_session: await session(), p_module: lesson, p_all: LESSON_IDS }).catch(() => false);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Please sign in again." }, { status: 401 });
}
