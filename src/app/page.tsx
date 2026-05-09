import Image from "next/image";
import Link from "next/link";

import MarketingHeader from "@/components/marketing-header";
import { CHAT_LOGIN_HREF } from "@/lib/site/chat-cta";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Loose Google Maps–style palette for avatar discs (initial only, no photo). */
const AVATAR_RING = ["bg-emerald-600", "bg-blue-600", "bg-purple-600", "bg-orange-600"] as const;

const reviews = [
  {
    displayName: "Ananya Sharma",
    initial: "A",
    rating: 5 as const,
    when: "3 weeks ago",
    text:
      "Was torn between someone I chose and a match my parents liked. Wanted it said plainly — got that. Calm wording, no fear-mongering. Easier conversation at home afterwards.",
    meta: "Mumbai · 2 reviews",
  },
  {
    displayName: "Rahul K.",
    initial: "R",
    rating: 5 as const,
    when: "1 month ago",
    text:
      "Most apps give one-liners this product actually breaks down love vs arranged with reasons. Pressure from both sides suddenly made sense lol",
    meta: "Bengaluru · 1 review",
  },
  {
    displayName: "Priya Nair",
    initial: "P",
    rating: 4 as const,
    when: "5 weeks ago",
    text:
      "Didnt tell anyone i booked. The blended outcome part matched what i was already feeling — sort of validating. Only wish it was a touch shorter.",
    meta: "Kochi · 3 reviews",
  },
  {
    displayName: "Karan Patel",
    initial: "K",
    rating: 5 as const,
    when: "2 months ago",
    text:
      "Straight talk not generic rashi fluff. Felt fair before dropping money on a bigger puja / consultation elsewhere",
    meta: "Ahmedabad · third visit",
  },
] as const;

function StarRow({ rating }: { rating: 1 | 2 | 3 | 4 | 5 }) {
  const path =
    "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

  return (
    <span className="inline-flex items-center gap-px" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className="h-[18px] w-[18px] shrink-0"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill={i < rating ? "#fbbc04" : "#dadce0"}
            d={path}
            className={i >= rating ? "opacity-[0.55]" : undefined}
          />
        </svg>
      ))}
    </span>
  );
}

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let showAdminChatShortcut = false;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("is_admin, role")
      .eq("id", user.id)
      .maybeSingle();
    showAdminChatShortcut = profile?.is_admin === true || profile?.role === "admin";
  }

  return (
    <div className="min-h-dvh bg-[#fdfcf9] text-stone-900">
      <MarketingHeader />

      {showAdminChatShortcut ? (
        <div className="border-b border-amber-900/10 bg-amber-50/95 px-5 py-2.5 text-center">
          <Link
            href="/admin/chat"
            className="text-sm font-semibold tracking-tight text-amber-950 underline decoration-amber-900/35 underline-offset-4 hover:text-amber-900 hover:decoration-amber-900"
          >
            Admin — open chat inbox
          </Link>
        </div>
      ) : null}

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
              href={CHAT_LOGIN_HREF}
              className="text-sm font-semibold text-amber-950 underline decoration-amber-900/30 underline-offset-4 hover:decoration-amber-900"
            >
              Chat now
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

      {/* Reviews (Maps-style layout — customer feedback, not scraped from Google) */}
      <section className="mx-auto max-w-xl border-t border-stone-200 px-5 py-14">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <h2 className="text-[1.375rem] font-normal tracking-tight text-[#202124]">
            Reviews
          </h2>
          <p className="text-xs text-[#5f6368]">
            Feedback from recent bookings · shown in a familiar format ·{" "}
            <span className="whitespace-nowrap">scroll sideways</span>
          </p>
        </div>

        <div className="-mx-5 mt-8 sm:mx-0">
          <ul
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-5 pb-3 pt-0.5 [-webkit-overflow-scrolling:touch]"
            style={{ scrollbarWidth: "thin" }}
          >
            {reviews.map((r, i) => (
              <li key={`${r.displayName}-${r.when}`} className="snap-start snap-always shrink-0">
                <article className="flex h-full w-[min(17.5rem,calc(100vw-5rem))] flex-col rounded-xl border border-[#e8eaed] bg-white px-4 py-5 shadow-sm sm:w-[17.75rem]">
                  <div className="flex gap-3">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full font-medium text-[0.9375rem] text-white ring-2 ring-white ${AVATAR_RING[i % AVATAR_RING.length]}`}
                      aria-hidden
                    >
                      {r.initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-tight text-[#202124]">{r.displayName}</p>
                      <p className="mt-0.5 text-xs leading-snug text-[#5f6368]">{r.meta}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#5f6368]">
                        <StarRow rating={r.rating} />
                        <span className="tabular-nums" aria-hidden>
                          ·
                        </span>
                        <span className="tabular-nums">{r.when}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 flex-1 whitespace-pre-wrap text-[0.875rem] leading-relaxed text-[#3c4043]">
                    {r.text}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA — confirm pricing in chat */}
      <section className="mx-auto max-w-xl border-t border-stone-200 px-5 py-14 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-800/90">
          Marriage reading
        </p>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-stone-950">
          Chat now
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-stone-600">
          Full written report focused on marriage pathway — love, arranged, or in between —
          delivered after we have your accurate birth details and confirm everything in chat.
        </p>
        <div className="mt-8">
          <Link
            href={CHAT_LOGIN_HREF}
            className="inline-flex rounded-full bg-stone-900 px-8 py-3 text-sm font-semibold text-[#fdfcf9] shadow-sm hover:bg-stone-800"
          >
            Chat now
          </Link>
          <p className="mt-3 text-xs text-stone-500">
            We&apos;ll share what&apos;s included and how to pay in the conversation — nothing
            is charged from this screen.
          </p>
        </div>
      </section>

      {/* Astrologer chat */}
      <section className="mx-auto max-w-xl border-t border-stone-200 px-5 pb-20 pt-14">
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/40 px-5 py-6 text-center">
          <h2 className="text-lg font-semibold text-stone-900">Chat with an astrologer</h2>
          <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard/chat"
              className="inline-flex rounded-full bg-stone-900 px-7 py-2.5 text-sm font-semibold text-[#fdfcf9] hover:bg-stone-800"
            >
              Chat now
            </Link>
            <Link
              href="/auth/login?next=/dashboard/chat"
              className="text-sm font-semibold text-amber-950 underline decoration-amber-900/30 underline-offset-4 hover:decoration-amber-900"
            >
              Sign in first
            </Link>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-stone-400">
          <Link href="/about" className="font-medium text-stone-500 hover:text-stone-700">
            About
          </Link>
        </p>
      </section>
    </div>
  );
}
