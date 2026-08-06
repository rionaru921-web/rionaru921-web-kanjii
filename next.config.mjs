import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // 開発中はHMRとの干渉・キャッシュ事故を避けるため無効化(本番ビルドのみ有効)。
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "imgfp.hotp.jp" },
      { protocol: "https", hostname: "www.hotpepper.jp" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.travel.rakuten.co.jp" },
    ],
  },
  // kanji-lab.com への完全移行後、旧ドメインへのアクセスを恒久的に
  // 新ドメインへ引き継ぐ(SEO評価の移管に必須)。Vercelのドメイン設定
  // 自体は削除しない — 削除するとリクエストがVercelに届かなくなり、
  // このリダイレクトも機能しなくなる。
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "kanjii.vercel.app" }],
        destination: "https://kanji-lab.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "kanjii.app" }],
        destination: "https://kanji-lab.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default withSerwist(nextConfig);
