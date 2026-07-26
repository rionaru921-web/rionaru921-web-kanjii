import type { AttendanceDetail, OptionalAnswers, OptionalQuestion, OptionalQuestionType } from "./types";

const MAX_LABEL_LENGTH = 100;
const MAX_OPTIONAL_QUESTIONS = 20;
const MAX_OPTIONAL_ANSWERS_JSON_LENGTH = 10_000;
const QUESTION_TYPES: OptionalQuestionType[] = ["text", "select", "multi_select", "yes_no"];
const ATTENDANCE_KINDS = ["full", "late", "leave_early", "undecided"];

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function validateOptionalQuestions(input: unknown): Result<OptionalQuestion[]> {
  if (input == null) return { ok: true, value: [] };
  if (!Array.isArray(input)) return { ok: false, error: "追加質問の形式が不正です。" };
  if (input.length > MAX_OPTIONAL_QUESTIONS) {
    return { ok: false, error: `追加質問は${MAX_OPTIONAL_QUESTIONS}個までです。` };
  }
  for (const q of input) {
    if (typeof q?.id !== "string" || !q.id) return { ok: false, error: "追加質問のIDが不正です。" };
    if (typeof q?.label !== "string" || !q.label.trim()) return { ok: false, error: "追加質問のラベルが不正です。" };
    if (q.label.length > MAX_LABEL_LENGTH) {
      return { ok: false, error: `質問文は${MAX_LABEL_LENGTH}文字以内にしてください。` };
    }
    if (!QUESTION_TYPES.includes(q.type)) return { ok: false, error: "追加質問の種類が不正です。" };
    if ((q.type === "select" || q.type === "multi_select") && !Array.isArray(q.options)) {
      return { ok: false, error: "選択式の質問には選択肢が必要です。" };
    }
  }
  return { ok: true, value: input as OptionalQuestion[] };
}

export function validateOptionalAnswers(input: unknown): Result<OptionalAnswers> {
  if (input == null) return { ok: true, value: {} };
  if (typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "回答の形式が不正です。" };
  }
  if (JSON.stringify(input).length > MAX_OPTIONAL_ANSWERS_JSON_LENGTH) {
    return { ok: false, error: "回答内容が大きすぎます。" };
  }
  return { ok: true, value: input as OptionalAnswers };
}

export function validateAttendanceDetail(input: unknown): Result<AttendanceDetail | null> {
  if (input == null) return { ok: true, value: null };
  if (typeof input !== "object") return { ok: false, error: "参加詳細の形式が不正です。" };
  const d = input as Record<string, unknown>;
  if (!ATTENDANCE_KINDS.includes(d.kind as string)) {
    return { ok: false, error: "参加詳細の種類が不正です。" };
  }
  // kindに対応しないフィールドが埋まっていたら矛盾として弾く
  // (例: kind='full' なのに arrival_time がセットされている)
  if (d.kind !== "late" && d.arrival_time) return { ok: false, error: "参加詳細の内容に矛盾があります。" };
  if (d.kind !== "leave_early" && d.leave_time) return { ok: false, error: "参加詳細の内容に矛盾があります。" };
  if (d.kind !== "undecided" && d.will_confirm_later) return { ok: false, error: "参加詳細の内容に矛盾があります。" };
  return { ok: true, value: d as unknown as AttendanceDetail };
}
