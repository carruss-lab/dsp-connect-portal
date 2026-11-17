"use client";
import { useEffect } from "react";
import { identify } from "@/lib/identify";

/** On a client's private setup page, tells the chat who they are, so their checklist and messages follow them. */
export default function IdentifyClient({ email, name }: { email: string; name?: string | null }) {
  useEffect(() => { identify(email, name); }, [email, name]);
  return null;
}
