"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-[#fdfcf9] via-[#f8f4ec] to-[#f3ebe0] text-stone-900">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 12% 18%, rgb(214 167 116 / 0.9), transparent),
            radial-gradient(1px 1px at 28% 42%, rgb(214 167 116 / 0.5), transparent),
            radial-gradient(1px 1px at 72% 22%, rgb(214 167 116 / 0.7), transparent),
            radial-gradient(1px 1px at 88% 38%, rgb(214 167 116 / 0.4), transparent),
            radial-gradient(1px 1px at 48% 12%, rgb(214 167 116 / 0.6), transparent),
            radial-gradient(1px 1px at 18% 78%, rgb(214 167 116 / 0.45), transparent),
            radial-gradient(1px 1px at 92% 72%, rgb(214 167 116 / 0.55), transparent)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-amber-200/25 blur-3xl"
        aria-hidden
      />
      <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 pb-16 pt-[max(5rem,10vh)] text-center">
        <p className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.35em] text-amber-800/80">
          AstroMarriage
        </p>
        <h1 className="max-w-xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl sm:leading-[1.1]">
          Discover your destiny together
        </h1>
        <p className="mx-auto mt-6 max-w-md text-[0.95rem] leading-relaxed text-stone-600">
          Guided by classical Vedic principles — insights for union, harmony, and the
          road you walk as partners under the stars.
        </p>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/auth/login"
              className="inline-flex rounded-full bg-stone-900 px-12 py-3.5 text-sm font-semibold tracking-wide text-[#fdfcf9] shadow-md shadow-stone-900/15 ring-2 ring-transparent transition hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              Begin your celestial reading
            </Link>
          </motion.div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-amber-900 underline-offset-4 hover:underline"
          >
            Existing member → Dashboard
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium text-stone-700 underline-offset-4 hover:underline"
          >
            Read the journal
          </Link>
        </div>
      </main>
      <footer className="relative z-10 pb-8 text-center text-xs text-stone-500">
        Vedic Marriage Destiny · Secured by Supabase + Next.js App Router
      </footer>
    </div>
  );
}
