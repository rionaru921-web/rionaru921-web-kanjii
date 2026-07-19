import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Noto_Serif_JP, Playfair_Display } from "next/font/google";
import { Analytics } from "@/components/shared/Analytics";
import FloatingBottomNav from "@/components/layout/FloatingBottomNav";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-noto-serif-jp",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://kanji-lab.com"),
  title: {
    default: "幹事ラボ - あらゆる集まりを、AIが幹事します",
    template: "%s | 幹事ラボ",
  },
  description:
    "飲み会・旅行・イベントの幹事業務をAIが自動化。お店選び、割り勘計算、参加者への共有まで、幹事ラボがすべてサポートします。",
  applicationName: "幹事ラボ",
  keywords: [
    "幹事",
    "飲み会",
    "割り勘",
    "AI",
    "旅行計画",
    "イベント",
    "お店探し",
    "宴会",
    "飲み会 幹事 代行",
    "幹事 支援",
    "忘年会",
    "歓迎会",
    "同窓会",
    "会社 飲み会",
    "合コン",
    "日程調整",
    "集金アプリ",
  ],
  authors: [{ name: "幹事ラボ" }],
  creator: "幹事ラボ",
  publisher: "幹事ラボ",
  formatDetection: { email: false, address: false, telephone: false },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    title: "幹事ラボ - あらゆる集まりを、AIが幹事します",
    description: "飲み会・旅行・イベントの幹事業務をAIが自動化",
    url: "/",
    siteName: "幹事ラボ",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "幹事ラボ - あらゆる集まりを、AIが幹事します",
    description: "飲み会・旅行・イベントの幹事業務をAIが自動化",
    creator: "@kanjii_app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F5F0E8",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "幹事ラボ",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://kanji-lab.com",
  description: "あらゆる集まりを、AIが幹事します。URLを送るだけ。",
  inLanguage: "ja",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} ${notoSerifJP.variable} ${playfairDisplay.variable} antialiased bg-[#F5F0E8] text-[#2B2420] min-h-screen font-sans`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* Google AdSense 審査通過後、以下のコメントを外して有効化する。
        import Script from "next/script"; を追加のうえ、
        client 値は実際の ca-pub-XXXXXXXXXXXXXXXX に置き換えること。
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        */}
        {children}
        <FloatingBottomNav />
        <Analytics />
      </body>
    </html>
  );
}
