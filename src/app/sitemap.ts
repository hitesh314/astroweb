import type { MetadataRoute } from "next";

function base(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000"
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const b = base();

  return [
    {
      url: `${b}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    { url: `${b}/services`, lastModified: new Date(), priority: 0.85 },
    { url: `${b}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${b}/auth/login`, priority: 0.3 },
  ];
}
