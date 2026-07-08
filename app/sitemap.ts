import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kanjii.app";

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/login`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/signup`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/legal/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/commerce`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/contact`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
