"use client";
import { useEffect } from "react";
import { identify } from "@/lib/identify";

/** On a private page the server has already checked (a client's setup page, the partner portal), logs the
 *  chat in as that person with the JWT the server signed for them. */
export default function IdentifyClient({ email, name, jwt }: { email: string; name?: string | null; jwt?: string | null }) {
  useEffect(() => { identify(email, name, jwt); }, [email, name, jwt]);
  return null;
}
