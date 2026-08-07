import { Calendar, Coins, Utensils, Users2, type LucideIcon } from "lucide-react";
import { formatDateOptionLabel } from "@/lib/surveys/format";
import type { DateOption, OptionalQuestion } from "@/lib/surveys/types";

function PreviewChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gold/15 px-3 py-1.5 text-xs text-ink-secondary">
      {children}
    </span>
  );
}

function PreviewSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-secondary mb-2">
        <Icon size={13} className="text-gold" />
        {title}
      </div>
      {children}
    </div>
  );
}

// 作成画面の入力状態をそのまま読み取り専用で見せる、回答画面のミニチュア版。
// SurveyResponseForm.tsx とは独立した簡略表示(実データではなく作成途中の
// state を渡すだけなので、送信ロジックは一切持たない)。
export default function SurveyPreview({
  title,
  description,
  askDates,
  askBudget,
  askGenre,
  askAttend,
  dateOptions,
  budgetMin,
  budgetMax,
  budgetStep,
  genreOptions,
  optionalQuestions,
}: {
  title: string;
  description: string;
  askDates: boolean;
  askBudget: boolean;
  askGenre: boolean;
  askAttend: boolean;
  dateOptions: DateOption[];
  budgetMin: number;
  budgetMax: number;
  budgetStep: number;
  genreOptions: string[];
  optionalQuestions: OptionalQuestion[];
}) {
  return (
    <div className="rounded-3xl bg-surface-tertiary shadow-warm p-6 flex flex-col gap-5">
      <div>
        <p className="font-serif font-bold text-lg text-ink break-words">{title || "(タイトル未入力)"}</p>
        {description && <p className="text-xs text-ink-secondary mt-1 whitespace-pre-wrap">{description}</p>}
      </div>

      {askDates && (
        <PreviewSection icon={Calendar} title="日程どれが都合いい?">
          {dateOptions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {dateOptions.map((opt, i) => (
                <PreviewChip key={i}>{formatDateOptionLabel(opt)}</PreviewChip>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-muted">候補日を追加すると表示されます</p>
          )}
        </PreviewSection>
      )}

      {askBudget && (
        <PreviewSection icon={Coins} title="予算どれくらい?">
          {budgetMin < budgetMax ? (
            <p className="text-xs text-ink-secondary">
              ¥{budgetMin.toLocaleString()} 〜 ¥{budgetMax.toLocaleString()}(スライダー・{budgetStep.toLocaleString()}円刻み)
            </p>
          ) : (
            <p className="text-xs text-ink-muted">最大値を最小値より大きくすると表示されます</p>
          )}
        </PreviewSection>
      )}

      {askGenre && (
        <PreviewSection icon={Utensils} title="ジャンル希望は?">
          {genreOptions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {genreOptions.map((g) => (
                <PreviewChip key={g}>{g}</PreviewChip>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-muted">ジャンル候補を追加すると表示されます</p>
          )}
        </PreviewSection>
      )}

      {askAttend && (
        <PreviewSection icon={Users2} title="参加できる?">
          <div className="flex flex-wrap gap-1.5">
            {["参加", "遅刻するかも", "途中で抜けるかも", "不参加", "未定"].map((label) => (
              <PreviewChip key={label}>{label}</PreviewChip>
            ))}
          </div>
        </PreviewSection>
      )}

      {optionalQuestions.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-gold/10 pt-4">
          {optionalQuestions.map((q) => (
            <div key={q.id}>
              <p className="text-xs font-semibold text-ink-secondary mb-1.5">{q.label}</p>

              {q.type === "date_range_extended" && (
                <p className="text-xs text-ink-muted">
                  {(q.dateCandidates ?? []).length}日程 ・ {q.useTimeSlots ? "昼夜別" : "1日1回答"} ・ ◎◯△×の4段階
                </p>
              )}

              {q.type === "budget_slider" && (
                <p className="text-xs text-ink-muted">
                  ¥{(q.sliderMin ?? 0).toLocaleString()} 〜 ¥{(q.sliderMax ?? 0).toLocaleString()}(スライダー)
                </p>
              )}

              {(q.type === "select" || q.type === "multi_select") && (
                <div className="flex flex-wrap gap-1.5">
                  {(q.options ?? []).map((o) => (
                    <PreviewChip key={o}>{o}</PreviewChip>
                  ))}
                </div>
              )}

              {q.type === "yes_no" && (
                <div className="flex gap-1.5">
                  <PreviewChip>はい</PreviewChip>
                  <PreviewChip>いいえ</PreviewChip>
                </div>
              )}

              {q.type === "text" && <p className="text-xs text-ink-muted">(自由記述欄)</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
