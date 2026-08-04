import Link from "next/link";
import Logo from "@/components/shared/Logo";
import HotpepperAttribution from "@/components/shared/HotpepperAttribution";
import { AdSlot } from "@/components/ads/AdSlot";
import FooterFeedbackTrigger from "./FooterFeedbackTrigger";

const FOOTER_COLUMNS = [
  {
    heading: "サービス",
    links: [
      { label: "飲み会", href: "/nomikai" },
      { label: "旅行", href: "/travel" },
      { label: "イベント", href: "/event" },
      { label: "会社の幹事", href: "/company" },
    ],
  },
  {
    heading: "サポート",
    links: [
      { label: "料金", href: "/pricing" },
      { label: "使い方", href: "/#how-it-works" },
      { label: "よくあるご質問", href: "/#faq" },
      { label: "アンケート", href: "/surveys" },
    ],
  },
  {
    heading: "会社情報",
    links: [
      { label: "幹事ラボについて", href: "/about" },
      { label: "利用規約", href: "/legal/terms" },
      { label: "ベータ利用規約", href: "/legal/beta" },
      { label: "プライバシーポリシー", href: "/legal/privacy" },
      { label: "特定商取引法に基づく表記", href: "/legal/commerce" },
      { label: "お問い合わせ", href: "/legal/contact" },
    ],
  },
];

// lucide-react dropped brand/logo icons, so the GitHub mark is inlined here
// instead of importing a package that no longer ships it.
function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.42 7.86 10.95.57.1.78-.25.78-.55 0-.27-.01-1.14-.02-2.07-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.07.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .3.2.66.79.55A10.99 10.99 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.24 2h3.29l-7.19 8.21L23 22h-6.62l-5.18-6.77L5.24 22H1.94l7.7-8.8L1 2h6.8l4.69 6.19L18.24 2Zm-1.16 18h1.82L7.02 3.9H5.06l12.02 16.1Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-gold/10 bg-surface-secondary px-4 py-16">
      <div className="max-w-5xl mx-auto flex flex-col gap-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm text-ink-secondary leading-relaxed">
              あらゆる集まりを、あなたが幹事する。
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://x.com/kanji_lab_dev"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (旧Twitter)"
                className="text-ink-muted hover:text-gold transition-colors"
              >
                <XIcon size={18} />
              </a>
              <a
                href="https://github.com/rionaru921-web"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-ink-muted hover:text-gold transition-colors"
              >
                <GithubIcon size={18} />
              </a>
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

        <AdSlot slot="footer" />

        <div className="text-center">
          <a
            href="mailto:steplife.contact@gmail.com"
            className="text-xs text-ink-secondary hover:text-gold transition-colors"
          >
            お問い合わせ: steplife.contact@gmail.com
          </a>
          <div>
            <FooterFeedbackTrigger />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <p className="text-center text-xs text-ink-muted">© 2026 幹事ラボ. All rights reserved.</p>
          <span className="text-[11px] tracking-[0.2em] font-serif text-ink-muted/70">EST. 2026</span>
        </div>
      </div>
    </footer>
  );
}
