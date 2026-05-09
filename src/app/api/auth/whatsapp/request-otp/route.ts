import { NextResponse } from "next/server";
import { z } from "zod";

import { normalizeE164Phone } from "@/lib/auth/phone";
import { hashOtpCode, newOtpSalt, randomSixDigitOtp } from "@/lib/auth/whatsapp-otp";
import { getZavudevClient } from "@/lib/zavudev/server-client";
import { createServiceSupabaseClient } from "@/lib/supabase/admin";

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_SENDS_PER_HOUR = 8;

const bodySchema = z.object({
  phone: z.string().min(8),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  let phoneE164: string;
  try {
    phoneE164 = normalizeE164Phone(parsed.data.phone);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid phone";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (!process.env.ZAVUDEV_API_KEY) {
    console.error("[request-otp] Missing ZAVUDEV_API_KEY");
    return NextResponse.json({ error: "WhatsApp messaging is not configured." }, { status: 503 });
  }

  const zavuSenderId = process.env.ZAVU_SENDER_ID?.trim();
  if (!zavuSenderId) {
    return NextResponse.json(
      {
        error:
          "ZAVU_SENDER_ID is not set. Your Zavu project has no default sender — add sender id from Zavu Dashboard (Senders / channel) to .env.local as ZAVU_SENDER_ID=<id>, then restart the server.",
      },
      { status: 503 },
    );
  }

  let admin: ReturnType<typeof createServiceSupabaseClient>;
  try {
    admin = createServiceSupabaseClient();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server authentication is misconfigured.";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: recentRows, error: rateErr } = await admin
    .from("whatsapp_otp_challenges")
    .select("id")
    .eq("phone_e164", phoneE164)
    .gte("created_at", hourAgo);

  if (rateErr) {
    console.error("[request-otp] rate limit query:", JSON.stringify(rateErr));
    const missingTable =
      /whatsapp_otp_challenges/i.test(rateErr.message) &&
      /does not exist|Could not find the table|schema cache/i.test(rateErr.message);
    const invalidApiKey = /invalid api key/i.test(rateErr.message ?? "");
    return NextResponse.json(
      {
        error: missingTable
          ? "WhatsApp OTP tables are missing. Run supabase/migrations/20260509130100_whatsapp_otp_auth.sql on your Supabase project (SQL Editor or supabase db push)."
          : invalidApiKey
            ? "Supabase rejected SUPABASE_SERVICE_ROLE_KEY. Paste the full service_role secret JWT from Dashboard → Project Settings → API (not anon, not sb_publishable_*). Restart the dev server after saving .env.local."
            : "Could not verify rate limit.",
        ...(process.env.NODE_ENV === "development" && { debug: rateErr.message }),
      },
      { status: missingTable || invalidApiKey ? 503 : 500 },
    );
  }
  if ((recentRows?.length ?? 0) >= MAX_OTP_SENDS_PER_HOUR) {
    return NextResponse.json(
      { error: "Too many codes requested for this number. Wait up to an hour and try again." },
      { status: 429 },
    );
  }

  const { error: delErr } = await admin.from("whatsapp_otp_challenges").delete().eq("phone_e164", phoneE164);
  if (delErr) {
    console.error("[request-otp] delete previous:", delErr.message);
    return NextResponse.json({ error: "Could not issue a new code." }, { status: 500 });
  }

  const salt = newOtpSalt();
  const code = randomSixDigitOtp();
  const code_hash = hashOtpCode(salt, code);
  const expires_at = new Date(Date.now() + OTP_TTL_MS).toISOString();

  const { error: insErr } = await admin.from("whatsapp_otp_challenges").insert({
    phone_e164: phoneE164,
    salt,
    code_hash,
    expires_at,
  });

  if (insErr) {
    console.error("[request-otp] insert:", insErr.message);
    return NextResponse.json({ error: "Could not create verification record." }, { status: 500 });
  }

  const client = getZavudevClient();

  try {
    const messageResponse = await client.messages.send({
      to: phoneE164,
      channel: "whatsapp",
      text: `Your AstroMarriage sign-in code is ${code}. Do not share it with anyone.`,
      "Zavu-Sender": zavuSenderId,
    });

    const msg = messageResponse.message;
    if (msg.status === "failed" || msg.errorCode) {
      console.error("[request-otp] Zavu:", msg.errorCode, msg.errorMessage);
      await admin.from("whatsapp_otp_challenges").delete().eq("phone_e164", phoneE164);
      return NextResponse.json(
        { error: msg.errorMessage ?? "Could not deliver WhatsApp code." },
        { status: 502 },
      );
    }
  } catch (e) {
    const fallback = "Could not send WhatsApp.";
    const message =
      e instanceof Error
        ? e.message
        : typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : fallback;
    console.error("[request-otp] Zavu send:", message, e);
    await admin.from("whatsapp_otp_challenges").delete().eq("phone_e164", phoneE164);

    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({ ok: true as const }, { status: 200 });
}
