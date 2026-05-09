import Link from "next/link";

export default function DashboardHomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-gradient-to-br from-amber-50 to-white p-8 shadow-inner shadow-stone-200/50 ring-1 ring-stone-100">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          Your celestial command center
        </h1>
        <p className="mt-3 max-w-2xl text-stone-600">
          Persisted kundli data, GPT-ready report JSONs, encrypted chat timelines, and
          shareable artefacts — optimised for SSR + Suspense hydration on mobile
          networks across India.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/dashboard/reports"
            className="rounded-full bg-stone-900 px-7 py-2.5 text-sm font-semibold text-[#fdfcf9] hover:bg-stone-800"
          >
            View astrology reports
          </Link>
          <Link
            href="/dashboard/kundli"
            className="rounded-full border border-stone-300 bg-white px-7 py-2.5 text-sm font-semibold text-stone-900 hover:bg-stone-50"
          >
            Manage saved kundli
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Consultation chat", "/dashboard/chat", "Text, photos, voice notes"],
          ["Saved readings", "/dashboard/reports", "Snapshots with PDF export"],
          ["Compatibility", "#", "Twin kundli analysis queue"],
          ["Consultations", "#", "Human astrologers (stub)"],
        ].map(([title, href, subtitle]) => (
          <Link
            key={title}
            href={href}
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm hover:border-stone-300 hover:shadow"
          >
            <h2 className="font-semibold text-stone-900">{title}</h2>
            <p className="mt-2 text-sm text-stone-500">{subtitle}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
