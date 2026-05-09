/** Local id used in API (e.g. `consult-uuid`); `cid` is often `messaging:consult-uuid`. */
export function streamMessagingLocalId(ch: { id?: string; cid?: string }): string {
  if (ch.id) return ch.id;
  const cid = ch.cid ?? "";
  const i = cid.indexOf(":");
  if (i >= 0) return cid.slice(i + 1);
  return cid;
}

/** Stream channel id scheme: consult-{supabase-client-uuid}. */
export function parseConsultChannelClientUserId(channelId: string | undefined): string | null {
  const prefix = "consult-";
  if (!channelId?.startsWith(prefix)) return null;
  const rest = channelId.slice(prefix.length);
  return rest.length > 0 ? rest : null;
}
