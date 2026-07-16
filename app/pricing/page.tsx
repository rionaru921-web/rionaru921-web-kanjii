import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import Logo from "@/components/shared/Logo";

export const metadata: Metadata = {
  title: "料金プラン",
  description: "幹事ラボの料金プランについてのご案内です。現在はベータ版のため全機能無料でご利用いただけます。",
};

const BETA_FEATURES = [
  "AI提案(飲み会・旅行)",
  "手動プラン作成・共有",
  "割り勘計算(傾斜配分含む)",
  "PDF/QR/ICS出力",
];

export default function PricingPage() {
  return (
    <main className="px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-[640px] mx-auto">
        <div className="flex items-center justify-between mb-10">
          <Logo size="sm" />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-gold transition-colors"
          >
            <ArrowLeft size={16} />
            ダッシュボードに戻る
          </Link>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mb-3 tracking-tight">
          料金プラン
        </h1>
        <p className="text-ink-secondary leading-relaxed mb-8">
          現在はベータ版のため、全機能無料でご利用いただけます。
        </p>

        <div className="rounded-3xl bg-surface-tertiary shadow-warm p-6 sm:p-8">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-serif font-bold text-2xl text-ink">ベータ版プラン</span>
            <span className="text-sm text-gold font-semibold">無料</span>
          </div>
          <p className="text-sm text-ink-muted mb-6">正式版移行までの期間限定でご提供中</p>

          <ul className="flex flex-col gap-3">
            {BETA_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-ink-secondary">
                <Check size={16} className="text-gold shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-sm text-ink-muted leading-relaxed">
          今後、Premiumプランを提供予定です。詳細が決まり次第、サイト内でお知らせします。
        </p>
      </div>
    </main>
  );
}
