import { Users } from "lucide-react";
import { formatDateOptionLabel } from "@/lib/surveys/format";
import { DATE_CHOICE_LEVELS } from "@/lib/surveys/types";
import type {
  AttendanceKind,
  DateRangeExtendedAnswer,
  OptionalAnswers,
  OptionalQuestion,
  PublicSurvey,
  SurveyResponse,
} from "@/lib/surveys/types";

const ATTEND_KIND_LABELS: Record<AttendanceKind, string> = {
  full: "参加",
  late: "遅刻するかも",
  leave_early: "途中で抜けるかも",
  undecided: "未定",
};

function formatAttendance(response: SurveyResponse): string | null {
  if (!response.will_attend) return null;
  if (response.will_attend === "no") return "不参加";
  const kind = response.attendance_detail?.kind;
  return kind ? ATTEND_KIND_LABELS[kind] : response.will_attend === "yes" ? "参加" : "未定";
}

function symbolFor(level: string | undefined): string {
  return DATE_CHOICE_LEVELS.find((l) => l.value === level)?.symbol ?? "-";
}

function formatOptionalAnswer(question: OptionalQuestion, value: OptionalAnswers[string]): string | null {
  if (value == null) return null;
  switch (question.type) {
    case "text":
      return typeof value === "string" && value.trim() ? value : null;
    case "multi_select":
      return Array.isArray(value) && value.length > 0 ? value.join("、") : null;
    case "yes_no":
      return value === "yes" ? "はい" : value === "no" ? "いいえ" : null;
    case "budget_slider":
      return typeof value === "number" ? `¥${value.toLocaleString()}` : null;
    case "date_range_extended": {
      if (typeof value !== "object" || Array.isArray(value)) return null;
      const parts = Object.entries(value as DateRangeExtendedAnswer).map(([date, v]) => {
        const d = new Date(`${date}T00:00:00`);
        const dateLabel = `${d.getMonth() + 1}/${d.getDate()}`;
        if (typeof v === "string") return `${dateLabel}${symbolFor(v)}`;
        return `${dateLabel}(昼${symbolFor(v.lunch)}/夜${symbolFor(v.dinner)})`;
      });
      return parts.length > 0 ? parts.join("、") : null;
    }
    default: // 'select'
      return typeof value === "string" && value ? value : null;
  }
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function AnswerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <span className="text-ink-muted shrink-0">{label}:</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

// 幹事の集計画面(mode="owner")にのみ組み込む、回答者ごとの個別回答一覧。
// Wave 26 の公開集計ページ(/s/[slug]/results, mode="public")には
// responses prop 自体を渡していないため、このコンポーネントが呼ばれる
// ことも respondent_name が漏れることも構造上ない。
export default function HostResponseList({
  survey,
  responses,
}: {
  survey: PublicSurvey;
  responses: SurveyResponse[];
}) {
  if (responses.length === 0) return null;

  const dateOptionByValue = new Map(survey.date_options.map((d) => [d.date, d]));

  return (
    <div className="rounded-3xl bg-surface-tertiary shadow-warm p-6">
      <h3 className="flex items-center gap-1.5 font-serif font-semibold text-ink mb-4">
        <Users size={16} className="text-gold" />
        回答者一覧(幹事のみ表示)
      </h3>
      <div className="flex flex-col gap-3">
        {responses.map((r) => {
          const attendance = formatAttendance(r);
          const dateLabels = r.selected_dates.map((d) => {
            const opt = dateOptionByValue.get(d);
            return opt ? formatDateOptionLabel(opt) : d;
          });

          return (
            <div key={r.id} className="rounded-2xl border border-gold/15 bg-surface-primary p-4">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="font-serif font-semibold text-ink">{r.respondent_name}</span>
                <span className="text-xs text-ink-muted shrink-0">{formatDateTime(r.created_at)}</span>
              </div>
              <div className="flex flex-col gap-1.5 text-sm">
                {dateLabels.length > 0 && <AnswerRow label="日程" value={dateLabels.join("、")} />}
                {r.selected_budget && <AnswerRow label="予算" value={r.selected_budget} />}
                {r.selected_genre && <AnswerRow label="ジャンル" value={r.selected_genre} />}
                {attendance && <AnswerRow label="参加意思" value={attendance} />}
                {survey.optional_questions.map((q) => {
                  const formatted = formatOptionalAnswer(q, r.optional_answers[q.id]);
                  return formatted ? <AnswerRow key={q.id} label={q.label} value={formatted} /> : null;
                })}
                {r.free_comment && <AnswerRow label="コメント" value={r.free_comment} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
