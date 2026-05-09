import "server-only";

import type { ResolvedStreamPractitioner } from "@/lib/stream/practitioner";
import { practitionerStreamDisplayName } from "@/lib/stream/practitioner";
import { createServiceSupabaseClient } from "@/lib/supabase/admin";

export type StreamUpsertRecipient = {
  id: string;
  name: string;
};

/** Every admin (or legacy `role = admin`) receives consultation DM channels alongside the customer. */
export async function loadConsultRecipientStreamProfiles(): Promise<StreamUpsertRecipient[]> {
  const sb = createServiceSupabaseClient();
  const { data, error } = await sb
    .from("users")
    .select("id, full_name, email, is_admin, role")
    .or("is_admin.eq.true,role.eq.admin");

  if (error) {
    throw new Error(`Failed to load Stream admin recipients: ${error.message}`);
  }

  const byId = new Map<string, StreamUpsertRecipient>();
  for (const row of data ?? []) {
    const name =
      row.full_name?.trim() ||
      row.email?.trim() ||
      (row.role === "admin" ? `Admin (${row.id.slice(0, 8)}…)` : "Advisor");
    byId.set(row.id, { id: row.id, name });
  }
  return [...byId.values()];
}

/** Stream users to add to consult-{clientUuid} besides the customer. Prefer DB admins; fallback to env practitioner. */
export async function resolveConsultRecipientsForStream(
  practitionerFallback: ResolvedStreamPractitioner,
): Promise<StreamUpsertRecipient[]> {
  const admins = await loadConsultRecipientStreamProfiles();
  if (admins.length > 0) {
    const seen = new Set<string>();
    return admins.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }

  return [
    {
      id: practitionerFallback.streamUserId,
      name: practitionerStreamDisplayName(practitionerFallback.profileFullName),
    },
  ];
}
