import type { HotpepperShop } from "@/lib/api/hotpepper";
import { DRINK_BUDGET_PRESETS, findBudgetPresetDescription } from "@/lib/constants/budget";

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
}

export function buildSuggestPrompt(
  context: SuggestContext,
  candidates: HotpepperShop[]
): string {
  const presetDescription = findBudgetPresetDescription(
    DRINK_BUDGET_PRESETS,
    context.budgetPerPerson
  );

  return `あなたは経験豊富な飲み会・宴会の幹事プロフェッショナルです。
以下の情報をもとに、候補店舗の中から最適な3〜5店を厳選し、それぞれ推薦理由を提示してください。

## 開催条件
- 場所: ${context.station}周辺
- 人数: ${context.peopleCount}名
- 予算: 一人あたり${context.budgetPerPerson.toLocaleString()}円${presetDescription ? `（${presetDescription}）` : ""}
${context.datetime ? `- 日時: ${context.datetime}` : ""}

## 参加者について
${context.memberProfile}

## シチュエーション・目的
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

## 選定の注意点
- 参加者の年齢層・関係性・お酒の量に合わせる
- シチュエーションに合った雰囲気を優先
- 予算オーバーは避ける
- 人数に対して狭すぎる店は避ける
- 目立った短所がある店は正直に "warnings" で伝える
- ランクは matchScore の高い順に1から付与
`;
}
