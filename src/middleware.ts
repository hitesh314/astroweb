import { type NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/supabase-session";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  if (path.startsWith("/dashboard") && !user) {
    const login = new URL("/auth/login", request.url);
    login.searchParams.set("next", `${path}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }

  if (path.startsWith("/admin") && !user) {
    const login = new URL("/auth/login", request.url);
    login.searchParams.set("next", `${path}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Exclude static assets; refresh session for all other routes so auth cookies stay valid.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
