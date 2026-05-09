import Link from "next/link";

import { listPublishedBlogPosts } from "@/lib/services/blog";
import { PRACTITIONER } from "@/lib/site/practitioner";

export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: `Astrology journal | ${PRACTITIONER.shortName}`,
    description: `${PRACTITIONER.shortName}'s occasional essays — marriage astrology, rituals, plain-language explainers.`,
  };
}

export default async function BlogIndexPage() {
  const posts = await listPublishedBlogPosts(50);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-stone-900">
      <h1 className="text-3xl font-semibold tracking-tight">Journal</h1>
      <p className="mt-2 text-stone-600">
        SEO-first pages — ISR revalidated every hour (`revalidate`).
      </p>
      <ul className="mt-10 space-y-6">
        {posts.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/70 px-6 py-14 text-center text-sm text-stone-500">
            Publish entries in Supabase Dashboard or via authenticated admin tooling.
          </li>
        ) : (
          posts.map((p) => (
            <li key={p.id}>
              <article>
                <Link
                  href={`/blog/${p.slug}`}
                  className="text-xl font-medium text-stone-900 underline-offset-4 hover:underline"
                >
                  {p.title}
                </Link>
                {p.excerpt ? (
                  <p className="mt-2 text-sm text-stone-600">{p.excerpt}</p>
                ) : null}
              </article>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
