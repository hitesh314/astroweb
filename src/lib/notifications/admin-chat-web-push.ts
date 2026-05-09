import "server-only";

import webpush from "web-push";

import { siteUrl } from "@/lib/env";
import { PRACTITIONER } from "@/lib/site/practitioner";
import { createServiceSupabaseClient } from "@/lib/supabase/admin";

function configureWebPushOnce(): boolean {
  const pub = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY?.trim();
  const priv = process.env.WEB_PUSH_PRIVATE_KEY?.trim();
  const contact = process.env.WEB_PUSH_CONTACT?.trim();
  if (!pub || !priv || !contact) return false;
  webpush.setVapidDetails(contact, pub, priv);
  return true;
}

function adminConsultChatLink(): string {
  const base = siteUrl().replace(/\/$/, "");
  if (base) return `${base}/admin/chat`;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel && !/^https?:/i.test(vercel)) return `https://${vercel.replace(/\/$/, "")}/admin/chat`;
  if (vercel) return `${vercel.replace(/\/$/, "")}/admin/chat`;
  return "/admin/chat";
}

/**
 * Dedupes first consult-chat bootstrap per customer, then notifies all admins
 * subscribed via Web Push. Fire-and-forget from chat-bootstrap; errors are swallowed or logged.
 */
export async function notifyAdminsFirstConsultChatOpen(options: {
  clientUserId: string;
  clientDisplayName: string;
}): Promise<void> {
  if (!configureWebPushOnce()) {
    return;
  }

  let admin: ReturnType<typeof createServiceSupabaseClient>;
  try {
    admin = createServiceSupabaseClient();
  } catch (e) {
    console.warn("[consult-chat-push] service client unavailable:", e);
    return;
  }

  const { error: firstErr } = await admin.from("client_consult_chat_first_visit").insert({
    user_id: options.clientUserId,
  });

  if (firstErr) {
    if (firstErr.code === "23505") {
      return;
    }
    const missingFirst =
      /client_consult_chat_first_visit/i.test(firstErr.message) &&
      /does not exist|Could not find the table|schema cache/i.test(firstErr.message);
    if (missingFirst) {
      console.warn(
        "[consult-chat-push] Table client_consult_chat_first_visit missing. Run supabase/migrations/20260510123000_consult_chat_push.sql.",
      );
    } else {
      console.error("[consult-chat-push] insert first_visit:", firstErr.message);
    }
    return;
  }

  const { data: subs, error: subErr } = await admin.from("admin_web_push_subscriptions").select("id, endpoint, p256dh, auth");

  if (subErr) {
    const missingSubs =
      /admin_web_push_subscriptions/i.test(subErr.message) &&
      /does not exist|Could not find the table|schema cache/i.test(subErr.message);
    if (missingSubs) {
      console.warn(
        "[consult-chat-push] Table admin_web_push_subscriptions missing. Run supabase/migrations/20260510123000_consult_chat_push.sql.",
      );
    } else {
      console.error("[consult-chat-push] load subscriptions:", subErr.message);
    }
    return;
  }

  if (!subs?.length) {
    return;
  }

  const title = `${PRACTITIONER.shortName} · New chat`;
  const name = options.clientDisplayName.trim() || "Someone";
  const url = adminConsultChatLink();
  const body = `${name} just opened consultation chat.`;
  const payload = JSON.stringify({ title, body, url });

  for (const row of subs) {
    const subscription = {
      endpoint: row.endpoint,
      keys: { p256dh: row.p256dh, auth: row.auth },
    };
    try {
      await webpush.sendNotification(subscription, payload);
    } catch (e: unknown) {
      const status = typeof e === "object" && e !== null && "statusCode" in e ? (e as { statusCode?: number }).statusCode : undefined;
      if (status === 410) {
        await admin.from("admin_web_push_subscriptions").delete().eq("endpoint", row.endpoint);
        continue;
      }
      console.error("[consult-chat-push] send failed:", row.id, e);
    }
  }
}
