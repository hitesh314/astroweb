import type { Metadata } from "next";
import Link from "next/link";

import MarketingHeader from "@/components/marketing-header";

export const metadata: Metadata = {
  title: "Services & offerings | AstroMarriage",
  description:
    "Vedic marriage insights, kundli, compatibility, AI reports, and consultations — explore everything before you create an account.",
};

const CHECKOUT_NEXT = "/dashboard/subscription";

function BuyButton({ label = "Choose plan" }: { label?: string }) {
  return (
    <Link
      href={`/auth/login?next=${encodeURIComponent(CHECKOUT_NEXT)}`}
      className="inline-flex rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-[#fdfcf9] shadow-sm hover:bg-stone-800"
    >
      {label}
    </Link>
  );
}

export default function ServicesPage() {
  const cards = [
    {
      title: "Celestial union forecast",
      body: "Love, arranged, and hybrid marriage scores with confidence bands and an AI narrative you can share.",
      from: "₹499",
    },
    {
      title: "Kundli & birth chart storage",
      body: "Save birth place, time zone, and raw chart JSON for repeat analyses and PDF exports.",
      from: "₹299",
    },
    {
      title: "Partner compatibility",
      body: "Pair two saved kundli profiles for a dedicated compatibility reading and score.",
      from: "₹699",
    },
    {
      title: "AI marriage coach (chat)",
      body: "Private chat history stored under your account with prompt lineage for trust and safety.",
      from: "Subscribe",
    },
    {
      title: "Expert consultations",
      body: "Book a human astrologer; calendar and notes sync to your profile when you check out.",
      from: "₹1,499",
    },
    {
      title: "Shareable report cards",
      body: "Generated visuals land in secure storage — perfect for Instagram-ready shares.",
      from: "Add-on",
    },
  ];

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#fdfcf9] to-[#f3ebe0] text-stone-900">
      <MarketingHeader />
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-800/90">
          Everything we offer
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl">
          Explore every service first
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-stone-600">
          There is no paywall to browse. When you are ready to purchase, save a reading, or
          unlock subscriptions, we will ask you to sign in — one quick step.
        </p>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2">
          {cards.map((c) => (
            <li
              key={c.title}
              className="flex flex-col rounded-2xl border border-stone-200 bg-white p-7 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-stone-900">{c.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">
                {c.body}
              </p>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-stone-500">
                From {c.from}
              </p>
            </li>
          ))}
        </ul>

        <section className="mt-20 rounded-3xl border border-stone-200 bg-white p-10 shadow-inner shadow-stone-100">
          <h2 className="text-2xl font-semibold text-stone-900">Plans</h2>
          <p className="mt-2 text-sm text-stone-600">
            Pick a tier when you are ready — signing in happens at checkout, not before you
            explore.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              {
                name: "Seeker",
                price: "Free",
                blurb: "Browse journal + service catalogue",
              },
              {
                name: "Union",
                price: "₹799 / mo",
                blurb: "Reports, kundli saves, and sharing",
              },
              {
                name: "Destiny",
                price: "₹1,999 / mo",
                blurb: "Everything + priority consults & chat",
              },
            ].map((p) => (
              <div
                key={p.name}
                className="flex flex-col rounded-2xl border border-stone-100 bg-stone-50/80 p-6"
              >
                <p className="text-sm font-semibold text-amber-900">{p.name}</p>
                <p className="mt-2 text-2xl font-semibold text-stone-900">{p.price}</p>
                <p className="mt-2 flex-1 text-sm text-stone-600">{p.blurb}</p>
                {p.name === "Seeker" ? (
                  <Link
                    href="/"
                    className="mt-6 text-center text-sm font-semibold text-stone-700 underline underline-offset-4 hover:text-stone-900"
                  >
                    Keep exploring
                  </Link>
                ) : (
                  <div className="mt-6">
                    <BuyButton label={`Get ${p.name}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <p className="mt-12 text-center text-sm text-stone-500">
          Questions?{" "}
          <Link href="/blog" className="font-medium text-amber-900 hover:underline">
            Read our journal
          </Link>{" "}
          or return{" "}
          <Link href="/" className="font-medium text-amber-900 hover:underline">
            home
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
