import { NextRequest, NextResponse } from "next/server";

import { safeRelativeNext, siteOriginFromRequest } from "@/lib/auth/request-site-origin";

const COOKIE_SECURE = process.env.NODE_ENV === "production";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error:
          "Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the server environment.",
      },
      { status: 503 },
    );
  }

  const reqUrl = new URL(request.url);
  const siteOrigin = siteOriginFromRequest(request, reqUrl);
  const next = safeRelativeNext(request.nextUrl.searchParams.get("next"));
  const state = crypto.randomUUID();
  const redirectUri = `${siteOrigin}/auth/google/callback`;

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("access_type", "online");

  const res = NextResponse.redirect(authUrl.toString());
  res.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  res.cookies.set("google_oauth_next", next, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
