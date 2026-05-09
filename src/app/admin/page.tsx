import Link from "next/link";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const supabase = await createServerSupabaseClient();
  const [{ count: userCount }, { count: reportCount }] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase
      .from("astrology_reports")
      .select("*", { count: "exact", head: true }),
  ]);

  const cards = [
    { title: "Registered profiles", value: userCount ?? "—", href: "/admin/activity" },
    { title: "Astrology reports", value: reportCount ?? "—", href: "/admin/reports" },
    {
      title: "AI prompt versions",
      subtitle: "Versioned lineage for reports & chat",
      href: "/admin/prompts",
    },
    {
      title: "Analytics stack",
      subtitle: "PostHog / GA dashboards (wire in provider keys)",
      href: "/admin/analytics",
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Control center</h1>
        <p className="mt-2 text-sm text-neutral-400">
          High-traffic operations rely on caching, pagination, and RLS — prefer
          service-role cron jobs only in trusted workers.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <li key={c.title}>
            <Link
              href={c.href}
              className="block rounded-xl border border-neutral-800 bg-neutral-900 p-6 transition hover:border-neutral-600"
            >
              <span className="text-sm font-medium text-amber-200">{c.title}</span>
              {c.value !== undefined ? (
                <span className="mt-4 block text-3xl tabular-nums text-white">
                  {c.value}
                </span>
              ) : null}
              {"subtitle" in c && c.subtitle ? (
                <span className="mt-2 block text-sm text-neutral-500">
                  {c.subtitle}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
