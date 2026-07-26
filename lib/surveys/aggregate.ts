import type { AttendanceKind, DateOption, OptionalQuestion, SurveyResponse } from "./types";
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
