import "server-only";
import { DATE_CHOICE_LEVELS, type DateChoiceLevel, type OptionalQuestion, type Survey, type SurveyResponse } from "./types";
import { formatDateOptionLabel } from "./format";

const SYMBOL_BY_LEVEL = new Map(DATE_CHOICE_LEVELS.map((c) => [c.value, c.symbol]));

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatOptionalAnswer(question: OptionalQuestion, value: unknown): string {
  if (value == null) return "";

  switch (question.type) {
    case "multi_select":
      return Array.isArray(value) ? value.join("、") : "";
    case "yes_no":
      return value === "yes" ? "はい" : value === "no" ? "いいえ" : "";
    case "budget_slider":
      return typeof value === "number" ? `¥${value.toLocaleString()}` : "";
    case "date_range_extended": {
      if (typeof value !== "object" || Array.isArray(value)) return "";
      const entries = Object.entries(value as Record<string, unknown>);
      return entries
        .map(([date, v]) => {
          if (typeof v === "string") {
            return `${date}:${SYMBOL_BY_LEVEL.get(v as DateChoiceLevel) ?? v}`;
          }
          if (v && typeof v === "object") {
            const obj = v as { lunch?: DateChoiceLevel; dinner?: DateChoiceLevel };
            const parts: string[] = [];
            if (obj.lunch) parts.push(`昼${SYMBOL_BY_LEVEL.get(obj.lunch) ?? obj.lunch}`);
            if (obj.dinner) parts.push(`夜${SYMBOL_BY_LEVEL.get(obj.dinner) ?? obj.dinner}`);
            return parts.length > 0 ? `${date}(${parts.join(" ")})` : "";
          }
          return "";
        })
        .filter(Boolean)
        .join("; ");
    }
    default:
      return typeof value === "string" ? value : "";
  }
}

function formatAttend(value: SurveyResponse["will_attend"]): string {
  if (value === "yes") return "参加";
  if (value === "no") return "不参加";
  if (value === "maybe") return "未定";
  return "";
}

// 幹事(オーナー)向けの生データエクスポート。日本語ヘッダー・Excel向けに
// BOM付きUTF-8で返す(Wave 25: 集計画面の「CSVダウンロード」から使用)。
export function buildSurveyResponsesCsv(survey: Survey, responses: SurveyResponse[]): string {
  const headers = [
    "お名前",
    "メールアドレス",
    "選択日程",
    "予算",
    "ジャンル",
    "参加意思",
    ...survey.optional_questions.map((q) => q.label),
    "コメント",
    "回答日時",
  ];

  const rows = responses.map((r) => {
    const dateLabels = r.selected_dates
      .map((d) => {
        const opt = survey.date_options.find((o) => o.date === d);
        return opt ? formatDateOptionLabel(opt) : d;
      })
      .join("、");

    const optionalCells = survey.optional_questions.map((q) => formatOptionalAnswer(q, r.optional_answers[q.id]));

    return [
      r.respondent_name,
      r.respondent_email ?? "",
      dateLabels,
      r.selected_budget ?? "",
      r.selected_genre ?? "",
      formatAttend(r.will_attend),
      ...optionalCells,
      r.free_comment ?? "",
      new Date(r.created_at).toLocaleString("ja-JP"),
    ];
  });

  const lines = [headers, ...rows].map((cols) => cols.map((c) => csvEscape(String(c))).join(","));
  return "﻿" + lines.join("\r\n");
}
