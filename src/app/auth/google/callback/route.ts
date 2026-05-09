import { NextRequest } from "next/server";

import { clearGoogleOAuthCookies, googleAuthFailRedirect } from "@/lib/auth/google-oauth-fail";
import { verifyGoogleIdToken } from "@/lib/auth/google-id-token";
import { mintGooglePasswordForSession } from "@/lib/auth/mint-google-user";
import { safeRelativeNext, siteOriginFromRequest } from "@/lib/auth/request-site-origin";
import { signInMintedPasswordRedirect } from "@/lib/auth/supabase-minted-session";
import { createServiceSupabaseClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const reqUrl = new URL(request.url);
  const siteOrigin = siteOriginFromRequest(request, reqUrl);

  const nextCookie = request.cookies.get("google_oauth_next")?.value;
  const relativeNextLogin = safeRelativeNext(nextCookie ?? null);

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return googleAuthFailRedirect(siteOrigin, "missing_env", { next: relativeNextLogin });
  }

  const oauthErr = reqUrl.searchParams.get("error");
  if (oauthErr) {
    return googleAuthFailRedirect(
      siteOrigin,
      oauthErr === "access_denied" ? "oauth_denied" : "oauth_provider",
      { next: relativeNextLogin },
    );
  }

  const code = reqUrl.searchParams.get("code");
  const stateParam = reqUrl.searchParams.get("state");
  if (!code || !stateParam) {
    return googleAuthFailRedirect(siteOrigin, "missing_code", { next: relativeNextLogin });
  }

  const cookieState = request.cookies.get("google_oauth_state")?.value;
  if (!cookieState || cookieState !== stateParam) {
    return googleAuthFailRedirect(siteOrigin, "bad_state", { next: relativeNextLogin });
  }

  const relativeNext = relativeNextLogin;
  const redirectUri = `${siteOrigin}/auth/google/callback`;

  try {
    const tokRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenJson = (await tokRes.json()) as Record<string, unknown>;
    const idToken =
      typeof tokenJson.id_token === "string" ? tokenJson.id_token : "";

    if (!tokRes.ok) {
      const googleErr =
        typeof tokenJson.error === "string" ? tokenJson.error : "unknown";
      console.error("[google/callback] token exchange:", tokRes.status, googleErr, tokenJson);
      return googleAuthFailRedirect(siteOrigin, "token_exchange", {
        next: relativeNext,
      });
    }
    if (!idToken) {
      console.error("[google/callback] missing id_token:", tokenJson);
      return googleAuthFailRedirect(siteOrigin, "no_id_token", { next: relativeNext });
    }

    let claims;
    try {
      claims = await verifyGoogleIdToken(idToken, clientId);
    } catch (verifyErr) {
      console.error("[google/callback] id_token verify:", verifyErr);
      return googleAuthFailRedirect(siteOrigin, "bad_id_token", { next: relativeNext });
    }

    let admin: ReturnType<typeof createServiceSupabaseClient>;
    try {
      admin = createServiceSupabaseClient();
    } catch (e) {
      console.error("[google/callback] service client:", e);
      return googleAuthFailRedirect(siteOrigin, "supabase_config", { next: relativeNext });
    }

    const { email, password } = await mintGooglePasswordForSession(admin, claims);

    const absolute = `${siteOrigin}${relativeNext}`;

    const sessionRes = await signInMintedPasswordRedirect({
      request,
      redirectToAbsoluteUrl: absolute,
      email,
      password,
      googleAuthFallback: { siteOrigin, relativeNext },
    });

    clearGoogleOAuthCookies(sessionRes);
    return sessionRes;
  } catch (e) {
    console.error("[google/callback]:", e);
    return googleAuthFailRedirect(siteOrigin, "provision", { next: relativeNext });
  }
}
