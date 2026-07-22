import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import Logo from "@/components/shared/Logo";
import PremiumWaitlistForm from "@/components/premium/PremiumWaitlistForm";
import { PLAN_LIMITS } from "@/lib/plans/limits";

export const metadata: Metadata = {
  title: "料金プラン",
  description: "幹事ラボの料金プランについてのご案内です。現在はベータ版で、AI提案は月10回まで無料でご利用いただけます。",
};

const FREE_AI_LIMIT = PLAN_LIMITS.free.maxAiSuggestionsPerMonth;

const BETA_FEATURES = [
  `AI提案 月${FREE_AI_LIMIT}回まで`,
  "手動プラン作成・共有",
  "割り勘計算(傾斜配分含む)",
  "PDF/QR/ICS出力",
];

const PREMIUM_FEATURES = ["AI提案 無制限", "手動プラン作成・共有", "割り勘計算(傾斜配分含む)", "PDF/QR/ICS出力"];

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
          現在はベータ版です。AI提案は月{FREE_AI_LIMIT}回まで、その他の機能は無料でご利用いただけます。
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
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

          <div className="rounded-3xl bg-surface-tertiary shadow-warm-hover border border-gold/30 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-serif font-bold text-2xl text-ink">Premiumプラン</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gold-gradient text-white text-xs font-semibold px-3 py-1">
                <Sparkles size={12} />
                準備中
              </span>
            </div>
            <p className="text-sm text-ink-muted mb-6">価格は検討中です</p>

            <ul className="flex flex-col gap-3 mb-6">
              {PREMIUM_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm text-ink-secondary">
                  <Check size={16} className="text-gold shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <PremiumWaitlistForm />
          </div>
        </div>
      </div>
    </main>
  );
}
