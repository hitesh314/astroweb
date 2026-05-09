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

export default function LoginForm({ nextHref }: { nextHref?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const supabase = createBrowserSupabaseClient();

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
    toast.success("Check your email for the sign-in link.");
  }

  async function sendPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
      options: {
        shouldCreateUser: true,
      },
    });
    void origin;
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("OTP sent — enter the code in your SMS client when prompted.");
  }

  async function signInGoogle() {
    setBusy(true);
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl(origin, nextHref ?? null),
      },
    });
    setBusy(false);
    if (error) toast.error(error.message);
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
          Welcome back
        </h1>
        <p className="mt-3 text-center text-sm text-stone-600">
          Sign in with email (magic link), Google, or phone OTP.
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-[#fdfcf9] px-3 text-stone-500">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signInGoogle()}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-stone-200 bg-white py-3 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50 disabled:opacity-60"
          >
            Continue with Google
          </button>

          <form onSubmit={sendPhoneOtp} className="space-y-3">
            <label className="block text-sm font-medium text-stone-700">
              Phone{" "}
              <span className="font-normal text-stone-400">(optional)</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 outline-none ring-amber-900/30 focus:border-amber-300 focus:ring-2"
                placeholder="+9198xxxxxxx"
                autoComplete="tel"
              />
            </label>
            <button
              type="submit"
              disabled={busy || phone.length < 8}
              className="w-full rounded-full border border-stone-300 bg-white py-3 text-sm font-semibold text-stone-900 hover:bg-stone-50 disabled:opacity-60"
            >
              Send SMS code
            </button>
          </form>
        </div>

        <p className="mt-12 text-center text-sm text-stone-500">
          <Link
            href="/"
            className="font-medium text-amber-900 hover:underline"
          >
            ← Back home
          </Link>
        </p>

        <p className="mt-2 text-center text-xs text-stone-400">
          Configure Google OAuth, Email, and SMS in Supabase Auth settings.
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
