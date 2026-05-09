import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/actions/auth";
import { PRACTITIONER } from "@/lib/site/practitioner";
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
    .select("role, is_admin")
    .eq("id", user.id)
    .single();

  const isElevatedAdmin = profile?.is_admin === true || profile?.role === "admin";
  if (!isElevatedAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-50">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold tracking-wide text-amber-200">
              {PRACTITIONER.shortName} · Admin
            </span>
            <Link
              href="/admin/chat"
              className="rounded-lg border border-amber-500/45 bg-amber-950/50 px-3 py-2 text-sm font-medium text-amber-100 shadow-sm hover:border-amber-400/70 hover:bg-amber-900/45"
            >
              Inbox — all messages
            </Link>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm text-neutral-300">
            <Link href="/admin" className="hover:text-white">
              Overview
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
