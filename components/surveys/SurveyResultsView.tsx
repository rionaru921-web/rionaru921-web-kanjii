"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Users, Sparkles, QrCode, Download, CalendarClock, Coins } from "lucide-react";
import GoldButton from "@/components/shared/GoldButton";
import ShareQrModal from "@/components/manual-plans/ShareQrModal";
import DateRecommendation from "./aggregations/DateRecommendation";
import BudgetHistogram from "./aggregations/BudgetHistogram";
import type { AttendanceKind, OptionalQuestion, Survey } from "@/lib/surveys/types";
import type { BudgetSliderStats, DateRangeExtendedDateScore, TallyItem } from "@/lib/surveys/aggregate";

interface OptionalTally {
  question: OptionalQuestion;
  tally: TallyItem[];
  textAnswers: string[];
}

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
  attendanceDetailCounts,
  optionalTallies,
  dateRangeExtendedResults,
  budgetSliderResults,
  csv,
  maxCount,
  totalResponses,
}: {
  survey: Survey;
  shareUrl: string;
  dateTally: TallyItem[];
  budgetTally: TallyItem[];
  genreTally: TallyItem[];
  attendCounts: { yes: number; no: number; maybe: number };
  attendanceDetailCounts: Record<AttendanceKind, number>;
  optionalTallies: OptionalTally[];
  dateRangeExtendedResults: { question: OptionalQuestion; scores: DateRangeExtendedDateScore[] }[];
  budgetSliderResults: { question: OptionalQuestion; stats: BudgetSliderStats }[];
  csv: string;
  maxCount: number;
  totalResponses: number;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadCsv() {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${survey.title}_回答一覧.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={copyLink}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 py-2.5 text-xs font-medium text-gold hover:bg-gold/5 transition-colors"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "コピー済み" : "URLコピー"}
          </button>
          <button
            type="button"
            onClick={() => setQrOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 py-2.5 text-xs font-medium text-gold hover:bg-gold/5 transition-colors"
          >
            <QrCode size={15} />
            QR表示
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            disabled={totalResponses === 0}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 py-2.5 text-xs font-medium text-gold hover:bg-gold/5 transition-colors disabled:opacity-40"
          >
            <Download size={15} />
            CSV
          </button>
        </div>
      </div>

      <ShareQrModal open={qrOpen} onClose={() => setQrOpen(false)} url={shareUrl} title={survey.title} />

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
              {(attendanceDetailCounts.late > 0 || attendanceDetailCounts.leave_early > 0) && (
                <p className="text-xs text-ink-muted mt-2 border-t border-gold/10 pt-2">
                  うち遅刻するかも: {attendanceDetailCounts.late}名 / 途中で抜けるかも: {attendanceDetailCounts.leave_early}名
                </p>
              )}
            </div>
          )}

          {optionalTallies.map(({ question, tally, textAnswers }) => (
            <div key={question.id} className="rounded-3xl bg-surface-tertiary shadow-warm p-6">
              <h3 className="font-serif font-semibold text-ink mb-4">💬 {question.label}</h3>
              {question.type === "text" ? (
                textAnswers.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {textAnswers.map((answer, i) => (
                      <li key={i} className="text-sm text-ink-secondary rounded-xl bg-gold/5 px-3 py-2">
                        {answer}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-ink-muted">回答がまだありません</p>
                )
              ) : tally.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {tally.map((item) => (
                    <Bar key={item.label} item={item} maxCount={maxCount} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-ink-muted">回答がまだありません</p>
              )}
            </div>
          ))}

          {dateRangeExtendedResults.map(({ question, scores }) => (
            <div key={question.id} className="rounded-3xl bg-surface-tertiary shadow-warm p-6">
              <h3 className="flex items-center gap-1.5 font-serif font-semibold text-ink mb-4">
                <CalendarClock size={16} className="text-gold" />
                {question.label}(おすすめ日程)
              </h3>
              <DateRecommendation scores={scores} />
            </div>
          ))}

          {budgetSliderResults.map(({ question, stats }) => (
            <div key={question.id} className="rounded-3xl bg-surface-tertiary shadow-warm p-6">
              <h3 className="flex items-center gap-1.5 font-serif font-semibold text-ink mb-4">
                <Coins size={16} className="text-gold" />
                {question.label}
              </h3>
              <BudgetHistogram stats={stats} />
            </div>
          ))}

          <div className="rounded-3xl border border-gold/20 bg-gold/5 p-6 text-center">
            <p className="text-sm text-ink-secondary mb-4">
              回答が集まった日程・予算をもとに、そのままプランを作成できます
            </p>
            <GoldButton onClick={createPlanFromSurvey} icon={Sparkles} size="lg" fullWidth>
              このアンケート結果でプランを作成する
            </GoldButton>
          </div>
        </>
      )}
    </div>
  );
}
