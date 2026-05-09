import { NextResponse } from "next/server";

import { getStreamCredentials, getStreamServerClient } from "@/lib/stream/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** JWT for an admin viewing customer consult channels they're a member of. */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("users")
      .select("is_admin, role, full_name, email")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin = profile?.is_admin === true || profile?.role === "admin";
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const api = getStreamServerClient();
    const { apiKey } = getStreamCredentials();
    const display =
      profile?.full_name ??
      profile?.email ??
      user.email ??
      user.phone ??
      "Admin";
    const token = api.createToken(user.id);

    return NextResponse.json({
      apiKey,
      token,
      userId: user.id,
      userName: display,
    });
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : "Stream inbox bootstrap failed";
    const configured = !!(process.env.NEXT_PUBLIC_STREAM_API_KEY && process.env.STREAM_API_SECRET);
    return NextResponse.json(
      {
        error: configured ? msg : "Stream Chat not configured.",
        hint: configured ? undefined : "Add NEXT_PUBLIC_STREAM_API_KEY and STREAM_API_SECRET (.env.example).",
      },
      { status: configured ? 502 : 503 },
    );
  }
}
