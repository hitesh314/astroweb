import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getBlogPostBySlug } from "@/lib/services/blog";
import { PRACTITIONER } from "@/lib/site/practitioner";
import type { Database } from "@/types/database.types";

import { createClient } from "@supabase/supabase-js";


export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return [];
  /** Build-time anon client (no user cookies); RLS permits reading published rows. */
  const supabase = createClient<Database>(url, key, {
    auth: { persistSession: false },
  });

  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("published", true)
    .limit(200);

  return (data ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Not found" };
  const title = post.seo_title ?? post.title;
  const description = post.seo_description ?? post.excerpt ?? undefined;
  return {
    title: `${title} | ${PRACTITIONER.shortName}`,
    description: description ?? "",
    openGraph: { title, description },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const publishedLabel = post.published_at || post.created_at;

  return (
    <article className="mx-auto max-w-3xl px-6 py-14 text-stone-900">
      <Link href="/blog" className="text-sm text-stone-500 hover:text-stone-800">
        ← Journal
      </Link>
      <header className="mt-8">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-800/90">
          {new Date(publishedLabel).toLocaleDateString("en-IN")}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
          {post.title}
        </h1>
      </header>
      <div className="markdown mx-auto mt-10 max-w-2xl [&_blockquote]:border-l-4 [&_blockquote]:border-amber-200 [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-stone-700 [&_h2]:mt-12 [&_h2]:scroll-mt-28 [&_h2]:text-3xl [&_h2]:font-semibold [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-medium [&_p]:leading-relaxed [&_p]:tracking-tight [&_strong]:font-semibold [&_strong]:text-stone-900 [&_a]:underline-offset-4 [&_a:hover]:underline [&_table]:overflow-x-auto [&_td]:border [&_td]:border-stone-200 [&_td]:px-3 [&_td]:py-2 [&_thead]:border-b [&_thead]:border-stone-900 [&_ul]:list-disc [&_ul]:pl-6 [&_img]:rounded-xl [&_hr]:border-stone-200">
        <Markdown remarkPlugins={[remarkGfm]}>{post.content_md}</Markdown>
      </div>
    </article>
  );
}
