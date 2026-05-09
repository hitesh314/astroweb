import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { mintPhonePasswordForSession } from "@/lib/auth/mint-phone-session";
import { normalizeE164Phone } from "@/lib/auth/phone";
import { signInMintedPasswordJsonResponse } from "@/lib/auth/supabase-minted-session";
import { hashOtpCode } from "@/lib/auth/whatsapp-otp";
import { createServiceSupabaseClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  phone: z.string().min(8),
  code: z.string().min(4).max(12),
  next: z.string().optional(),
});

const MAX_VERIFY_ATTEMPTS = 12;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const digits = parsed.data.code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(digits)) {
    return NextResponse.json({ error: "Enter the 6-digit code we sent you." }, { status: 400 });
  }

  let phoneE164: string;
  try {
    phoneE164 = normalizeE164Phone(parsed.data.phone);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid phone";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const redirect =
    parsed.data.next && parsed.data.next.startsWith("/") && !parsed.data.next.startsWith("//")
      ? parsed.data.next
      : "/dashboard";

  let admin: ReturnType<typeof createServiceSupabaseClient>;
  try {
    admin = createServiceSupabaseClient();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server authentication is misconfigured.";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const { data: row, error: rowErr } = await admin
    .from("whatsapp_otp_challenges")
    .select("id,salt,code_hash,expires_at,consumed_at,attempts")
    .eq("phone_e164", phoneE164)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (rowErr || !row) {
    return NextResponse.json({ error: "No active code — request a new one." }, { status: 400 });
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    await admin.from("whatsapp_otp_challenges").delete().eq("id", row.id);
    return NextResponse.json({ error: "That code expired. Request a new one." }, { status: 400 });
  }

  if ((row.attempts ?? 0) >= MAX_VERIFY_ATTEMPTS) {
    await admin.from("whatsapp_otp_challenges").delete().eq("id", row.id);
    return NextResponse.json({ error: "Too many wrong attempts — request a new code." }, { status: 429 });
  }

  const computed = hashOtpCode(row.salt, digits);
  if (computed !== row.code_hash) {
    await admin
      .from("whatsapp_otp_challenges")
      .update({
        attempts: (row.attempts ?? 0) + 1,
      })
      .eq("id", row.id);
    return NextResponse.json({ error: "Incorrect code." }, { status: 400 });
  }

  const consumedAt = new Date().toISOString();
  const { error: consErr } = await admin
    .from("whatsapp_otp_challenges")
    .update({
      consumed_at: consumedAt,
    })
    .eq("id", row.id);

  if (consErr) {
    console.error("[verify-otp] consume:", consErr.message);
    return NextResponse.json({ error: "Could not verify — try again." }, { status: 500 });
  }

  try {
    const { password } = await mintPhonePasswordForSession(admin, phoneE164);
    return await signInMintedPasswordJsonResponse({
      request,
      phone: phoneE164,
      password,
      redirectTo: redirect,
    });
  } catch (e) {
    console.error("[verify-otp] session mint:", e);
    return NextResponse.json({ error: "Could not complete sign-in." }, { status: 500 });
  }
}
