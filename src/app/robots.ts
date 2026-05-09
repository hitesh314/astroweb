import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const b =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const origin = b || "http://localhost:3000";
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin/" },
    sitemap: `${origin}/sitemap.xml`,
  };
}
