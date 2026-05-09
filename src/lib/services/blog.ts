import { createServerSupabaseClient } from "@/lib/supabase/server";
import { withRetry } from "@/lib/retry";
import type { Tables } from "@/types/database.types";

export async function listPublishedBlogPosts(limit = 50): Promise<Tables<"blog_posts">[]> {
  const supabase = await createServerSupabaseClient();
  const res = await withRetry(() =>
    supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(limit),
  );

  if (res.error) return [];
  return res.data ?? [];
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<Tables<"blog_posts"> | null> {
  const supabase = await createServerSupabaseClient();
  const res = await withRetry(() =>
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle(),
  );

  if (res.error || !res.data) return null;
  return res.data;
}
