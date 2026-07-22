import type { HotpepperShop } from "@/lib/api/hotpepper";
import { DRINK_BUDGET_PRESETS, findBudgetPresetDescription } from "@/lib/constants/budget";
import { moodLabelsFromValues } from "@/lib/constants/moods";

export interface SuggestContext {
  // Basic search conditions
  station: string;
  budgetPerPerson: number;
  peopleCount: number;
  datetime?: string;

  // AI-specific context
  memberProfile: string; // e.g. "20代大学生、初対面、お酒はほどほどが好き"
  situation: string; // e.g. "サークルの新歓、盛り上げたい、失敗したくない"
  preferences?: string; // e.g. "個室希望、静かすぎない、コスパ重視"
  moodTags?: string[]; // e.g. ["welcome", "lively"] — see lib/constants/moods.ts
}

// Role definition + reasoning process live in the system prompt (sent via
// the Anthropic SDK's `system` param — see lib/ai/suggest.ts), separate
// from the per-request user prompt below. Previously everything was crammed
// into a single user-role message with no system prompt at all.
//
// Field names in the JSON schema described here (shopId/rank/matchScore/
// title/warnings/summary) MUST stay in sync with AIRecommendation
// (lib/ai/suggest.ts) and the card UI (components/ai/AIRecommendation.tsx),
// which render those fields directly (rank badge, match-score bar, etc).
export const SUGGEST_SYSTEM_PROMPT = `あなたは日本の飲み会・宴会に精通したプロの幹事アシスタントです。

# あなたの役割
ユーザーの要望と、HotPepper APIから取得した実在するお店のリストをもとに、最適な店を選び、それぞれに推薦理由を添えて提案します。

# 提案の進め方（必ずこの順で考える）

## Step 1: 候補を全て見渡す
渡された候補リストの全店にまず目を通します。候補が少ない、予算にぴったり合う店がない、といった場合でも「該当なし」「候補が見つかりません」とは絶対に返しません。リストが1件でもあれば、必ずその中から選びます。

## Step 2: 優先順位で絞り込む
以下の優先順位で判断してください。
1. 参加人数を収容できるか（候補は事前にこの条件でフィルタ済みです）
2. 予算に近いか（多少の超過があっても、他の条件が良ければ選択肢に残す）
3. エリア・アクセスが条件に合うか
4. 参加者タグ・シチュエーションタグと、お店のジャンル・雰囲気の相性

## Step 3: バランスを考える
複数店を選ぶ場合は、可能な範囲でジャンルや雰囲気に多様性を持たせ、似た系統の店ばかりに偏らないようにします。

# 絶対ルール
- リストにない架空の店舗を作り出さない
- shopId は候補リストのIDを1文字も変えずに正確にコピーする
- 「該当なし」「候補が見つかりません」とは返さない。候補が少なくても、リストにある店の中から必ず選ぶ
- 目立った短所（駅から遠い、個室なし、予算やや超過等）があれば隠さず warnings に書く。なければ空文字にする
- 出力は指定のJSON形式のみ。前置き・後書き・コードブロック外のテキストは一切含めない`;

export function buildSuggestPrompt(
  context: SuggestContext,
  candidates: HotpepperShop[]
): string {
  const presetDescription = findBudgetPresetDescription(
    DRINK_BUDGET_PRESETS,
    context.budgetPerPerson
  );
  const moodLabels = moodLabelsFromValues(context.moodTags);

  return `# ユーザーの要望

## 開催条件
- 場所: ${context.station}周辺
- 人数: ${context.peopleCount}名
- 予算: 一人あたり${context.budgetPerPerson.toLocaleString()}円${presetDescription ? `（${presetDescription}）` : ""}
${context.datetime ? `- 日時: ${context.datetime}` : ""}
${moodLabels.length > 0 ? `- 雰囲気・シーン: ${moodLabels.join("、")}` : ""}

## 参加者について（タグ＋補足）
${context.memberProfile}

## シチュエーション・目的（タグ＋補足）
${context.situation}

${context.preferences ? `## 追加の希望\n${context.preferences}` : ""}

## 候補店舗（${candidates.length}件）
${candidates
  .map(
    (shop, i) => `
### 候補${i + 1}: ${shop.name}
- ジャンル: ${shop.genre.name}（${shop.genre.catch}）
- 予算目安: ${shop.budget.name}（平均${shop.budget.average}）
- アクセス: ${shop.access}
- 収容人数: ${shop.capacity}名（宴会${shop.partyCapacity}名まで）
- 個室: ${shop.privateRoom ? "あり" : "なし"}
- 特徴: ${[
      shop.freeDrink === "あり" ? "飲み放題あり" : "",
      shop.freeFood === "あり" ? "食べ放題あり" : "",
      shop.course === "あり" ? "コースあり" : "",
      shop.wifi === "あり" ? "WiFi完備" : "",
      shop.card === "利用可" ? "カード可" : "",
    ]
      .filter(Boolean)
      .join("、")}
- 営業時間: ${shop.open}
- ID: ${shop.id}
`
  )
  .join("\n")}

## 選定の注意点
- 「参加者について」「シチュエーション」は短いタグの箇条書き（＋任意の補足）です。テンプレート的な言い回しにせず、そのタグから具体的に読み取れる文脈（関係性・年齢層・お酒のペース・目的・重視点）を推薦理由に反映する
- ランクは matchScore の高い順に1から付与
- ${candidates.length < 3 ? `候補が${candidates.length}件しかないため、リストにある全店を返す` : "3〜5店を選ぶ"}

## 出力形式
以下の厳密なJSON形式で返してください。他の文章は一切含めないこと。

{
  "recommendations": [
    {
      "shopId": "候補IDそのまま",
      "rank": 1,
      "matchScore": 95,
      "title": "この店を選ぶ理由の短いキャッチコピー（20文字以内）",
      "reason": "詳しい推薦理由を150〜200文字で。参加者の特徴やシチュエーションと結びつけて具体的に。",
      "highlights": ["特徴1", "特徴2", "特徴3"],
      "warnings": "もしあれば注意点を60文字以内で。なければ空文字"
    }
  ],
  "summary": "全体の選定方針を100文字以内で説明"
}

## 参考例: 候補が少なく、予算をやや超える店も含めて返す場合
{
  "recommendations": [
    {
      "shopId": "J002345678",
      "rank": 1,
      "matchScore": 78,
      "title": "候補は少ないが雰囲気重視で厳選",
      "reason": "このエリアは候補が限られていますが、予算をやや超える程度でシチュエーションに合う落ち着いた個室があります。参加者のタグに沿って選びました。",
      "highlights": ["雰囲気重視", "駅チカ"],
      "warnings": "予算をやや超過します"
    }
  ],
  "summary": "エリアの候補が少ないため、予算を若干上回る店も含めています。エリアを広げると選択肢が増えます。"
}
`;
}
