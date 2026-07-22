import "server-only";
import { anthropic, AI_MODEL } from "./client";
import { buildSuggestPrompt, SUGGEST_SYSTEM_PROMPT, type SuggestContext } from "./prompts";
import { parseAiResponse } from "./parseResponse";
import { parseYenAmount } from "@/lib/api/restaurant-utils";
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

export async function suggestShops(
  context: SuggestContext,
  candidates: HotpepperShop[]
): Promise<AISuggestResult> {
  console.log(
    `[ai/suggest] "${context.station}" people=${context.peopleCount} budget=${context.budgetPerPerson} candidates=${candidates.length}`
  );

  if (candidates.length === 0) {
    return { recommendations: [], summary: "候補店舗がありません" };
  }

  // Hard-filter on party size before the AI ever sees these candidates.
  // The search request already sent party_capacity=peopleCount to HotPepper
  // (see buildHotpepperSearchParams), so every candidate here already
  // cleared that bar server-side. What we exclude here is only shops that
  // *report* a capacity smaller than the party — partyCapacity resolves to
  // 0 (see mapShop in hotpepper.ts) when HotPepper simply didn't return
  // capacity data for that shop, which is common and not a signal the shop
  // is too small. Treating 0 as "too small" was wiping out most/all
  // candidates for larger groups, so only a known-too-small capacity is
  // excluded here.
  const eligible = candidates.filter(
    (s) => s.partyCapacity === 0 || s.partyCapacity >= context.peopleCount
  );
  if (eligible.length === 0) {
    console.log(`[ai/suggest] all ${candidates.length} candidates too small for ${context.peopleCount} people`);
    return {
      recommendations: [],
      summary: `${context.peopleCount}名を収容できる候補店舗が見つかりませんでした。人数を減らすか条件を変更してお試しください。`,
    };
  }

  // Trim to keep the prompt (and cost) bounded regardless of how many shops
  // the HotPepper search returned.
  const trimmed = eligible.slice(0, 30);

  try {
    const userPrompt = buildSuggestPrompt(context, trimmed);
    console.log(`[ai/suggest] calling ${AI_MODEL} with ${trimmed.length} candidates`);
    console.log(`[ai/suggest] user prompt (first 500 chars): ${userPrompt.slice(0, 500)}...`);

    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2048,
      system: SUGGEST_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("AIからのレスポンスが不正です");
    }
    console.log(`[ai/suggest] raw response (first 500 chars): ${textBlock.text.slice(0, 500)}...`);

    const parsed = parseAiResponse(textBlock.text);
    if (!parsed) {
      throw new Error("AIレスポンスのJSONパースに失敗しました");
    }

    const recommendations = parsed.recommendations
      .map((rec) => ({ ...rec, shop: trimmed.find((s) => s.id === rec.shopId) }))
      // Drop anything the model hallucinated an ID for — no shop, no card.
      .filter((rec): rec is AIRecommendation & { shop: HotpepperShop } => rec.shop !== undefined)
      .sort((a, b) => a.rank - b.rank);

    console.log(`[ai/suggest] source=ai count=${recommendations.length}`);
    return { recommendations, summary: parsed.summary };
  } catch (err) {
    console.error("[ai/suggest] AI call failed, falling back to plain list:", err);
    const fallback = buildFallbackResult(trimmed, context.budgetPerPerson);
    console.log(`[ai/suggest] source=fallback count=${fallback.recommendations.length}`);
    return fallback;
  }
}

// If the AI call or JSON parsing fails, still give the user something
// useful instead of a dead end: the candidates closest to their budget,
// unranked by AI but still filtered by the search itself.
function buildFallbackResult(candidates: HotpepperShop[], targetBudget: number): AISuggestResult {
  const top = [...candidates]
    .sort(
      (a, b) =>
        Math.abs(parseYenAmount(a.budget.average) - targetBudget) -
        Math.abs(parseYenAmount(b.budget.average) - targetBudget)
    )
    .slice(0, 5);

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
