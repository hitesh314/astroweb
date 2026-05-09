"use client";

import Script from "next/script";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { PRACTITIONER } from "@/lib/site/practitioner";

type Props = {
  amountPaise: number;
  buttonLabel?: string;
  description?: string;
  prefilledEmail?: string | null;
  prefilledName?: string | null;
};

export default function RazorpayCheckoutButton({
  amountPaise,
  buttonLabel = "Pay with Razorpay",
  description = `${PRACTITIONER.shortName} readings`,
  prefilledEmail,
  prefilledName,
}: Props) {
  const [sdkReady, setSdkReady] = useState(false);
  const [busy, setBusy] = useState(false);

  const startCheckout = useCallback(async () => {
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
    if (!key) {
      toast.error("Missing NEXT_PUBLIC_RAZORPAY_KEY_ID.");
      return;
    }
    if (!sdkReady || typeof window === "undefined" || !window.Razorpay) {
      toast.error("Checkout is still loading — try again in a moment.");
      return;
    }
    if (amountPaise < 100) {
      toast.error("Amount must be at least ₹1 (100 paise).");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        order_id?: string;
        amount?: number;
        currency?: string;
      };

      if (!res.ok || !data.order_id) {
        toast.error(
          typeof data.error === "string" ? data.error : "Could not create order.",
        );
        setBusy(false);
        return;
      }

      const rzp = new window.Razorpay({
        key,
        amount: data.amount ?? amountPaise,
        currency: data.currency ?? "INR",
        name: PRACTITIONER.razorpayDisplayName,
        description,
        order_id: data.order_id,
        prefill: {
          email: prefilledEmail ?? undefined,
          name: prefilledName ?? undefined,
        },
        theme: { color: "#292524" },
        modal: {
          ondismiss: () => {
            setBusy(false);
            toast.message("Payment cancelled");
          },
        },
        handler: async (response) => {
          setBusy(true);
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(response),
            });
            const verifyJson = (await verifyRes.json().catch(() => ({}))) as {
              error?: string;
              success?: boolean;
            };

            if (!verifyRes.ok) {
              toast.error(
                verifyJson.error ??
                  "Payment could not be verified — contact support.",
              );
              return;
            }
            toast.success("Payment verified successfully.");
          } finally {
            setBusy(false);
          }
        },
      });

      rzp.on("payment.failed", () => {
        setBusy(false);
        toast.error("Payment failed — try another method or retry.");
      });

      setBusy(false);
      rzp.open();
    } catch {
      toast.error("Network error starting checkout.");
      setBusy(false);
    }
  }, [
    amountPaise,
    description,
    prefilledEmail,
    prefilledName,
    sdkReady,
  ]);

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setSdkReady(true)}
      />
      <button
        type="button"
        disabled={busy || !sdkReady}
        onClick={() => void startCheckout()}
        className="rounded-full bg-stone-900 px-8 py-3 text-sm font-semibold text-[#fdfcf9] transition hover:bg-stone-800 disabled:opacity-50"
      >
        {!sdkReady ? "Loading checkout…" : busy ? "Please wait…" : buttonLabel}
      </button>
    </>
  );
}
