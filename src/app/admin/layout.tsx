import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/actions/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/admin");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-50">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <span className="text-sm font-semibold tracking-wide text-amber-200">
            AstroMarriage Admin
          </span>
          <nav className="flex flex-wrap gap-4 text-sm text-neutral-300">
            <Link href="/admin" className="hover:text-white">
              Overview
            </Link>
            <Link href="/admin/blog" className="hover:text-white">
              Blog
            </Link>
            <Link href="/admin/prompts" className="hover:text-white">
              AI prompts
            </Link>
            <Link href="/admin/analytics" className="hover:text-white">
              Analytics
            </Link>
            <Link href="/admin/activity" className="hover:text-white">
              Activity
            </Link>
            <Link href="/dashboard" className="text-neutral-500 hover:text-white">
              User app
            </Link>
          </nav>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-medium hover:bg-neutral-900"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}
