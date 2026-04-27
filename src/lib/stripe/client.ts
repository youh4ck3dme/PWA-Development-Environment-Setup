import Stripe from "stripe";
import { assertStripeEnv } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripeServerClient() {
  if (!stripeClient) {
    const env = assertStripeEnv();
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-04-22.dahlia",
      appInfo: {
        name: "Offline Inventory",
      },
    });
  }

  return stripeClient;
}
