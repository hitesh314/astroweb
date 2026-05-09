export default function DashboardKundliPage() {
  return (
    <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-12 text-center text-stone-500">
      <p className="text-sm">
        Persist birth chart rows in{" "}
        <code className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-800">
          kundli_data.raw_chart_json
        </code>{" "}
        — wire planetary visualisations lazily behind{" "}
        <code>Suspense</code>.
      </p>
    </div>
  );
}
