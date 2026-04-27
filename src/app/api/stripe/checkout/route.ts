import { NextResponse } from "next/server";
import { getStripeServerClient } from "@/lib/stripe/client";
import { assertAppEnv, assertStripeEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const env = assertAppEnv();
  const stripeEnv = assertStripeEnv();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const stripe = getStripeServerClient();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: stripeEnv.STRIPE_INVENTORY_PRICE_ID, quantity: 1 }],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=cancelled`,
    client_reference_id: user.id,
    customer_email: user.email,
    metadata: {
      userId: user.id,
    },
  });

  const { error } = await supabase.from("checkout_sessions").insert({
    owner_id: user.id,
    stripe_checkout_session_id: session.id,
    payment_status: session.payment_status,
  });

  if (error) {
    return NextResponse.json(
      { error: "Checkout session was created, but persistence failed." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url, id: session.id });
}
