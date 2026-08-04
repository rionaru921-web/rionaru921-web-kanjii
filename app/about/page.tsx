import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/shared/Logo";
import ChochinIcon from "@/components/shared/ChochinIcon";

export const metadata: Metadata = {
  title: "幹事ラボについて",
  description:
    "飲み会・歓迎会・旅行などあらゆる集まりの幹事を楽にするアプリ「幹事ラボ」。開発の経緯とこだわり、使っている技術を紹介します。",
};

const KODAWARI = [
  {
    title: "完全無料",
    body: "幹事は貴重な役割です。金銭的な負担なく使えることを最優先にしています。",
  },
  {
    title: "ログイン不要で共有",
    body: "参加者に登録を強要しません。共有されたURLを開くだけで、日程や会場を確認できます。",
  },
  {
    title: "1つの画面で完結",
    body: "プラン作成に必要な情報を、章立てのストーリー形式でまとめて入力できます。",
  },
  {
    title: "参加者への配慮",
    body: "アンケート機能で、日程・予算・希望を参加者から一括でヒアリングできます。",
  },
];

const TECH_STACK = ["Next.js (App Router)", "Supabase (Auth / Database / Realtime)", "Tailwind CSS", "Vercel", "Claude API (AI補助機能)"];

// lucide-react はブランドアイコンを提供していないため、X の
// アイコンはここでもインラインSVGとして定義する
// (components/landing/Footer.tsx の GithubIcon と同じ方針)。
function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.24 2h3.29l-7.19 8.21L23 22h-6.62l-5.18-6.77L5.24 22H1.94l7.7-8.8L1 2h6.8l4.69 6.19L18.24 2Zm-1.16 18h1.82L7.02 3.9H5.06l12.02 16.1Z" />
    </svg>
  );
}

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.42 7.86 10.95.57.1.78-.25.78-.55 0-.27-.01-1.14-.02-2.07-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.07.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .3.2.66.79.55A10.99 10.99 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <main className="px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-[640px] mx-auto">
        <div className="flex items-center justify-between mb-10">
          <Logo size="sm" />
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-gold transition-colors"
          >
            <ArrowLeft size={16} />
            トップに戻る
          </Link>
        </div>

        <div className="text-center mb-16">
          <ChochinIcon className="w-14 h-14 mx-auto mb-6" />
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mb-3 tracking-tight">
            幹事ラボについて
          </h1>
          <p className="text-ink-secondary">あらゆる集まりを、あなたが幹事する</p>
        </div>

        <section className="mb-14">
          <h2 className="font-serif text-xl font-bold text-ink mb-4">◇ なぜ作ったか</h2>
          <p className="text-ink leading-relaxed">
            「幹事、また君か」って言われて絶望した経験、何度もありました。日程調整、店選び、会費計算、参加者への共有……幹事の作業は、想像以上に面倒でした。
          </p>
          <p className="text-ink leading-relaxed mt-4">
            「もう自分が幹事じゃなくなるアプリを作ろう」。そう決めて開発したのが幹事ラボです。
          </p>
        </section>

        <section className="mb-14">
          <h2 className="font-serif text-xl font-bold text-ink mb-4">◇ こだわり</h2>
          <ul className="flex flex-col gap-5">
            {KODAWARI.map((item) => (
              <li key={item.title}>
                <p className="text-sm font-semibold text-gold mb-1">{item.title}</p>
                <p className="text-sm text-ink-secondary leading-relaxed">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-14">
          <h2 className="font-serif text-xl font-bold text-ink mb-4">◇ 技術スタック</h2>
          <ul className="flex flex-wrap gap-2">
            {TECH_STACK.map((tech) => (
              <li
                key={tech}
                className="text-xs text-ink-secondary rounded-full border border-gold/15 px-3 py-1.5"
              >
                {tech}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-16">
          <h2 className="font-serif text-xl font-bold text-ink mb-4">◇ 開発者</h2>
          <p className="text-sm text-ink-secondary leading-relaxed">個人開発者が一人で開発・運営しています。</p>
          <div className="flex items-center gap-4 mt-4">
            <a
              href="https://x.com/kanji_lab_dev"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (旧Twitter)"
              className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-gold transition-colors"
            >
              <XIcon size={16} />
              X
            </a>
            <a
              href="https://github.com/rionaru921-web"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-gold transition-colors"
            >
              <GithubIcon size={16} />
              GitHub
            </a>
          </div>
        </section>

        <section className="text-center py-10 border-t border-gold/10">
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">さあ、幹事を楽しもう</h2>
          <Link
            href="/manual-plans/new"
            className="inline-flex items-center justify-center gap-2.5 rounded-full bg-gold-gradient text-white font-bold shadow-gold hover:shadow-gold-lg hover:brightness-110 transition-shadow duration-200 text-base py-4 px-10"
          >
            プランを作ってみる
          </Link>
        </section>
      </div>
    </main>
  );
}
