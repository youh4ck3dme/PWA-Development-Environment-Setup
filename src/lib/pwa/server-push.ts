import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

interface StoredPushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

function assertPushEnv() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error("Missing push notification VAPID environment variables.");
  }

  return { publicKey, privateKey };
}

function configureWebPush() {
  const env = assertPushEnv();
  webpush.setVapidDetails("mailto:ops@example.com", env.publicKey, env.privateKey);
  return webpush;
}

export async function storePushSubscription(payload: {
  endpoint: string;
  keys: { auth: string; p256dh: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("notification_subscriptions").upsert(
    {
      owner_id: user.id,
      endpoint: payload.endpoint,
      subscription: payload,
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    throw error;
  }

  return { userId: user.id };
}

export async function sendPushNotificationToUser(userId: string, payload: { title: string; body: string; url?: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notification_subscriptions")
    .select("endpoint, subscription")
    .eq("owner_id", userId);

  if (error) {
    throw error;
  }

  const push = configureWebPush();
  let delivered = 0;

  await Promise.all(
    (data ?? []).map(async (record) => {
      try {
        const subscription = record.subscription as unknown as StoredPushSubscription;
        if (!subscription?.endpoint || !subscription?.keys?.auth || !subscription?.keys?.p256dh) {
          return;
        }

        await push.sendNotification(
          subscription,
          JSON.stringify(payload)
        );
        delivered += 1;
      } catch {
        // Keep failures isolated per endpoint.
      }
    })
  );

  return { delivered };
}
