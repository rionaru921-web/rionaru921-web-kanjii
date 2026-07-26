"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Users, Sparkles } from "lucide-react";
import GoldButton from "@/components/shared/GoldButton";
import type { Survey } from "@/lib/surveys/types";
import type { TallyItem } from "@/lib/surveys/aggregate";

function Bar({ item, maxCount }: { item: TallyItem; maxCount: number }) {
  const pct = Math.round((item.count / maxCount) * 100);
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-24 shrink-0 truncate text-ink-secondary">{item.label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-gold/10 overflow-hidden">
        <div className="h-full bg-gold-gradient rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right font-display-num text-ink">{item.count}名</span>
    </div>
  );
}

export default function SurveyResultsView({
  survey,
  shareUrl,
  dateTally,
  budgetTally,
  genreTally,
  attendCounts,
  maxCount,
  totalResponses,
}: {
  survey: Survey;
  shareUrl: string;
  dateTally: TallyItem[];
  budgetTally: TallyItem[];
  genreTally: TallyItem[];
  attendCounts: { yes: number; no: number; maybe: number };
  maxCount: number;
  totalResponses: number;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function createPlanFromSurvey() {
    router.push(`/manual-plans/new?from_survey=${survey.slug}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-6">
        <div className="flex items-center gap-2 text-sm text-ink-secondary mb-1">
          <Users size={16} className="text-gold" />
          回答数: {totalResponses}名
        </div>
        <button
          type="button"
          onClick={copyLink}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gold/20 py-2.5 text-sm font-medium text-gold hover:bg-gold/5 transition-colors"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "コピーしました" : "共有URLをコピー"}
        </button>
      </div>

      {totalResponses === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 gap-3 rounded-3xl bg-surface-tertiary shadow-warm">
          <p className="text-ink-secondary">まだ回答がありません</p>
          <p className="text-xs text-ink-muted">共有URLを参加者に送ってみましょう</p>
        </div>
      ) : (
        <>
          {dateTally.length > 0 && (
            <div className="rounded-3xl bg-surface-tertiary shadow-warm p-6">
              <h3 className="font-serif font-semibold text-ink mb-4">📅 日程集計</h3>
              <div className="flex flex-col gap-3">
                {dateTally.map((item) => (
                  <Bar key={item.label} item={item} maxCount={maxCount} />
                ))}
              </div>
            </div>
          )}

          {budgetTally.length > 0 && (
            <div className="rounded-3xl bg-surface-tertiary shadow-warm p-6">
              <h3 className="font-serif font-semibold text-ink mb-4">💰 予算集計</h3>
              <div className="flex flex-col gap-3">
                {budgetTally.map((item) => (
                  <Bar key={item.label} item={item} maxCount={maxCount} />
                ))}
              </div>
            </div>
          )}

          {genreTally.length > 0 && (
            <div className="rounded-3xl bg-surface-tertiary shadow-warm p-6">
              <h3 className="font-serif font-semibold text-ink mb-4">🍽️ ジャンル集計</h3>
              <div className="flex flex-col gap-3">
                {genreTally.map((item) => (
                  <Bar key={item.label} item={item} maxCount={maxCount} />
                ))}
              </div>
            </div>
          )}

          {survey.ask_attend && (
            <div className="rounded-3xl bg-surface-tertiary shadow-warm p-6">
              <h3 className="font-serif font-semibold text-ink mb-4">👥 参加意思</h3>
              <p className="text-sm text-ink-secondary">
                参加: <span className="font-display-num text-ink font-semibold">{attendCounts.yes}名</span> / 未定:{" "}
                <span className="font-display-num text-ink font-semibold">{attendCounts.maybe}名</span> / 不参加:{" "}
                <span className="font-display-num text-ink font-semibold">{attendCounts.no}名</span>
              </p>
            </div>
          )}

          <GoldButton onClick={createPlanFromSurvey} icon={Sparkles} size="lg" fullWidth>
            このアンケート結果でプランを作成する
          </GoldButton>
        </>
      )}
    </div>
  );
}
