import { createClient } from "@/lib/supabase/client";

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function bootstrapProfile(payload: { fullName?: string; avatarUrl?: string } = {}) {
  const response = await fetch("/api/auth/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Profile bootstrap failed.");
  }
}

export function getAuthCallbackUrl(next = "/dashboard") {
  const callbackUrl = new URL("/api/auth/callback", window.location.origin);
  callbackUrl.searchParams.set("next", next);
  return callbackUrl.toString();
}