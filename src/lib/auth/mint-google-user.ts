import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

import type { GoogleIdClaims } from "./google-id-token";
import { randomTempPassword } from "./whatsapp-otp";

type AdminClient = SupabaseClient<Database>;

function isEmailExists(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  if (err.code === "email_exists") return true;
  return /email.*exist|already.*registered/i.test(err.message ?? "");
}

function isMissingGoogleLinksTable(err: { code?: string; message?: string | null } | null): boolean {
  if (!err) return false;
  const m = err.message ?? "";
  return err.code === "PGRST205" && /google_auth_links/i.test(m);
}

async function upsertGoogleLinkIfTableExists(
  admin: AdminClient,
  google_sub: string,
  user_id: string,
): Promise<void> {
  const { error } = await admin.from("google_auth_links").upsert(
    {
      google_sub,
      user_id,
    },
    { onConflict: "google_sub" },
  );
  if (error && !isMissingGoogleLinksTable(error)) throw error;
  if (error) {
    console.warn(
      "[mint-google-user] google_auth_links not available — run supabase/migrations/20260509180000_google_auth_links.sql (or 20260509200000_ensure_google_auth_links.sql). Sign-in still works.",
    );
  }
}

async function findAuthUserIdByEmail(
  admin: AdminClient,
  email: string,
): Promise<string | null> {
  const needle = email.toLowerCase().trim();
  for (let page = 1; page <= 100; page++) {
    const { data } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    const users = data.users;
    const hit = users.find((u) => (u.email ?? "").toLowerCase().trim() === needle);
    if (hit?.id) return hit.id;
    if (users.length < 200) return null;
  }
  return null;
}

/**
 * Ensures auth.users (+ public.users via trigger) for this Google account, sets one-time password
 * for Supabase SSR signInWithPassword (same approach as phone OTP).
 */
export async function mintGooglePasswordForSession(
  admin: AdminClient,
  claims: GoogleIdClaims,
): Promise<{ email: string; password: string }> {
  const password = randomTempPassword();

  const { data: link, error: linkErr } = await admin
    .from("google_auth_links")
    .select("user_id")
    .eq("google_sub", claims.sub)
    .maybeSingle();

  if (linkErr && !isMissingGoogleLinksTable(linkErr)) throw linkErr;

  if (!linkErr && link?.user_id) {
    const { data: uwrap, error: getErr } = await admin.auth.admin.getUserById(link.user_id);
    if (getErr || !uwrap.user?.id) throw getErr ?? new Error("Google-linked user missing");
    const { error: updErr } = await admin.auth.admin.updateUserById(link.user_id, {
      password,
    });
    if (updErr) throw updErr;
    const loginEmail = uwrap.user.email ?? claims.email;
    return { email: loginEmail, password };
  }

  const user_metadata: Record<string, string> = {
    sign_up_channel: "google_oauth_direct",
    google_sub: claims.sub,
  };
  if (claims.name) user_metadata.full_name = claims.name;
  if (claims.picture) user_metadata.avatar_url = claims.picture;

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: claims.email,
    email_confirm: true,
    password,
    user_metadata,
  });

  if (!createErr && created.user?.id && created.user.email) {
    await upsertGoogleLinkIfTableExists(admin, claims.sub, created.user.id);
    return { email: created.user.email, password };
  }

  if (!isEmailExists(createErr) && createErr) throw createErr;

  const existingId = await findAuthUserIdByEmail(admin, claims.email);
  if (!existingId) {
    throw new Error(
      "This email exists in Auth but could not be loaded. Retry or contact support.",
    );
  }

  const { error: pwdErr } = await admin.auth.admin.updateUserById(existingId, { password });
  if (pwdErr) throw pwdErr;

  await upsertGoogleLinkIfTableExists(admin, claims.sub, existingId);

  const { data: u2, error: g2 } = await admin.auth.admin.getUserById(existingId);
  if (g2 || !u2.user?.email) throw g2 ?? new Error("User email missing");

  return { email: u2.user.email, password };
}
