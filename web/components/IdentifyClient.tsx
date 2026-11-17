"use client";
import { useEffect } from "react";

type W = Window & { Intercom?: (cmd: string, data?: Record<string, unknown>) => void; intercomSettings?: Record<string, unknown> };

/** On a client's private setup page, tells the chat who they are, so their checklist and messages follow them. */
export default function IdentifyClient({ email, name }: { email: string; name?: string | null }) {
  useEffect(() => {
    const w = window as W;
    const who = { email, ...(name ? { name } : {}) };
    w.intercomSettings = { ...(w.intercomSettings || {}), ...who };
    let tries = 0;
    const t = setInterval(() => {
      if (w.Intercom) { w.Intercom("update", who); clearInterval(t); }
      else if (++tries > 20) clearInterval(t);
    }, 500);
    return () => clearInterval(t);
  }, [email, name]);
  return null;
}
