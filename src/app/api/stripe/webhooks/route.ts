import { NextResponse } from "next/server";
import { assertStripeEnv } from "@/lib/env";
import {
  handleStripeWebhookEvent,
  verifyStripeWebhookSignature,
} from "@/lib/stripe/webhook-handler";

export async function POST(request: Request) {
  const env = assertStripeEnv();
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe signature." }, { status: 400 });
  }

  try {
    const event = verifyStripeWebhookSignature(payload, signature, env.STRIPE_WEBHOOK_SECRET);
    const result = await handleStripeWebhookEvent(event);

    return NextResponse.json({ received: true, result });
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }
}
