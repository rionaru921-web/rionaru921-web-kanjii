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
};

export default nextConfig;
