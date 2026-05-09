export default function AdminActivityPage() {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-8">
      <h1 className="text-lg font-semibold text-white">User activity</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Stream signup & report telemetry from Supabase Logs + PostHog; surface
        last-active here via materialized rollup when scale demands it.
      </p>
    </div>
  );
}
