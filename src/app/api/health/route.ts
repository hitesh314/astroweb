import { NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** lightweight readiness — swap for deeper checks in production */
export async function GET() {
  try {
    getServerEnv();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Misconfigured Supabase env" },
      { status: 503 },
    );
  }
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.getSession();
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, service: "supabase-session" });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 500 },
    );
  }
}
