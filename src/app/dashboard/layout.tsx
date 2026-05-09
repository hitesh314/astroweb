import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/actions/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const display =
    profile?.full_name ??
    user.user_metadata?.full_name ??
    user.email ??
    user.phone ??
    "Seeker";

  return (
    <div className="min-h-dvh bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white shadow-sm shadow-stone-100">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-50 text-xs font-semibold text-amber-900">
              {display.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-amber-950"
              >
                Your sanctuary
              </Link>
              <p className="text-xs text-stone-500">Signed in as {display}</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-600">
            <Link href="/dashboard" className="hover:text-stone-900">
              Overview
            </Link>
            <Link href="/dashboard/reports" className="hover:text-stone-900">
              Reports
            </Link>
            <Link href="/blog" className="hover:text-stone-900">
              Blog
            </Link>
            <Link href="/dashboard/subscription" className="hover:text-stone-900">
              Subscription
            </Link>
          </nav>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-full border border-stone-300 px-4 py-1.5 text-xs font-medium hover:bg-stone-100"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
    </div>
  );
}
