import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kanjii.app";

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
          "/settings",
          "/api",
          "/share",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
