import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

interface EnsureUserProfileOptions {
  fullName?: string | null;
  avatarUrl?: string | null;
}

function resolveFullName(user: User, explicitFullName?: string | null) {
  if (explicitFullName && explicitFullName.trim().length > 0) {
    return explicitFullName.trim();
  }

  const metadata = user.user_metadata;

  if (typeof metadata?.full_name === "string" && metadata.full_name.trim().length > 0) {
    return metadata.full_name.trim();
  }

  if (typeof metadata?.name === "string" && metadata.name.trim().length > 0) {
    return metadata.name.trim();
  }

  const nameFromParts = [metadata?.given_name, metadata?.family_name]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(" ")
    .trim();

  if (nameFromParts.length > 0) {
    return nameFromParts;
  }

  if (user.email) {
    return user.email.split("@")[0] ?? null;
  }

  return null;
}

function resolveAvatarUrl(user: User, explicitAvatarUrl?: string | null) {
  if (explicitAvatarUrl && explicitAvatarUrl.trim().length > 0) {
    return explicitAvatarUrl.trim();
  }

  const metadata = user.user_metadata;

  if (typeof metadata?.avatar_url === "string" && metadata.avatar_url.trim().length > 0) {
    return metadata.avatar_url.trim();
  }

  if (typeof metadata?.picture === "string" && metadata.picture.trim().length > 0) {
    return metadata.picture.trim();
  }

  return null;
}

export async function ensureUserProfile(
  supabase: SupabaseClient<Database>,
  user: User,
  options: EnsureUserProfileOptions = {}
) {
  const fullName = resolveFullName(user, options.fullName);
  const avatarUrl = resolveAvatarUrl(user, options.avatarUrl);

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      avatar_url: avatarUrl,
    },
    {
      onConflict: "id",
    }
  );

  if (error) {
    throw error;
  }
}