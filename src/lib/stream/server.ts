import "server-only";

import type { ChannelMemberResponse } from "stream-chat";
import { StreamChat } from "stream-chat";

import { resolveConsultRecipientsForStream } from "@/lib/stream/admin-recipients";
import {
  legacySupportStreamUserIds,
  resolveStreamPractitioner,
} from "@/lib/stream/practitioner";

/** Direct message channel id — one messaging channel per Supabase client user. */
export function streamConsultChannelId(supabaseUserId: string): string {
  return `consult-${supabaseUserId}`;
}

export function getStreamCredentials(): { apiKey: string; secret: string } {
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY?.trim() ?? "";
  const secret = process.env.STREAM_API_SECRET?.trim() ?? "";
  if (!apiKey || !secret) {
    throw new Error("NEXT_PUBLIC_STREAM_API_KEY or STREAM_API_SECRET is not set.");
  }
  return { apiKey, secret };
}

export function getStreamServerClient(): StreamChat {
  const { apiKey, secret } = getStreamCredentials();
  return StreamChat.getInstance(apiKey, secret);
}

function memberUserIds(members: ChannelMemberResponse[]): string[] {
  const ids = members
    .map((m) => m.user_id ?? m.user?.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);
  return [...new Set(ids)];
}

/** Ensure consultation channel membership exactly matches `{ client } ∪ recipients` minus legacy placeholders. */
async function syncConsultChannelMembers(
  api: StreamChat,
  channelId: string,
  requiredUserIds: readonly string[],
): Promise<void> {
  const required = new Set(requiredUserIds);
  const ch = api.channel("messaging", channelId);

  const readMembers = async () => {
    const { members } = await ch.query({ watch: false, state: true });
    return memberUserIds(members ?? []);
  };

  let present = await readMembers();

  for (const id of required) {
    if (!present.includes(id)) {
      await ch.addMembers([id]);
    }
  }

  present = await readMembers();

  const legacies = legacySupportStreamUserIds().filter((id) => !required.has(id));
  for (const legacy of legacies) {
    if (present.includes(legacy)) {
      await ch.removeMembers([legacy]);
    }
  }

  present = await readMembers();
  for (const mid of present) {
    if (!required.has(mid)) {
      await ch.removeMembers([mid]);
    }
  }
}

/**
 * Upsert Stream users and create consultation channel (members: customer + everyone in
 * recipients when `public.users.is_admin`; otherwise env practitioner fallback).
 */
export async function bootstrapStreamConsultRoom(clientUserId: string, clientDisplayName: string) {
  const api = getStreamServerClient();

  const practitioner = await resolveStreamPractitioner();
  const recipients = await resolveConsultRecipientsForStream(practitioner);
  const memberIds = [...new Set([clientUserId, ...recipients.map((r) => r.id)])];

  await api.upsertUsers([
    { id: clientUserId, name: clientDisplayName },
    ...recipients.map((r) => ({ id: r.id, name: r.name })),
  ]);

  const channelId = streamConsultChannelId(clientUserId);
  const exists = await api.queryChannels(
    { type: "messaging", id: channelId },
    { last_message_at: -1 },
    { limit: 1 },
  );

  if (exists.length === 0) {
    const ch = api.channel("messaging", channelId, {
      members: memberIds,
      created_by_id: clientUserId,
    });
    await ch.create();
  }

  await syncConsultChannelMembers(api, channelId, memberIds);

  const { apiKey } = getStreamCredentials();
  const token = api.createToken(clientUserId);
  return {
    apiKey,
    token,
    userId: clientUserId,
    userName: clientDisplayName,
    channelId,
  };
}
