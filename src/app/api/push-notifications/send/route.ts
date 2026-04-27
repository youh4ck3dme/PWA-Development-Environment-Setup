import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendPushNotificationToUser } from "@/lib/pwa/server-push";

const sendNotificationSchema = z.object({
  title: z.string().min(1).max(80),
  body: z.string().min(1).max(180),
  url: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = sendNotificationSchema.parse(await request.json());
  const result = await sendPushNotificationToUser(user.id, payload);

  return NextResponse.json({ sent: result.delivered });
}
