import { createClient } from "@supabase/supabase-js";
import { assertSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function createAdminClient() {
  if (!adminClient) {
    const env = assertSupabaseEnv();
    adminClient = createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return adminClient;
}
