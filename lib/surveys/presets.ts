import type { OptionalQuestion, SurveyEventType } from "./types";

export interface EventPreset {
  budgetOptions: string[];
  genreOptions: string[];
  timeSlotOptions?: string[];
  areaOptions?: string[];
}

export const EVENT_PRESETS: Record<SurveyEventType, EventPreset> = {
  nomikai: {
    budgetOptions: [
      "3,000円以下(サクッと)",
      "3,000〜5,000円(普通)",
      "5,000〜8,000円(少し豪華)",
      "8,000円以上(がっつり)",
      "気にしない",
    ],
    genreOptions: ["居酒屋", "焼肉", "寿司", "イタリアン", "中華", "和食", "カフェ・バー", "こだわらない"],
    timeSlotOptions: ["平日夜(18:00〜)", "平日夜遅め(19:00〜)", "週末昼", "週末夜", "深夜"],
  },
  kangeikai: {
    budgetOptions: ["会費 3,000円", "会費 4,000円", "会費 5,000円", "会社負担(幹事に確認)"],
    genreOptions: [
      "上品な居酒屋",
      "個室のあるお店",
      "カラオケ付き",
      "上司が好むお店",
      "新人が緊張しないカジュアル",
      "おまかせ",
    ],
    timeSlotOptions: ["平日夜(18:30〜)", "週末夜"],
  },
  sobetsukai: {
    budgetOptions: ["会費 3,000円", "会費 4,000円", "会費 5,000円", "個人負担"],
    genreOptions: [
      "個室のあるお店",
      "思い出のお店で",
      "主賓の希望を聞く",
      "サプライズを準備しやすいお店",
      "おまかせ",
    ],
  },
  travel: {
    budgetOptions: ["日帰り 5,000円", "日帰り 10,000円", "1泊 15,000円", "1泊 20,000円", "1泊 30,000円以上"],
    genreOptions: ["観光重視", "グルメ重視", "アクティビティ重視", "のんびり温泉", "ショッピング", "テーマパーク"],
    areaOptions: [
      "近場・日帰り",
      "温泉(1〜2時間圏内)",
      "温泉(少し遠出)",
      "テーマパーク",
      "海・リゾート",
      "都市部(食事重視)",
      "海外",
    ],
  },
  birthday: {
    budgetOptions: ["3,000円以下", "3,000〜5,000円", "5,000〜8,000円", "8,000円以上"],
    genreOptions: [
      "主役の好みで",
      "サプライズ対応可",
      "ケーキ持ち込みOK",
      "個室あり",
      "おしゃれなお店",
      "カラオケ・アクティビティ付き",
    ],
  },
  other: {
    budgetOptions: ["3,000円以下", "3,000〜5,000円", "5,000〜8,000円", "8,000円以上", "気にしない"],
    genreOptions: ["こだわらない"],
  },
};

export const PRESET_LABELS: Record<SurveyEventType, string> = {
  nomikai: "飲み会テンプレを使う",
  kangeikai: "歓迎会テンプレを使う",
  sobetsukai: "送別会テンプレを使う",
  travel: "旅行テンプレを使う",
  birthday: "誕生日会テンプレを使う",
  other: "カスタムで作る",
};

export interface OptionalQuestionPreset extends Omit<OptionalQuestion, "id"> {
  id: string;
  suggestedFor?: SurveyEventType[];
}

export const OPTIONAL_QUESTION_PRESETS: OptionalQuestionPreset[] = [
  {
    id: "allergy",
    label: "食べ物のアレルギーはありますか?",
    description: "事前にお店選びに反映できます",
    type: "text",
    suggestedFor: ["nomikai", "kangeikai", "sobetsukai", "birthday", "travel"],
  },
  {
    id: "special_request",
    label: "特別な要望はありますか?",
    description: "サプライズや出し物など",
    type: "text",
    suggestedFor: ["kangeikai", "sobetsukai", "birthday"],
  },
  {
    id: "car_available",
    label: "送迎の車を出せますか?",
    type: "yes_no",
    suggestedFor: ["travel", "nomikai"],
  },
  {
    id: "pet",
    label: "ペット同伴を希望しますか?",
    type: "yes_no",
    suggestedFor: ["travel"],
  },
  {
    id: "gift_budget",
    label: "お土産・プレゼント予算の希望は?",
    type: "select",
    options: ["1,000円", "2,000円", "3,000円", "5,000円", "希望なし"],
    suggestedFor: ["sobetsukai", "birthday"],
  },
  {
    id: "dress_code",
    label: "ドレスコードの希望は?",
    type: "select",
    options: ["カジュアル", "スマートカジュアル", "フォーマル", "指定なし"],
    suggestedFor: ["kangeikai", "sobetsukai"],
  },
  {
    id: "nijikai",
    label: "二次会も参加したいですか?",
    type: "yes_no",
    suggestedFor: ["nomikai", "kangeikai", "sobetsukai"],
  },
  {
    id: "end_time",
    label: "帰宅時間の目安は?",
    type: "select",
    options: ["21時まで", "22時まで", "23時まで", "24時まで", "終電まで"],
    suggestedFor: ["nomikai", "kangeikai", "sobetsukai"],
  },
  {
    id: "seat_pref",
    label: "席順の希望はありますか?",
    type: "text",
    suggestedFor: ["kangeikai", "sobetsukai"],
  },
  {
    id: "payment_timing",
    label: "費用の支払いタイミング希望は?",
    type: "select",
    options: ["当日現金", "事前振込", "幹事にお任せ"],
    suggestedFor: ["nomikai", "travel"],
  },
  // Wave 21: 追加質問プリセット3件。既存の optional_questions/optional_answers
  // (jsonb) と type: 'select' | 'multi_select' の仕組みだけで表現でき、
  // 回答UI(SurveyResponseForm.tsx)・集計(lib/surveys/aggregate.ts)・
  // 結果表示(SurveyResultsView.tsx)はどれも型ベースで汎用実装済みのため
  // このファイル以外は無変更。
  {
    id: "genre_multi",
    label: "食べたいジャンルは?(複数選択可)",
    description: "単一選択の「ジャンル候補」とは別に、複数のジャンルを希望として聞けます",
    type: "multi_select",
    options: ["居酒屋", "焼肉", "カフェ", "和食", "洋食", "中華", "韓国料理", "寿司", "ラーメン", "その他"],
    suggestedFor: ["nomikai", "kangeikai", "sobetsukai", "birthday", "travel"],
  },
  {
    id: "allergy_checklist",
    label: "アレルギー・苦手な食べ物はありますか?(該当するものを選択)",
    description: "自由記述の「食べ物のアレルギー」と併用できます",
    type: "multi_select",
    options: ["エビ", "カニ", "乳製品", "卵", "そば", "ピーナッツ", "なし"],
    suggestedFor: ["nomikai", "kangeikai", "sobetsukai", "birthday", "travel"],
  },
  {
    id: "time_preference",
    label: "開始時間の希望は?",
    type: "select",
    options: ["ランチ(11:00-14:00)", "夜(17:00-19:00)", "夜(19:00-21:00)", "遅め(21:00-)"],
    suggestedFor: ["nomikai", "kangeikai", "sobetsukai", "birthday"],
  },
];

// イベント種類ごとに、その場で推奨する追加質問プリセットを返す。
// suggestedForが未指定のプリセットは全イベント共通のおすすめ扱い。
export function getSuggestedOptionalQuestions(eventType: SurveyEventType): OptionalQuestionPreset[] {
  return OPTIONAL_QUESTION_PRESETS.filter((q) => !q.suggestedFor || q.suggestedFor.includes(eventType));
}
