import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

import { getServerEnv } from "@/lib/env";

/** Bypasses RLS — use only in trusted server code when required. */
export function createServiceSupabaseClient() {
  const env = getServerEnv();
  const sr = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!sr) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set — required for this server operation",
    );
  }
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, sr, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
