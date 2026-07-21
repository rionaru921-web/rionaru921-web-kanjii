export interface MoodTag {
  value: string;
  label: string;
  icon: string;
  category: "occasion" | "mood" | "group";
}

// AIへの補助入力。HotPepper検索条件には使わず、推薦理由の質を上げるための
// 追加コンテキストとして prompts.ts でAIに渡すのみ(memberProfile/situationの
// 自由記述を置き換えるものではない)。
export const MOOD_TAGS: readonly MoodTag[] = [
  { value: "welcome", label: "歓迎会", icon: "🎉", category: "occasion" },
  { value: "farewell", label: "送別会", icon: "🌸", category: "occasion" },
  { value: "year_end", label: "忘年会", icon: "🍶", category: "occasion" },
  { value: "new_year", label: "新年会", icon: "🎍", category: "occasion" },
  { value: "celebration", label: "お祝い", icon: "🎊", category: "occasion" },
  { value: "business", label: "接待", icon: "💼", category: "occasion" },

  { value: "casual", label: "カジュアル", icon: "👕", category: "mood" },
  { value: "formal", label: "フォーマル", icon: "👔", category: "mood" },
  { value: "quiet", label: "静か", icon: "🤫", category: "mood" },
  { value: "lively", label: "賑やか", icon: "🎊", category: "mood" },
  { value: "private", label: "個室重視", icon: "🚪", category: "mood" },

  { value: "ladies", label: "女子会", icon: "💃", category: "group" },
  { value: "family", label: "家族向け", icon: "👨‍👩‍👧", category: "group" },
  { value: "senior", label: "上司多め", icon: "🧑‍💼", category: "group" },
  { value: "young", label: "若手中心", icon: "🧑‍🎓", category: "group" },
] as const;

export const MOOD_CATEGORIES: Record<MoodTag["category"], { label: string }> = {
  occasion: { label: "目的" },
  mood: { label: "雰囲気" },
  group: { label: "参加者" },
};

const MOOD_LABEL_MAP = new Map(MOOD_TAGS.map((m) => [m.value, m.label]));

export function moodLabelsFromValues(values: string[] | undefined): string[] {
  if (!values || values.length === 0) return [];
  return values.map((v) => MOOD_LABEL_MAP.get(v)).filter((v): v is string => Boolean(v));
}
