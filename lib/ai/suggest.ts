import "server-only";
import { anthropic, AI_MODEL } from "./client";
import { buildSuggestPrompt, type SuggestContext } from "./prompts";
import type { HotpepperShop } from "@/lib/api/hotpepper";

export interface AIRecommendation {
  shopId: string;
  rank: number;
  matchScore: number;
  title: string;
  reason: string;
  highlights: string[];
  warnings: string;
  shop?: HotpepperShop;
}

export interface AISuggestResult {
  recommendations: AIRecommendation[];
  summary: string;
  degraded?: boolean; // true when the AI call failed and we fell back to a plain top-N list
}

interface RawAIResponse {
  recommendations: Omit<AIRecommendation, "shop">[];
  summary: string;
}

export async function suggestShops(
  context: SuggestContext,
  candidates: HotpepperShop[]
): Promise<AISuggestResult> {
  if (candidates.length === 0) {
    return { recommendations: [], summary: "候補店舗がありません" };
  }

  // Hard-filter on party size before the AI ever sees these candidates.
  // The prompt also tells Claude to avoid too-small venues, but that's a
  // soft instruction — HotPepper's own party_capacity search param isn't a
  // strict guarantee either, so this is the one place that's actually
  // enforced in code rather than left to the model.
  const eligible = candidates.filter((s) => s.partyCapacity >= context.peopleCount);
  if (eligible.length === 0) {
    return {
      recommendations: [],
      summary: `${context.peopleCount}名を収容できる候補店舗が見つかりませんでした。人数を減らすか条件を変更してお試しください。`,
    };
  }

  // Trim to keep the prompt (and cost) bounded regardless of how many shops
  // the HotPepper search returned.
  const trimmed = eligible.slice(0, 20);

  console.log(
    `[ai/suggest] calling ${AI_MODEL} with ${trimmed.length} candidates for "${context.station}"`
  );

  try {
    const prompt = buildSuggestPrompt(context, trimmed);

    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("AIからのレスポンスが不正です");
    }

    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as RawAIResponse;

    const recommendations = parsed.recommendations
      .map((rec) => ({ ...rec, shop: trimmed.find((s) => s.id === rec.shopId) }))
      // Drop anything the model hallucinated an ID for — no shop, no card.
      .filter((rec): rec is AIRecommendation & { shop: HotpepperShop } => rec.shop !== undefined)
      .sort((a, b) => a.rank - b.rank);

    return { recommendations, summary: parsed.summary };
  } catch (err) {
    console.error("[ai/suggest] AI call failed, falling back to plain list:", err);
    return buildFallbackResult(trimmed);
  }
}

// If the AI call or JSON parsing fails, still give the user something
// useful instead of a dead end: the top candidates, unranked by AI but
// still filtered by the search itself.
function buildFallbackResult(candidates: HotpepperShop[]): AISuggestResult {
  const top = candidates.slice(0, 5);
  return {
    summary:
      "AIによる分析に失敗したため、検索条件に合う店舗をそのまま表示しています。",
    degraded: true,
    recommendations: top.map((shop, i) => ({
      shopId: shop.id,
      rank: i + 1,
      matchScore: 0,
      title: shop.genre.catch || shop.genre.name,
      reason:
        "AIによる推薦理由の生成に失敗したため、検索条件に合う店舗として表示しています。",
      highlights: [
        shop.privateRoom ? "個室あり" : "",
        shop.freeDrink === "あり" ? "飲み放題あり" : "",
        shop.freeFood === "あり" ? "食べ放題あり" : "",
      ].filter(Boolean),
      warnings: "",
      shop,
    })),
  };
}
