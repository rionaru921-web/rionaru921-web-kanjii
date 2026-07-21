export interface SituationTag {
  value: string;
  label: string;
  icon: string;
  category: "occasion" | "goal";
}

// SuggestForm's "シチュエーション" (required) is built from these tags plus
// an optional freeform note, instead of being pure free text — see
// composeSituation below.
export const SITUATION_TAGS: readonly SituationTag[] = [
  { value: "welcome", label: "歓迎会", icon: "🎉", category: "occasion" },
  { value: "farewell", label: "送別会", icon: "🌸", category: "occasion" },
  { value: "year_end", label: "忘年会", icon: "🍶", category: "occasion" },
  { value: "new_year", label: "新年会", icon: "🎍", category: "occasion" },
  { value: "celebration", label: "お祝い・昇進祝い", icon: "🎊", category: "occasion" },
  { value: "business", label: "接待", icon: "💼", category: "occasion" },
  { value: "after_work", label: "打ち上げ", icon: "🙌", category: "occasion" },
  { value: "reunion", label: "同窓会・久しぶりの再会", icon: "📸", category: "occasion" },

  { value: "impress", label: "好印象を残したい", icon: "✨", category: "goal" },
  { value: "honor_guest", label: "主役を立てたい", icon: "🎁", category: "goal" },
  { value: "lively", label: "とにかく盛り上げたい", icon: "🔥", category: "goal" },
  { value: "calm", label: "しっとり落ち着いて話したい", icon: "🍵", category: "goal" },
  { value: "no_mistakes", label: "失敗できない場", icon: "⚠️", category: "goal" },
  { value: "after_party", label: "二次会があるので長時間NG", icon: "⏱️", category: "goal" },
] as const;

export const SITUATION_CATEGORIES: Record<SituationTag["category"], { label: string }> = {
  occasion: { label: "目的" },
  goal: { label: "重視したいこと" },
};

const SITUATION_LABEL_MAP = new Map(SITUATION_TAGS.map((t) => [t.value, t.label]));

// Renders selected tags + an optional supplementary note into the plain-text
// situation string the AI prompt expects (see lib/ai/prompts.ts).
export function composeSituation(tags: string[], note: string): string {
  const labels = tags.map((v) => SITUATION_LABEL_MAP.get(v)).filter((v): v is string => Boolean(v));
  const base = labels.join("、");
  const trimmedNote = note.trim();
  if (!base) return trimmedNote;
  return trimmedNote ? `${base}。${trimmedNote}` : base;
}
