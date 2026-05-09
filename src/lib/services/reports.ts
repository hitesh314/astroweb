import { createServerSupabaseClient } from "@/lib/supabase/server";
import { withRetry } from "@/lib/retry";
import type { Tables } from "@/types/database.types";

/** Paginated astrology reports — RLS restricts to current user unless admin JWT path. */
export async function listAstrologyReports(
  offset: number,
  limit = 15,
): Promise<{ data: Tables<"astrology_reports">[]; error?: string }> {
  const supabase = await createServerSupabaseClient();
  const res = await withRetry(() =>
    supabase
      .from("astrology_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1),
  );

  if (res.error) {
    return { data: [], error: res.error.message };
  }
  return { data: res.data ?? [] };
}
