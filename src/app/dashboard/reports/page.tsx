import { listAstrologyReports } from "@/lib/services/reports";

export default async function ReportsPage() {
  const { data: rows, error } = await listAstrologyReports(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Astrology reports
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Each row follows RLS: you only see reports bound to your user id. Queries are
          paginated (15/page) — scale with cursor pagination as traffic grows.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not fetch reports ({error}). Check Supabase connection.
        </p>
      ) : null}

      {!rows.length && !error ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-14 text-center text-sm text-stone-500">
          Nothing generated yet — create a prediction pipeline that inserts into{" "}
          <code className="rounded bg-stone-100 px-2 py-0.5 text-xs">
            astrology_reports.full_report_json
          </code>
          .
        </div>
      ) : null}

      {!error && rows.length > 0 ? (
        <ul className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-start justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-[200px]">
                <p className="font-medium text-stone-900">
                  {new Date(row.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="mt-2 line-clamp-3 max-w-xl text-sm text-stone-600">
                  {row.ai_summary ??
                    JSON.stringify(row.full_report_json ?? {}).slice(0, 220)}
                  …
                </p>
              </div>
              <div className="text-right text-sm tabular-nums text-stone-700">
                {row.love_marriage_score != null ? (
                  <div>
                    Love: {Math.round(Number(row.love_marriage_score))}%
                  </div>
                ) : null}
                {row.hybrid_score != null ? (
                  <div>Hybrid: {Math.round(Number(row.hybrid_score))}%</div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
