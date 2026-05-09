import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

import { randomTempPassword } from "./whatsapp-otp";

type AdminClient = SupabaseClient<Database>;

function isPhoneExists(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  if (err.code === "phone_exists") return true;
  return (
    /phone/i.test(err.message ?? "") &&
    /exist|already|registered/i.test(err.message ?? "")
  );
}

async function findAuthUserIdByPhone(
  admin: AdminClient,
  phoneE164: string,
): Promise<string | null> {
  for (let page = 1; page <= 100; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) return null;
    const users = data.users;
    const hit = users.find((u) => u.phone === phoneE164);
    if (hit?.id) return hit.id;
    if (users.length < 200) return null;
  }
  return null;
}

/**
 * Creates or updates the auth.users row for this phone, sets a one-time random password that
 * only exists for this HTTP request (used with signInWithPassword on the SSR client).
 */
export async function mintPhonePasswordForSession(
  admin: AdminClient,
  phoneE164: string,
): Promise<{ password: string }> {
  const password = randomTempPassword();

  const { data: link, error: linkErr } = await admin
    .from("phone_auth_links")
    .select("user_id")
    .eq("phone_e164", phoneE164)
    .maybeSingle();

  if (linkErr) throw linkErr;
  const existingId = link?.user_id ?? null;

  if (existingId) {
    const { error: updErr } = await admin.auth.admin.updateUserById(existingId, {
      password,
    });
    if (updErr) throw updErr;
    return { password };
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    phone: phoneE164,
    phone_confirm: true,
    password,
    user_metadata: { sign_up_channel: "whatsapp_otp" },
  });

  if (!createErr && created.user?.id) {
    const { error: linkWriteErr } = await admin.from("phone_auth_links").upsert(
      {
        phone_e164: phoneE164,
        user_id: created.user.id,
      },
      { onConflict: "phone_e164" },
    );
    if (linkWriteErr) throw linkWriteErr;
    return { password };
  }

  if (!isPhoneExists(createErr) && createErr) throw createErr;

  const orphaned = await findAuthUserIdByPhone(admin, phoneE164);
  if (!orphaned) {
    throw new Error("Could not create or locate auth user for this phone.");
  }

  const { error: upErr } = await admin.auth.admin.updateUserById(orphaned, {
    password,
  });
  if (upErr) throw upErr;

  const { error: upsertErr } = await admin.from("phone_auth_links").upsert(
    {
      phone_e164: phoneE164,
      user_id: orphaned,
    },
    { onConflict: "phone_e164" },
  );
  if (upsertErr) throw upsertErr;

  return { password };
}
