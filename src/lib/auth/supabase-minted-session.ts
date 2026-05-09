import "server-only";

import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/types/database.types";

import { getServerEnv } from "@/lib/env";

import { googleAuthFailRedirect } from "@/lib/auth/google-oauth-fail";

type MintCredentials =
  | { kind: "email"; email: string }
  | { kind: "phone"; phone: string };

function assertMintCreds(opts: {
  email?: string;
  phone?: string;
}): MintCredentials {
  if (opts.email && opts.phone) {
    throw new Error("Minted session: pass email or phone, not both");
  }
  if (opts.email) return { kind: "email", email: opts.email };
  if (opts.phone) return { kind: "phone", phone: opts.phone };
  throw new Error("Minted session: email or phone required");
}

async function signInWithMintedPassword(
  supabase: ReturnType<
    typeof createServerClient<Database>
  >,
  password: string,
  cred: MintCredentials,
) {
  if (cred.kind === "phone") {
    return supabase.auth.signInWithPassword({ phone: cred.phone, password });
  }
  return supabase.auth.signInWithPassword({ email: cred.email, password });
}

export async function signInMintedPasswordJsonResponse(opts: {
  request: NextRequest;
  redirectTo: string;
  password: string;
  email?: string;
  phone?: string;
}) {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getServerEnv();
  const cred = assertMintCreds(opts);

  const response = NextResponse.json(
    {
      ok: true as const,
      redirect:
        opts.redirectTo.startsWith("/") && !opts.redirectTo.startsWith("//")
          ? opts.redirectTo
          : "/dashboard",
    },
    { status: 200 },
  );

  const supabase = createServerClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return opts.request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await signInWithMintedPassword(supabase, opts.password, cred);

  if (error) {
    console.error("[minted-session] signInWithPassword:", error.message);
    return NextResponse.json(
      { error: "Could not start session. Try again shortly." },
      { status: 500 },
    );
  }

  return response;
}

export async function signInMintedPasswordRedirect(opts: {
  request: NextRequest;
  redirectToAbsoluteUrl: string;
  password: string;
  email?: string;
  phone?: string;
  /** Used when password sign-in fails (e.g. Google callback) — same-origin + optional next for retry */
  googleAuthFallback?: { siteOrigin: string; relativeNext?: string };
}) {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getServerEnv();
  const cred = assertMintCreds(opts);

  const response = NextResponse.redirect(opts.redirectToAbsoluteUrl);

  const supabase = createServerClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return opts.request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await signInWithMintedPassword(supabase, opts.password, cred);

  if (error) {
    console.error("[minted-session] signIn redirect:", error.message);
    if (opts.googleAuthFallback) {
      const { siteOrigin, relativeNext } = opts.googleAuthFallback;
      return googleAuthFailRedirect(siteOrigin, "session", {
        next: relativeNext?.startsWith("/") && !relativeNext.startsWith("//")
          ? relativeNext
          : undefined,
      });
    }
    const reqUrl = new URL(opts.request.url);
    return NextResponse.redirect(`${reqUrl.origin}/auth/login?error=google&greason=session`);
  }

  return response;
}
