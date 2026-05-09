import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

import { getServerEnv } from "@/lib/env";

function normalizeSecretKey(raw: string): string {
  let s = raw.replace(/^\uFEFF/, "").trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function supabaseUrlProjectRef(url: string): string | undefined {
  try {
    const host = new URL(url).hostname;
    const m = host.match(/^([a-z0-9-]+)\.supabase\.co$/i);
    return m?.[1];
  } catch {
    return undefined;
  }
}

function decodeJwtPayload(jwt: string): { ref?: string; role?: string } | null {
  const parts = jwt.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(json) as { ref?: string; role?: string };
  } catch {
    return null;
  }
}

/**
 * Ensures the service key matches this project and is not the anon key.
 * PostgREST returns a vague "Invalid API key" when the JWT is for another project or malformed.
 */
function assertServiceRoleKeyForProject(supabaseUrl: string, key: string) {
  const urlRef = supabaseUrlProjectRef(supabaseUrl);
  const payload = decodeJwtPayload(key);
  if (!payload) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY does not look like a JWT (expect three dot-separated segments). Re-copy from Dashboard → API → service_role.",
    );
  }
  if (payload.role === "anon") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is the anon (public) key. Use the service_role secret from the same page instead.",
    );
  }
  if (
    payload.role !== undefined &&
    payload.role !== "" &&
    payload.role !== "service_role"
  ) {
    throw new Error(
      `JWT role is "${payload.role}", not service_role. Copy the service_role key from Dashboard → Settings → API (Reveal).`,
    );
  }
  if (payload.ref && urlRef && payload.ref !== urlRef) {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY is for Supabase project "${payload.ref}" but NEXT_PUBLIC_SUPABASE_URL is project "${urlRef}". Use keys and URL from the same project.`,
    );
  }
}

/** Bypasses RLS — use only in trusted server code when required. */
export function createServiceSupabaseClient() {
  const env = getServerEnv();
  const srRaw = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!srRaw) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set — required for this server operation",
    );
  }
  const sr = normalizeSecretKey(srRaw);
  if (!sr) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is empty after trimming.");
  }
  if (sr.startsWith("sb_publishable_")) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is a publishable key; use the service_role JWT from Dashboard → API instead.",
    );
  }
  assertServiceRoleKeyForProject(env.NEXT_PUBLIC_SUPABASE_URL, sr);
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, sr, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
