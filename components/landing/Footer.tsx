import Link from "next/link";
import { X, Camera, Music2 } from "lucide-react";
import Logo from "@/components/shared/Logo";
import HotpepperAttribution from "@/components/shared/HotpepperAttribution";

const FOOTER_COLUMNS = [
  {
    heading: "サービス",
    links: [
      { label: "飲み会", href: "/nomikai" },
      { label: "旅行", href: "/travel" },
      { label: "イベント", href: "/event" },
      { label: "会社", href: "/company" },
    ],
  },
  {
    heading: "会社",
    links: [
      { label: "About", href: "/" },
      { label: "採用", href: "/" },
      { label: "お問い合わせ", href: "/legal/contact" },
    ],
  },
  {
    heading: "法務",
    links: [
      { label: "利用規約", href: "/legal/terms" },
      { label: "プライバシーポリシー", href: "/legal/privacy" },
      { label: "特定商取引法に基づく表記", href: "/legal/commerce" },
      { label: "お問い合わせ", href: "/legal/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-gold/10 bg-surface-secondary px-4 py-16">
      <div className="max-w-5xl mx-auto flex flex-col gap-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm text-ink-secondary leading-relaxed">
              あらゆる集まりを、AIが幹事します
            </p>
            <div className="flex items-center gap-4 mt-6">
              <Link href="/" aria-label="X" className="text-ink-muted hover:text-gold transition-colors">
                <X size={18} />
              </Link>
              <Link href="/" aria-label="Instagram" className="text-ink-muted hover:text-gold transition-colors">
                <Camera size={18} />
              </Link>
              <Link href="/" aria-label="TikTok" className="text-ink-muted hover:text-gold transition-colors">
                <Music2 size={18} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 sm:gap-14">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.heading}>
                <h4 className="text-xs font-semibold text-ink mb-3 tracking-wide">
                  {col.heading}
                </h4>
                <ul className="flex flex-col gap-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-xs text-ink-secondary hover:text-gold transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <HotpepperAttribution />

        <p className="text-center text-xs text-ink-muted">
          © 2026 Kanjii. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
