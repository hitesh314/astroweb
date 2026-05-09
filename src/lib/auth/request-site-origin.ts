import type { NextRequest } from "next/server";

/** Same origin rules as /auth/callback — used for Google redirect_uri and post-login redirects. */
export function siteOriginFromRequest(request: NextRequest, reqUrl: URL): string {
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
  return siteOrigin;
}

export function safeRelativeNext(raw: string | null, fallback = "/dashboard"): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}
