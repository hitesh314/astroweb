"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function callbackUrl(origin: string, next?: string | null) {
  const q = next ? `?next=${encodeURIComponent(next)}` : "";
  return `${origin}/auth/callback${q}`;
}

const PHONE_LOGIN_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_PHONE_LOGIN === "true";

/** Supabase expects E.164: + and country code, digits only (e.g. +919876543210). */
function normalizePhoneE164(raw: string): string | null {
  const compact = raw.trim().replace(/[\s().-]/g, "");
  if (!compact) return null;

  if (compact.startsWith("+")) {
    const rest = compact.slice(1).replace(/\D/g, "");
    if (rest.length < 8 || rest.length > 15) return null;
    return `+${rest}`;
  }

  let digits = compact.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91${digits}`;
  }
  if (digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }
  return null;
}

function isSmsProviderNotConfigured(message: string) {
  const m = message.toLowerCase();
  return (
    m.includes("unsupported phone provider") ||
    (m.includes("phone provider") && m.includes("not supported"))
  );
}

function toastPhoneAuthError(message: string) {
  if (isSmsProviderNotConfigured(message)) {
    toast.error("SMS provider not set up in Supabase", {
      description:
        "Dashboard → Authentication → Providers → Phone — add Twilio, MessageBird, etc. https://supabase.com/docs/guides/auth/phone-login",
      duration: 14000,
    });
    return;
  }
  toast.error(message);
}

export default function LoginForm({ nextHref }: { nextHref?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneE164, setPhoneE164] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [phoneStep, setPhoneStep] = useState<"idle" | "sent">("idle");
  const [busy, setBusy] = useState(false);
  const supabase = createBrowserSupabaseClient();

  const nextPath = nextHref?.startsWith("/") ? nextHref : "/dashboard";

  async function sendEmailOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: callbackUrl(origin, nextHref ?? null),
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Check your email — open the one-time sign-in link we sent.");
  }

  async function sendPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    const e164 = normalizePhoneE164(phone);
    if (!e164) {
      toast.error(
        "Use a full mobile number with country code, e.g. +919876543210 or 9876543210.",
      );
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: e164,
      options: {
        shouldCreateUser: true,
      },
    });
    setBusy(false);
    if (error) {
      toastPhoneAuthError(error.message);
      return;
    }
    setPhoneE164(e164);
    setPhoneStep("sent");
    toast.success("Enter the code we texted to your phone.");
  }

  async function verifyPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: phoneE164,
      token: smsCode.trim(),
      type: "sms",
    });
    setBusy(false);
    if (error) {
      toastPhoneAuthError(error.message);
      return;
    }
    toast.success("Signed in.");
    router.push(nextPath);
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#fdfcf9] to-[#f3ebe0] px-6 py-16 text-stone-900">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto max-w-md"
      >
        <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-amber-800/90">
          AstroMarriage
        </p>
        <h1 className="mt-4 text-center text-3xl font-semibold tracking-tight">
          Sign in
        </h1>
        <p className="mt-3 text-center text-sm text-stone-600">
          {PHONE_LOGIN_ENABLED
            ? "One-time sign-in by email (secure link) or phone (SMS). No password."
            : "Sign in with email — we’ll send a secure one-time link. (SMS is off until Supabase phone + this app flag are configured.)"}
        </p>

        <div className="mt-10 space-y-8">
          <form onSubmit={sendEmailOtp} className="space-y-3">
            <label className="block text-sm font-medium text-stone-700">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-900 shadow-sm outline-none ring-amber-900/30 focus:border-amber-300 focus:ring-2"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-stone-900 py-3 text-sm font-semibold text-[#fdfcf9] transition hover:bg-stone-800 disabled:opacity-60"
            >
              Email me a sign-in link
            </button>
          </form>

          {PHONE_LOGIN_ENABLED ? (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wide">
                  <span className="bg-[#fdfcf9] px-3 text-stone-500">or</span>
                </div>
              </div>

              {phoneStep === "idle" ? (
                <form onSubmit={sendPhoneOtp} className="space-y-3">
                  <label className="block text-sm font-medium text-stone-700">
                    Phone (SMS OTP)
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 outline-none ring-amber-900/30 focus:border-amber-300 focus:ring-2"
                      placeholder="+919876543210 or 9876543210"
                      autoComplete="tel"
                    />
                  </label>
                  <p className="text-xs text-stone-500">
                    E.164 format. Ten-digit India numbers get +91 automatically.
                  </p>
                  <button
                    type="submit"
                    disabled={busy || phone.trim().length < 8}
                    className="w-full rounded-full border border-stone-300 bg-white py-3 text-sm font-semibold text-stone-900 hover:bg-stone-50 disabled:opacity-60"
                  >
                    Send SMS code
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyPhoneOtp} className="space-y-3">
                  <p className="text-sm text-stone-600">
                    Code sent to{" "}
                    <span className="font-medium text-stone-800">{phoneE164}</span>
                  </p>
                  <label className="block text-sm font-medium text-stone-700">
                    SMS code
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      value={smsCode}
                      onChange={(e) =>
                        setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 8))
                      }
                      className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 font-mono text-lg tracking-widest outline-none ring-amber-900/30 focus:border-amber-300 focus:ring-2"
                      placeholder="123456"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={busy || smsCode.trim().length < 4}
                    className="w-full rounded-full bg-stone-900 py-3 text-sm font-semibold text-[#fdfcf9] hover:bg-stone-800 disabled:opacity-60"
                  >
                    Verify & sign in
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    className="w-full text-center text-xs text-stone-500 underline"
                    onClick={() => {
                      setPhoneStep("idle");
                      setPhoneE164("");
                      setSmsCode("");
                    }}
                  >
                    Use a different number
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 px-4 py-4 text-sm text-stone-700">
              <p className="font-medium text-stone-900">SMS sign-in is turned off</p>
              <p className="mt-2 leading-relaxed">
                After you add an SMS provider under Supabase → Authentication → Phone,
                set{" "}
                <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-stone-800">
                  NEXT_PUBLIC_ENABLE_PHONE_LOGIN=true
                </code>{" "}
                in <code className="font-mono text-xs">.env.local</code> and restart{" "}
                <code className="font-mono text-xs">npm run dev</code>.
              </p>
            </div>
          )}
        </div>

        <p className="mt-12 text-center text-sm text-stone-500">
          <Link href="/" className="font-medium text-amber-900 hover:underline">
            ← Back home
          </Link>
        </p>

        <button
          type="button"
          className="mt-10 block w-full text-center text-xs text-stone-500 underline"
          onClick={async () => {
            await supabase.auth.signOut();
            toast.message("Signed out");
            router.push("/");
          }}
        >
          Sign out everywhere on this device
        </button>
      </motion.div>
    </div>
  );
}
