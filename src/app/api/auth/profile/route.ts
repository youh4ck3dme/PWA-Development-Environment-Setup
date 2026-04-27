import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureUserProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

const bootstrapProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(80).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = bootstrapProfileSchema.parse(await request.json().catch(() => ({})));

  await ensureUserProfile(supabase, user, {
    fullName: body.fullName,
    avatarUrl: body.avatarUrl || undefined,
  });

  return NextResponse.json({ ok: true });
}