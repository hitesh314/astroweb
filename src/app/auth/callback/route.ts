import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database.types";
import { getServerEnv } from "@/lib/env";

/**
 * Email magic links / SSR OAuth finish at Supabase, then redirect here with `?code=`.
 * Cookies from `exchangeCodeForSession` must be written onto the **redirect**
 * response — using only `cookies()` from `next/headers` often drops Set-Cookie
 * when returning `NextResponse.redirect`.
 */
export async function GET(request: NextRequest) {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    getServerEnv();

  const reqUrl = new URL(request.url);
  const code = reqUrl.searchParams.get("code");
  let next = reqUrl.searchParams.get("next") ?? "/dashboard";
  if (!next.startsWith("/")) next = "/dashboard";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  let siteOrigin = reqUrl.origin;
  if (process.env.NODE_ENV !== "development" && forwardedHost) {
    const scheme =
      forwardedProto && forwardedProto.length > 0
        ? forwardedProto
        : reqUrl.protocol.replace(":", "");
    siteOrigin = `${scheme}://${forwardedHost}`;
  }

  const errorRedirect = () =>
    NextResponse.redirect(`${siteOrigin}/auth/login?error=auth`);

  if (!code) return errorRedirect();

  const redirectToUser = `${siteOrigin}${next}`;

  const response = NextResponse.redirect(redirectToUser);

  const supabase = createServerClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession:", error.message);
    return errorRedirect();
  }

  return response;
}
