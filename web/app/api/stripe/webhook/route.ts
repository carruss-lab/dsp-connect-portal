import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { markPaid, stripe } from "@/lib/payments";

// Stripe calls this when a payment completes, including bank transfers that clear days later.
export async function POST(req: Request) {
  const client = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!client || !secret || !sig) return NextResponse.json({ error: "not configured" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = client.webhooks.constructEvent(await req.text(), sig, secret);
  } catch {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const result = await markPaid(event.data.object as Stripe.Checkout.Session);
    if (result === "error") return NextResponse.json({ error: "could not record payment" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
