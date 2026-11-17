"use client";
import { useEffect } from "react";
import { trackPurchase } from "@/lib/analytics";

/** On the thank-you page: records the payment in Google Analytics once, after the tag has loaded. */
export default function TrackPurchase({ id, value }: { id: string; value: number }) {
  useEffect(() => {
    let tries = 0;
    const t = setInterval(() => {
      if ((window as unknown as { gtag?: unknown }).gtag || ++tries > 20) { clearInterval(t); trackPurchase(id, value); }
    }, 300);
    return () => clearInterval(t);
  }, [id, value]);
  return null;
}
