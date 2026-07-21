export interface ParticipantTag {
  value: string;
  label: string;
  icon: string;
  category: "relationship" | "age" | "pace";
}

// SuggestForm's "参加者について" (required) is built from these tags plus an
// optional freeform note, instead of being pure free text — see
// composeMemberProfile below.
export const PARTICIPANT_TAGS: readonly ParticipantTag[] = [
  { value: "colleague", label: "会社の同僚", icon: "🧑‍💼", category: "relationship" },
  { value: "boss_client", label: "上司・取引先", icon: "🤝", category: "relationship" },
  { value: "friend", label: "友人", icon: "😄", category: "relationship" },
  { value: "family", label: "家族", icon: "👨‍👩‍👧", category: "relationship" },
  { value: "club", label: "サークル・学生仲間", icon: "🎓", category: "relationship" },
  { value: "first_meeting", label: "初対面が多い", icon: "🙇", category: "relationship" },
  { value: "regulars", label: "顔なじみ", icon: "🙂", category: "relationship" },

  { value: "twenties", label: "20代中心", icon: "🧑", category: "age" },
  { value: "thirties", label: "30代中心", icon: "🧑‍🦱", category: "age" },
  { value: "forties_up", label: "40代以上中心", icon: "🧔", category: "age" },
  { value: "mixed_age", label: "幅広い年齢層", icon: "👥", category: "age" },

  { value: "heavy_drinkers", label: "お酒好きが多い", icon: "🍺", category: "pace" },
  { value: "moderate", label: "ほどほど派", icon: "🍷", category: "pace" },
  { value: "light_drinkers", label: "お酒が苦手な人がいる", icon: "🧃", category: "pace" },
] as const;

export const PARTICIPANT_CATEGORIES: Record<ParticipantTag["category"], { label: string }> = {
  relationship: { label: "関係性" },
  age: { label: "年齢層" },
  pace: { label: "お酒のペース" },
};

const PARTICIPANT_LABEL_MAP = new Map(PARTICIPANT_TAGS.map((t) => [t.value, t.label]));

// Renders selected tags + an optional supplementary note into the plain-text
// memberProfile string the AI prompt expects (see lib/ai/prompts.ts). The
// note carries anything tags can't ("〇〇さんは辛いものが苦手" etc.).
export function composeMemberProfile(tags: string[], note: string): string {
  const labels = tags.map((v) => PARTICIPANT_LABEL_MAP.get(v)).filter((v): v is string => Boolean(v));
  const base = labels.join("、");
  const trimmedNote = note.trim();
  if (!base) return trimmedNote;
  return trimmedNote ? `${base}。${trimmedNote}` : base;
}
