import type { Metadata } from "next";
import Link from "next/link";

import MarketingHeader from "@/components/marketing-header";
import { whatsappPlanInterestHref } from "@/lib/contact/whatsapp-payment";

export const metadata: Metadata = {
  title: "Services & offerings | AstroMarriage",
  description:
    "Vedic marriage insights, kundli, compatibility, AI reports, and consultations — explore everything before you create an account.",
};

function BuyButton({ label, planName }: { label: string; planName: string }) {
  return (
    <a
      href={whatsappPlanInterestHref(planName)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-[#fdfcf9] shadow-sm hover:bg-stone-800"
    >
      {label}
    </a>
  );
}

export default function ServicesPage() {
  const cards = [
    {
      title: "Celestial union forecast",
      body: "Love, arranged, and hybrid marriage scores with confidence bands and an AI narrative you can share.",
      priceNote: "Pricing on WhatsApp",
    },
    {
      title: "Kundli & birth chart storage",
      body: "Save birth place, time zone, and raw chart JSON for repeat analyses and PDF exports.",
      priceNote: "Pricing on WhatsApp",
    },
    {
      title: "Partner compatibility",
      body: "Pair two saved kundli profiles for a dedicated compatibility reading and score.",
      priceNote: "Pricing on WhatsApp",
    },
    {
      title: "AI marriage coach (chat)",
      body: "Private chat history stored under your account with prompt lineage for trust and safety.",
      priceNote: "Subscription · ask on WhatsApp",
    },
    {
      title: "Expert consultations",
      body: "Book a human astrologer; calendar and notes sync to your profile when you check out.",
      priceNote: "Pricing on WhatsApp",
    },
    {
      title: "Shareable report cards",
      body: "Generated visuals land in secure storage — perfect for Instagram-ready shares.",
      priceNote: "Add-on · ask on WhatsApp",
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
          There is no paywall to browse. When you purchase or unlock features in your
          dashboard, we may ask you to sign in — one quick step. Payment is coordinated on
          WhatsApp (+91 9358214529).
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
                {c.priceNote}
              </p>
            </li>
          ))}
        </ul>

        <section className="mt-20 rounded-3xl border border-stone-200 bg-white p-10 shadow-inner shadow-stone-100">
          <h2 className="text-2xl font-semibold text-stone-900">Plans</h2>
          <p className="mt-2 text-sm text-stone-600">
            Pick a tier when you are ready — we&apos;ll continue on WhatsApp for payment and
            details.
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
                price: "On request",
                blurb: "Reports, kundli saves, and sharing",
              },
              {
                name: "Destiny",
                price: "On request",
                blurb: "Everything + priority consults & chat",
              },
            ].map((p) => (
              <div
                key={p.name}
                className="flex flex-col rounded-2xl border border-stone-100 bg-stone-50/80 p-6"
              >
                <p className="text-sm font-semibold text-amber-900">{p.name}</p>
                <p
                  className={`mt-2 font-semibold text-stone-900 ${p.price === "Free" ? "text-2xl" : "text-lg tracking-tight"}`}
                >
                  {p.price}
                </p>
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
                    <BuyButton label={`Get ${p.name}`} planName={p.name} />
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
