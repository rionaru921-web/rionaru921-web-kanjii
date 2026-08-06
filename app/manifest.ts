import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "幹事ラボ",
    short_name: "幹事ラボ",
    description: "飲み会・旅行・イベントの幹事業務を、幹事ラボがシンプルに。",
    start_url: "/",
    display: "standalone",
    background_color: "#fdfcf9",
    theme_color: "#b8935a",
    orientation: "portrait",
    lang: "ja",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["productivity", "lifestyle", "social"],
  };
}
