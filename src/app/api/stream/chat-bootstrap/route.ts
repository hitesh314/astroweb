import { NextResponse } from "next/server";

import { bootstrapStreamConsultRoom } from "@/lib/stream/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Issue a Stream Chat user token + ensure the client's consultation DM channel exists. */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    const clientDisplay =
      profile?.full_name ??
      (user.user_metadata?.full_name as string | undefined) ??
      user.email ??
      user.phone ??
      "Client";

    const session = await bootstrapStreamConsultRoom(user.id, clientDisplay);
    return NextResponse.json(session);
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : "Stream Chat bootstrap failed";
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
