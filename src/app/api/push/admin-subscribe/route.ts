import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceSupabaseClient } from "@/lib/supabase/admin";

const subscriptionSchema = z.object({
  endpoint: z.string().min(12),
  keys: z.object({
    p256dh: z.string().min(80),
    auth: z.string().min(18),
  }),
});

const bodySchema = z.object({
  subscription: subscriptionSchema,
});

/** Persist admin Web Push subscription (service_role). Authenticated admins only. */
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("users")
      .select("is_admin, role")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin = profile?.is_admin === true || profile?.role === "admin";
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });

    const { endpoint, keys } = parsed.data.subscription;

    try {
      const admin = createServiceSupabaseClient();
      const { error } = await admin.from("admin_web_push_subscriptions").upsert(
        {
          admin_user_id: user.id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "endpoint" },
      );
      if (error) throw error;
    } catch (e) {
      const msg =
        typeof e === "object" &&
        e !== null &&
        "message" in e &&
        typeof (e as { message: unknown }).message === "string"
          ? (e as { message: string }).message
          : "Could not save subscription.";
      console.error("[admin-subscribe]", msg);
      return NextResponse.json(
        {
          error: /admin_web_push_subscriptions/i.test(msg) &&
            /does not exist|Could not find the table|schema cache/i.test(msg)
              ? "Database tables missing — run migrations (supabase/migrations/20260510123000_consult_chat_push.sql)."
              : "Could not save subscription.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin-subscribe]", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
