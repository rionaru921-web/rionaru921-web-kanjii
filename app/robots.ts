import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kanji-lab.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/nomikai",
          "/travel",
          "/history",
          "/manual-plans",
          "/settings",
          "/api",
          "/share",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
