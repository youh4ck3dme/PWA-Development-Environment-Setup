import { NextResponse } from "next/server";
import { z } from "zod";
import { storePushSubscription } from "@/lib/pwa/server-push";

const subscriptionSchema = z.object({
  endpoint: z.url(),
  keys: z.object({
    auth: z.string(),
    p256dh: z.string(),
  }),
});

export async function POST(request: Request) {
  const payload = subscriptionSchema.parse(await request.json());
  await storePushSubscription(payload);

  return NextResponse.json({
    stored: true,
    endpoint: payload.endpoint,
  });
}
