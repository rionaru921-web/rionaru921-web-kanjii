import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Noto_Serif_JP, Playfair_Display } from "next/font/google";
import { Analytics } from "@/components/shared/Analytics";
import FloatingBottomNav from "@/components/layout/FloatingBottomNav";
import InstallPrompt from "@/components/pwa/InstallPrompt";
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
    default: "幹事ラボ - あらゆる集まりを、あなたが幹事する。",
    template: "%s | 幹事ラボ",
  },
  description:
    "飲み会・旅行・イベントの幹事業務を、幹事ラボがシンプルに。お店選び、割り勘計算、参加者への共有まで、あなたの「幹事する」を支えます。",
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
    title: "幹事ラボ - あらゆる集まりを、あなたが幹事する。",
    description: "飲み会・旅行・イベントの幹事業務を、幹事ラボがシンプルに",
    url: "/",
    siteName: "幹事ラボ",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "幹事ラボ - あらゆる集まりを、あなたが幹事する。",
    description: "飲み会・旅行・イベントの幹事業務を、幹事ラボがシンプルに",
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
  // Deliberately no `icons` field here — app/favicon.ico, app/icon.tsx, and
  // app/apple-icon.tsx already generate correctly-sized <link> tags via
  // Next's file convention. A manual `icons.icon` entry without a `sizes`
  // attribute was clobbering that (duplicate rel="icon" tags, one missing
  // sizes), which is what caused browser tabs to fall back to a blank/
  // generic icon instead of the lantern.
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "幹事ラボ",
  },
  other: {
    "mobile-web-app-capable": "yes",
    // iOS Safariで開いた時、画面上部に「開く」ボタン付きのスマートアプリ
    // バナーを表示させる。iOS版アプリのApp ID: 6800397796
    "apple-itunes-app": "app-id=6800397796",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FDFCF9",
  interactiveWidget: "resizes-content",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "幹事ラボ",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://kanji-lab.com",
  description: "あらゆる集まりを、あなたが幹事する。URLを送るだけ。",
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
        className={`${notoSansJP.variable} ${notoSerifJP.variable} ${playfairDisplay.variable} antialiased bg-background text-foreground min-h-screen font-sans`}
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
        <InstallPrompt />
        <Analytics />
      </body>
    </html>
  );
}
