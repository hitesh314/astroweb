import { redirect } from "next/navigation";

import DashboardSiteHeader from "@/components/dashboard-site-header";
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
      <DashboardSiteHeader displayName={display} />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
