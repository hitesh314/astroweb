import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  amount: z.coerce.number().int(),
  currency: z.string().min(3).max(8).default("INR"),
  receipt: z.string().max(40).optional(),
});

export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Razorpay is not configured on the server." },
      { status: 503 },
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { amount, currency } = parsed.data;
  if (amount < 100) {
    return NextResponse.json(
      { error: "Amount must be at least 100 paise (₹1)." },
      { status: 400 },
    );
  }

  const baseReceipt =
    parsed.data.receipt ?? `am_${user.id.replace(/-/g, "").slice(0, 10)}_${Date.now()}`;
  const receipt =
    baseReceipt.length > 40 ? baseReceipt.slice(0, 40) : baseReceipt;

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

  try {
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency ?? currency,
    });
  } catch (e: unknown) {
    const msg =
      e && typeof e === "object" && "error" in e
        ? JSON.stringify((e as { error: unknown }).error)
        : e instanceof Error
          ? e.message
          : "Razorpay order failed";
    console.error("[create-order]", msg);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
