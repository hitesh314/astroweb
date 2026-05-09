import "server-only";

import { PRACTITIONER } from "@/lib/site/practitioner";
import { createServiceSupabaseClient } from "@/lib/supabase/admin";

export type ResolvedStreamPractitioner = {
  streamUserId: string;
  profileFullName: string | null;
};

/** Comma-separated Stream user ids removed when syncing members (default includes legacy bot id). */
export function legacySupportStreamUserIds(): string[] {
  const extra = process.env.STREAM_ASTROLOGER_LEGACY_USER_IDS?.trim();
  const merged = ["astrologer-support", ...(extra ? extra.split(",") : [])]
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(merged)];
}

/**
 * Who acts as practitioner in consultation channels — Stream member id should match Supabase `users.id`.
 *
 * Priority: `STREAM_ASTROLOGER_EMAIL` (lookup in `public.users`) → `STREAM_ASTROLOGER_USER_ID`
 * → fallback `astrologer-support`.
 */
export async function resolveStreamPractitioner(): Promise<ResolvedStreamPractitioner> {
  const email = process.env.STREAM_ASTROLOGER_EMAIL?.trim();
  if (email) {
    const sb = createServiceSupabaseClient();
    const { data, error } = await sb
      .from("users")
      .select("id, full_name, email")
      .ilike("email", email)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(
        `STREAM_ASTROLOGER_EMAIL lookup failed: ${error.message}`,
      );
    }
    if (!data?.id) {
      throw new Error(
        `STREAM_ASTROLOGER_EMAIL (${email}) has no matching public.users row. That account must sign in once so the profile exists, or set STREAM_ASTROLOGER_USER_ID to their Supabase user UUID.`,
      );
    }

    return { streamUserId: data.id, profileFullName: data.full_name ?? null };
  }

  const explicitId = process.env.STREAM_ASTROLOGER_USER_ID?.trim();
  if (explicitId) {
    return { streamUserId: explicitId, profileFullName: null };
  }

  return { streamUserId: "astrologer-support", profileFullName: null };
}

export function practitionerStreamDisplayName(profileFullName: string | null): string {
  const fromEnv = process.env.STREAM_ASTROLOGER_DISPLAY_NAME?.trim();
  if (fromEnv) return fromEnv;
  if (profileFullName?.trim()) return profileFullName.trim();
  return PRACTITIONER.shortName;
}
