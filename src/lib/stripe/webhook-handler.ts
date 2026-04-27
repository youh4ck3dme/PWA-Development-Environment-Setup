import Stripe from "stripe";
import { getStripeServerClient } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

async function persistCheckoutSession(session: Stripe.Checkout.Session) {
  const ownerId = session.metadata?.userId ?? session.client_reference_id;

  if (!ownerId) {
    return {
      persisted: false as const,
      reason: "missing_owner_id",
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("checkout_sessions").upsert(
    {
      owner_id: ownerId,
      stripe_checkout_session_id: session.id,
      payment_status: session.payment_status,
    },
    {
      onConflict: "stripe_checkout_session_id",
    }
  );

  if (error) {
    throw error;
  }

  return {
    persisted: true as const,
    ownerId,
    paymentStatus: session.payment_status,
  };
}

async function grantProEntitlement(ownerId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_pro: true, pro_unlocked_at: new Date().toISOString() })
    .eq("id", ownerId)
    .is("is_pro", false); // idempotent: only update if not already Pro

  if (error) {
    throw error;
  }
}

export async function handleStripeWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const persistence = await persistCheckoutSession(session);

      if (
        persistence.persisted &&
        (session.payment_status === "paid" ||
          session.payment_status === "no_payment_required")
      ) {
        await grantProEntitlement(persistence.ownerId);
      }

      return {
        type: event.type,
        checkoutSessionId: session.id,
        paymentStatus: session.payment_status,
        persistence,
      };
    }
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      const persistence = await persistCheckoutSession(session);

      if (persistence.persisted) {
        await grantProEntitlement(persistence.ownerId);
      }

      return {
        type: event.type,
        checkoutSessionId: session.id,
        paymentStatus: session.payment_status,
        persistence,
      };
    }
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const persistence = await persistCheckoutSession(session);
      return {
        type: event.type,
        checkoutSessionId: session.id,
        paymentStatus: session.payment_status,
        persistence,
      };
    }
    default:
      return {
        type: event.type,
        ignored: true,
      };
  }
}

export function verifyStripeWebhookSignature(payload: string, signature: string, secret: string) {
  const stripe = getStripeServerClient();
  return stripe.webhooks.constructEvent(payload, signature, secret);
}
