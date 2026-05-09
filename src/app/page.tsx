import Image from "next/image";
import Link from "next/link";

import MarketingHeader from "@/components/marketing-header";

const CHECKOUT_LOGIN = `/auth/login?next=${encodeURIComponent("/dashboard/subscription")}`;

const testimonials = [
  {
    quote:
      "I wanted to know if things would move forward with someone I chose, or if my family’s match would work out better. The reading was clear and calm.",
    who: "Ananya · 26",
  },
  {
    quote:
      "Mostly I was confused between love marriage pressure and what parents were arranging. This helped me see both sides without drama.",
    who: "Rahul · 29",
  },
  {
    quote:
      "I didn’t tell anyone I tried it. The love vs arranged part matched what I was already feeling — good for closure.",
    who: "Priya · 24",
  },
  {
    quote:
      "Straight talk. Not like generic horoscope apps. Worth it before spending on a bigger puja.",
    who: "Karan · 31",
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-dvh bg-[#fdfcf9] text-stone-900">
      <MarketingHeader />

      {/* Hero */}
      <section className="mx-auto max-w-xl px-5 pb-14 pt-10 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-snug text-stone-950 sm:text-4xl">
          Will you marry who you love, or through an arranged match?
        </h1>
        <p className="mt-5 text-[0.9375rem] leading-relaxed text-stone-600">
          We read your chart and spell it out simply — what tends to favour a love marriage,
          what points to an arranged setup, and where the middle ground usually is.
        </p>

        <div className="mx-auto mt-10 max-w-sm sm:max-w-md">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-amber-100/40 to-stone-100 p-1 shadow-[0_20px_50px_-12px_rgba(120,80,30,0.25)] ring-1 ring-amber-900/10">
            <div className="overflow-hidden rounded-[1.75rem] ring-1 ring-white/60">
              <Image
                src="/hero-astrologer-book.png"
                alt="Astrologer with a chart book in warm lamplight"
                width={720}
                height={720}
                className="h-auto w-full object-cover"
                priority
                sizes="(max-width: 640px) 100vw, 28rem"
              />
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-stone-500">
            Your reading is prepared the same way — chart, book, plain words.
          </p>
          <div className="mt-5 text-center">
            <Link
              href={CHECKOUT_LOGIN}
              className="text-sm font-semibold text-amber-950 underline decoration-amber-900/30 underline-offset-4 hover:decoration-amber-900"
            >
              Continue — ₹249
            </Link>
          </div>
        </div>
      </section>

      {/* How we help */}
      <section className="mx-auto max-w-xl border-t border-stone-200 px-5 py-14">
        <h2 className="text-xl font-semibold text-stone-900">How we can help</h2>
        <ul className="mt-6 space-y-4 text-[0.9375rem] leading-relaxed text-stone-600">
          <li>
            • A focused answer on <strong className="text-stone-800">love marriage</strong>{" "}
            vs <strong className="text-stone-800">arranged marriage</strong> — not vague
            one-liners.
          </li>
          <li>• Written in plain language you can actually use when talking at home.</li>
          <li>• You share birth details once; we build the chart and send your report.</li>
        </ul>
      </section>

      {/* Feedback */}
      <section className="mx-auto max-w-xl border-t border-stone-200 px-5 py-14">
        <h2 className="text-xl font-semibold text-stone-900">What people said</h2>
        <p className="mt-2 text-sm text-stone-500">
          Recent notes from girls and guys who booked a reading.
        </p>
        <ul className="mt-8 space-y-6">
          {testimonials.map((t) => (
            <li
              key={t.who}
              className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm"
            >
              <p className="text-[0.9375rem] leading-relaxed text-stone-700">
                “{t.quote}”
              </p>
              <p className="mt-3 text-xs font-semibold text-stone-500">{t.who}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Price */}
      <section className="mx-auto max-w-xl border-t border-stone-200 px-5 py-14 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-800/90">
          Reading price
        </p>
        <p className="mt-4 text-4xl font-semibold tracking-tight text-stone-950">
          ₹249
        </p>
        <p className="mt-1 text-sm text-stone-500 line-through">₹499</p>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-stone-600">
          Full written report focused on marriage pathway — love, arranged, or in between —
          delivered after we have your accurate birth details.
        </p>
        <div className="mt-8">
          <Link
            href={CHECKOUT_LOGIN}
            className="inline-flex rounded-full bg-stone-900 px-8 py-3 text-sm font-semibold text-[#fdfcf9] hover:bg-stone-800"
          >
            Get your reading — ₹249
          </Link>
        </div>
      </section>

      {/* Astrologer chat */}
      <section className="mx-auto max-w-xl border-t border-stone-200 px-5 pb-20 pt-14">
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/40 px-5 py-6 text-center">
          <h2 className="text-lg font-semibold text-stone-900">Chat with an astrologer</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Prefer a quick back-and-forth? Open a chat after you sign in —{" "}
            <strong className="text-stone-800">first 3 minutes free</strong>, then standard
            rates apply.
          </p>
          <Link
            href="/auth/login"
            className="mt-5 inline-block text-sm font-semibold text-amber-950 underline decoration-amber-900/30 underline-offset-4 hover:decoration-amber-900"
          >
            Sign in to start chat
          </Link>
        </div>
        <p className="mt-10 text-center text-xs text-stone-400">
          <Link href="/blog" className="font-medium text-stone-500 hover:text-stone-700">
            Read the journal
          </Link>
        </p>
      </section>
    </div>
  );
}
