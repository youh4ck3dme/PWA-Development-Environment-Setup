"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { subscribeToPushNotifications } from "@/lib/pwa/push-notifications";

export function PushSubscriptionCard() {
  const [message, setMessage] = useState("Enable push to test wake-up notifications from the server route.");
  const [isWorking, setIsWorking] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Push wake-up flow</p>
      <p className="mt-3 text-sm leading-7 text-slate-300">{message}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={isWorking}
          onClick={async () => {
            try {
              setIsWorking(true);
              const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
              if (!publicKey) {
                throw new Error("Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY");
              }

              const subscription = await subscribeToPushNotifications(publicKey);
              await fetch("/api/push-notifications/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(subscription.toJSON()),
              });

              setMessage("Push subscription stored. You can now send a test wake-up notification.");
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Unable to subscribe to push notifications.");
            } finally {
              setIsWorking(false);
            }
          }}
        >
          <BellRing className="mr-2 size-4" /> Enable push
        </Button>
        <Button
          type="button"
          disabled={isWorking}
          onClick={async () => {
            try {
              setIsWorking(true);
              const response = await fetch("/api/push-notifications/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  title: "Inventory sync wake-up",
                  body: "A queued inventory update is ready to be reviewed.",
                  url: "/items",
                }),
              });

              if (!response.ok) {
                throw new Error("Unable to send test notification.");
              }

              const result = (await response.json()) as { sent: number };
              setMessage(
                result.sent > 0
                  ? `Sent ${result.sent} test notification${result.sent === 1 ? "" : "s"}.`
                  : "No saved subscriptions were available for this user."
              );
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Unable to send test notification.");
            } finally {
              setIsWorking(false);
            }
          }}
        >
          Send test push
        </Button>
      </div>
    </div>
  );
}
