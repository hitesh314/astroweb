"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { normalizeE164Phone } from "@/lib/auth/phone";
import { PRACTITIONER } from "@/lib/site/practitioner";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} aria-hidden viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function LoginFormInner({ nextHref }: { nextHref?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"enter_phone" | "enter_code">("enter_phone");
  const [busy, setBusy] = useState(false);

  const destination =
    nextHref?.startsWith("/") && !nextHref.startsWith("//") ? nextHref : "/dashboard";

  const googleHref = `/api/auth/google?next=${encodeURIComponent(destination)}`;

  useEffect(() => {
    const err = searchParams.get("error");
    const greason = searchParams.get("greason");
    if (!err) return;

    if (err === "auth") {
      toast.error("Sign-in could not finish. Try again or use another method.");
    } else if (err === "google") {
      const messages: Record<string, string> = {
        missing_env: "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET on the server.",
        oauth_denied: "Google sign-in was cancelled.",
        oauth_provider:
          "Google rejected the OAuth request (consent screen, app verification, etc.). Retry or check Google Cloud Console.",
        missing_code:
          "Google did not return an authorization code. Try signing in again from the login page.",
        bad_state:
          "OAuth state did not match (cookies blocked or two different tabs). Retry in one tab; allow cookies for this site.",
        token_exchange:
          "Could not swap the Google code for tokens—usually wrong CLIENT_SECRET or redirect URI mismatch. In Google Cloud, set Authorized redirect URI to {your exact site}/auth/google/callback (same host as the address bar, e.g. localhost vs 127.0.0.1).",
        no_id_token:
          "Google did not return id_token—confirm scopes openid email profile on the OAuth client.",
        bad_id_token: "Google ID token could not be verified; ensure GOOGLE_CLIENT_ID matches your OAuth Web client.",
        supabase_config:
          "SUPABASE_SERVICE_ROLE_KEY is invalid or mismatched—fix it using Dashboard → Settings → API for this project.",
        provision:
          "Account could not be created in Supabase—check server logs and that Auth sign-ups are allowed; apply google_auth_links migration if missing.",
        session:
          "Supabase refused email sign-in—open Dashboard → Authentication → Providers → Email and enable “Email” (needed for password session after provisioning). Then try Google again.",
      };
      toast.error(
        greason && messages[greason]
          ? messages[greason]
          : "Google sign-in failed. Compare server logs ([google/callback]) with Google Cloud OAuth settings.",
      );
    }

    const next = searchParams.get("next");
    const cleaned =
      next?.startsWith("/") && !next.startsWith("//")
        ? `/auth/login?next=${encodeURIComponent(next)}`
        : "/auth/login";
    router.replace(cleaned, { scroll: false });
  }, [searchParams, router]);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const normalized = normalizeE164Phone(phone);
      const res = await fetch("/api/auth/whatsapp/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: normalized }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        toast.error(data.error ?? "Could not send code.");
        return;
      }

      setPhone(normalized);
      setStep("enter_code");
      toast.success("We sent your sign-in code.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/auth/whatsapp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          phone: normalizeE164Phone(phone),
          code: otpCode.replace(/\s/g, ""),
          next: destination,
        }),
      });

      const data = (await res.json()) as { error?: string; redirect?: string };

      if (!res.ok) {
        toast.error(data.error ?? "Verification failed.");
        return;
      }

      if (data.redirect) {
        router.push(data.redirect);
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function resendCode() {
    setBusy(true);
    try {
      const res = await fetch("/api/auth/whatsapp/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: normalizeE164Phone(phone) }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Could not resend.");
        return;
      }
      toast.success("Sent another code.");
    } finally {
      setBusy(false);
    }
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
          {PRACTITIONER.shortName}
        </p>
        <h1 className="mt-4 text-center text-3xl font-semibold tracking-tight">
          Sign in
        </h1>
        <p className="mt-3 text-center text-sm text-stone-600">
          Returning clients · Google OAuth or a one-time code texted to your mobile (
          {PRACTITIONER.shortName}&apos;s private charts portal). Google creates your secure client
          folder automatically when you first approve access.
        </p>

        <div className="mx-auto mt-10 space-y-4">
          <a
            href={googleHref}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-stone-200 bg-white py-3 text-sm font-semibold text-stone-800 shadow-sm transition hover:bg-stone-50"
          >
            <GoogleIcon className="size-5 shrink-0" />
            Continue with Google
          </a>
        </div>

        <p className="mt-12 text-center text-sm text-stone-500">
          <Link href="/" className="font-medium text-amber-900 hover:underline">
            ← Back home
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginForm(props: { nextHref?: string }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-gradient-to-b from-[#fdfcf9] to-[#f3ebe0] px-6 py-16" />
      }
    >
      <LoginFormInner {...props} />
    </Suspense>
  );
}
