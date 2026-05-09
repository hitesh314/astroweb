import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const supabase = await createServerSupabaseClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, published, published_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-white">Blog posts</h1>
      <p className="text-sm text-neutral-400">
        Create & edit drafts via Admin API or forthcoming editor; public reads are
        RLS gated.
      </p>
      {!posts?.length ? (
        <div className="rounded-xl border border-dashed border-neutral-700 px-6 py-12 text-center text-sm text-neutral-500">
          No posts yet — insert seed rows via Supabase SQL or the dashboard.
        </div>
      ) : (
        <ul className="divide-y divide-neutral-800 rounded-xl border border-neutral-800 bg-neutral-900">
          {posts.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-white">{p.title}</p>
                <p className="text-xs text-neutral-500">{p.slug}</p>
              </div>
              <div className="text-right text-xs text-neutral-400">
                {p.published ? "Published" : "Draft"}
                {p.published_at ? (
                  <>
                    {" "}
                    · {new Date(p.published_at).toLocaleDateString("en-IN")}
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
