// 幹事ラボ AI幹事コーチ
//
// 固定質問セット（MVP版）
// 将来的に動的生成に移行する余地を残す設計

export type CoachQuestion = {
  step: number;
  key: string;
  question: string;
  type: "choice" | "scale" | "text";
  choices?: string[];
  scaleMin?: number;
  scaleMax?: number;
  optional?: boolean;
};

export const COACH_QUESTIONS: CoachQuestion[] = [
  {
    step: 1,
    key: "attendance_rate",
    question: "当日の参加率はどうでしたか？",
    type: "choice",
    choices: ["100%（全員参加）", "80〜99%", "60〜79%", "60%未満", "その他"],
  },
  {
    step: 2,
    key: "excitement",
    question: "全体の盛り上がりを5段階で評価してください",
    type: "scale",
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    step: 3,
    key: "best_point",
    question: "一番良かった点を教えてください",
    type: "text",
  },
  {
    step: 4,
    key: "improvement",
    question: "次回改善したい点はありますか？",
    type: "text",
    optional: true,
  },
  {
    step: 5,
    key: "repeat_intent",
    question: "次回もこのメンバーで開催したいですか？",
    type: "choice",
    choices: ["ぜひ！", "たぶん", "別のメンバーで", "まだ分からない"],
  },
];

export const TOTAL_STEPS = COACH_QUESTIONS.length;

export function getQuestion(step: number): CoachQuestion | null {
  return COACH_QUESTIONS.find((q) => q.step === step) ?? null;
}
