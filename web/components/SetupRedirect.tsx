"use client";
import { useEffect, useState } from "react";
import { readProfile } from "@/lib/profile";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function SetupRedirect() {
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    const id = readProfile().setup;
    if (id && ID.test(id)) window.location.replace(`/welcome?id=${id}`);
    else setMissing(true);
  }, []);
  if (!missing) return <p>Opening your setup page…</p>;
  return (
    <>
      <h1>Your setup page</h1>
      <p>Your setup page has a private link that we emailed to you when you paid, in the message titled &ldquo;Payment received. Your DSP Connect setup has started&rdquo;. Open that link to finish your campaign brief.</p>
      <p>Can&rsquo;t find it? Ask us in the chat and we will send it again.</p>
    </>
  );
}
