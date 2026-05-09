import Link from "next/link";

export default async function AnalyticsHubPage() {
  return (
    <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-sm text-neutral-300">
      <h1 className="text-xl font-semibold text-white">
        Analytics & attribution
      </h1>
      <p className="text-neutral-400">
        Product analytics flows through PostHog + Google Analytics primitives mounted in
        RootLayout (<code>Vercel Analytics</code> bundles Web Vitals).
      </p>
      <Link
        href="/admin"
        className="inline-block rounded-lg border border-neutral-700 px-4 py-2 text-neutral-100 hover:bg-neutral-800"
      >
        ← Overview
      </Link>
    </div>
  );
}
