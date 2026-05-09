import { NextResponse } from "next/server";

const COOKIE_SECURE = process.env.NODE_ENV === "production";

export type GoogleAuthFailReason =
  | "missing_env"
  | "oauth_denied"
  | "oauth_provider"
  | "missing_code"
  | "bad_state"
  | "token_exchange"
  | "no_id_token"
  | "bad_id_token"
  | "supabase_config"
  | "provision"
  | "session";

/** Clear short-lived Google OAuth cookies after success or hand off to fail redirect. */
export function clearGoogleOAuthCookies(res: NextResponse) {
  res.cookies.set("google_oauth_state", "", {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  res.cookies.set("google_oauth_next", "", {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/** Redirect to login with ?error=google&greason=… (and optional ?next= for retry). */
export function googleAuthFailRedirect(
  siteOrigin: string,
  reason: GoogleAuthFailReason,
  opts?: { next?: string },
): NextResponse {
  const u = new URL(`${siteOrigin}/auth/login`);
  u.searchParams.set("error", "google");
  u.searchParams.set("greason", reason);
  if (opts?.next && opts.next.startsWith("/") && !opts.next.startsWith("//")) {
    u.searchParams.set("next", opts.next);
  }
  const res = NextResponse.redirect(u.toString());
  clearGoogleOAuthCookies(res);
  return res;
}
