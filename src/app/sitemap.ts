import type { MetadataRoute } from "next";

import { listPublishedBlogPosts } from "@/lib/services/blog";

function base(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000"
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const b = base();
  const posts = await listPublishedBlogPosts(400);

  const blogUrls: MetadataRoute.Sitemap =
    posts.map((p) => ({
      url: `${b}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at ?? p.created_at),
      changeFrequency: "weekly",
      priority: 0.75,
    })) ?? [];

  return [
    {
      url: `${b}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    { url: `${b}/blog`, lastModified: new Date(), priority: 0.85 },
    { url: `${b}/auth/login`, priority: 0.3 },
    ...blogUrls,
  ];
}
