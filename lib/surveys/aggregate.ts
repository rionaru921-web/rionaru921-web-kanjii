import type {
  AttendanceKind,
  DateChoiceLevel,
  DateOption,
  DateRangeExtendedAnswer,
  OptionalQuestion,
  SurveyResponse,
} from "./types";
import { formatDateOptionLabel } from "./format";

export interface TallyItem {
  label: string;
  count: number;
}

function tally(values: (string | null | undefined)[]): TallyItem[] {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function aggregateResponses(responses: SurveyResponse[], dateOptions: DateOption[]) {
  const dateLabelByValue = new Map(dateOptions.map((d) => [d.date, d]));

  const dateCounts = new Map<string, number>();
  for (const r of responses) {
    for (const d of r.selected_dates) {
      dateCounts.set(d, (dateCounts.get(d) ?? 0) + 1);
    }
  }
  const dateTally: TallyItem[] = Array.from(dateCounts.entries())
    .map(([date, count]) => {
      const opt = dateLabelByValue.get(date) ?? { date };
      return { label: formatDateOptionLabel(opt), count };
    })
    .sort((a, b) => b.count - a.count);

  const budgetTally = tally(responses.map((r) => r.selected_budget));
  const genreTally = tally(responses.map((r) => r.selected_genre));

  const attendCounts = { yes: 0, no: 0, maybe: 0 };
  for (const r of responses) {
    if (r.will_attend) attendCounts[r.will_attend]++;
  }

  const maxCount = Math.max(1, ...dateTally.map((d) => d.count), ...budgetTally.map((d) => d.count), ...genreTally.map((d) => d.count));

  return { dateTally, budgetTally, genreTally, attendCounts, maxCount, totalResponses: responses.length };
}

// Wave 11-A2: additive aggregation for the organizer-defined optional
// questions. Doesn't touch aggregateResponses above, so existing surveys
// with no optional_questions keep working exactly as before.
export function aggregateOptionalQuestion(
  question: OptionalQuestion,
  responses: SurveyResponse[]
): { tally: TallyItem[]; textAnswers: string[] } {
  if (question.type === "text") {
    const textAnswers = responses
      .map((r) => r.optional_answers[question.id])
      .filter((v): v is string => typeof v === "string" && v.trim().length > 0);
    return { tally: [], textAnswers };
  }

  const values: string[] = [];
  for (const r of responses) {
    const v = r.optional_answers[question.id];
    if (Array.isArray(v)) values.push(...v);
    else if (typeof v === "string") values.push(v);
  }
  return { tally: tally(values), textAnswers: [] };
}

export function aggregateAttendanceDetail(responses: SurveyResponse[]): Record<AttendanceKind, number> {
  const counts: Record<AttendanceKind, number> = { full: 0, late: 0, leave_early: 0, undecided: 0 };
  for (const r of responses) {
    const kind = r.attendance_detail?.kind;
    if (kind) counts[kind]++;
  }
  return counts;
}

// Wave 25: aggregation for the 'date_range_extended' optional question type
// (4-level ◎◯△× per date, optionally split into lunch/dinner). Additive —
// doesn't touch aggregateResponses, so the fixed ask_dates/date_options flow
// (and every existing Wave 21 survey) keeps working unchanged.
const DATE_CHOICE_SCORE: Record<DateChoiceLevel, number> = { certain: 3, probably: 2, maybe: 1, no: 0 };

export interface DateRangeExtendedBreakdown {
  certain: number;
  probably: number;
  maybe: number;
  no: number;
}

export interface DateRangeExtendedDateScore {
  date: string;
  slot: "lunch" | "dinner" | null; // null when the question doesn't use time slots
  score: number;
  attendable: number; // certain + probably
  total: number;
  breakdown: DateRangeExtendedBreakdown;
}

export function aggregateDateRangeExtended(
  question: OptionalQuestion,
  responses: SurveyResponse[]
): DateRangeExtendedDateScore[] {
  const dates = question.dateCandidates ?? [];
  const slots: Array<"lunch" | "dinner" | null> = question.useTimeSlots ? ["lunch", "dinner"] : [null];

  const results: DateRangeExtendedDateScore[] = [];
  for (const date of dates) {
    for (const slot of slots) {
      const breakdown: DateRangeExtendedBreakdown = { certain: 0, probably: 0, maybe: 0, no: 0 };
      for (const r of responses) {
        const answer = r.optional_answers[question.id];
        if (!answer || typeof answer !== "object" || Array.isArray(answer)) continue;
        const dateValue = (answer as DateRangeExtendedAnswer)[date];
        if (dateValue == null) continue;
        const level: DateChoiceLevel | undefined =
          typeof dateValue === "string" ? (slot ? undefined : dateValue) : slot ? dateValue[slot] : undefined;
        if (level) breakdown[level]++;
      }
      const total = breakdown.certain + breakdown.probably + breakdown.maybe + breakdown.no;
      results.push({
        date,
        slot,
        score: breakdown.certain * DATE_CHOICE_SCORE.certain + breakdown.probably * DATE_CHOICE_SCORE.probably + breakdown.maybe * DATE_CHOICE_SCORE.maybe,
        attendable: breakdown.certain + breakdown.probably,
        total,
        breakdown,
      });
    }
  }
  return results.sort((a, b) => b.score - a.score);
}

// Wave 25: aggregation for the 'budget_slider' optional question type.
// Buckets are sized to the question's own step, widened (capped at ~12 bars)
// so a small step on a wide min/max range doesn't produce an unreadable chart.
export interface BudgetBucket {
  start: number;
  label: string;
  count: number;
}

export interface BudgetSliderStats {
  count: number;
  mean: number;
  median: number;
  mode: number;
  buckets: BudgetBucket[];
}

export function aggregateBudgetSlider(question: OptionalQuestion, responses: SurveyResponse[]): BudgetSliderStats {
  const values: number[] = [];
  for (const r of responses) {
    const v = r.optional_answers[question.id];
    if (typeof v === "number" && Number.isFinite(v)) values.push(v);
  }

  if (values.length === 0) {
    return { count: 0, mean: 0, median: 0, mode: 0, buckets: [] };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mean = Math.round(sorted.reduce((sum, v) => sum + v, 0) / sorted.length);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];

  const min = question.sliderMin ?? sorted[0];
  const max = question.sliderMax ?? sorted[sorted.length - 1];
  const step = question.sliderStep ?? 500;
  const rawBucketCount = Math.max(1, Math.round((max - min) / step) || 1);
  const bucketWidth = rawBucketCount > 12 ? Math.ceil(rawBucketCount / 12) * step : step;

  const counts = new Map<number, number>();
  for (const v of values) {
    const start = min + Math.floor((v - min) / bucketWidth) * bucketWidth;
    counts.set(start, (counts.get(start) ?? 0) + 1);
  }

  const buckets: BudgetBucket[] = Array.from(counts.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([start, count]) => ({ start, count, label: `¥${start.toLocaleString()}〜` }));

  const modeBucket = buckets.reduce((best, b) => (b.count > best.count ? b : best), buckets[0]);
  const mode = modeBucket.start + Math.floor(bucketWidth / 2 / step) * step;

  return { count: values.length, mean, median, mode, buckets };
}
