import "server-only";
import { searchHotpepper, type HotpepperShop } from "@/lib/api/hotpepper";
import { buildHotpepperSearchParams } from "@/lib/api/restaurants";
import { getCached, setCached } from "@/lib/api/cache";
import { DRINK_BUDGET_PRESETS } from "@/lib/constants/budget";
import type { SearchParams } from "@/lib/api/types";

// Below this many candidates, the AI has too little to actually choose
// between (see suggestShops' "候補が少ない" handling) — worth relaxing
// further even if the search technically returned >0 results.
const MIN_ACCEPTABLE = 3;

export type RelaxationLevel = 1 | 2 | 3;

export interface RelaxationInfo {
  level: RelaxationLevel;
  label: string;
  appliedBudget: number;
  genreDropped: boolean;
  rangeWidened: boolean;
}

export interface ProgressiveSearchResult {
  shops: HotpepperShop[];
  relaxation: RelaxationInfo | null; // null at level 0 (no relaxation needed) or when nothing was found at all
}

async function cachedSearch(params: SearchParams) {
  const hpParams = await buildHotpepperSearchParams(params);
  const cacheKey = `search:${JSON.stringify(hpParams)}`;
  let result = getCached<Awaited<ReturnType<typeof searchHotpepper>>>(cacheKey);
  if (!result) {
    result = await searchHotpepper(hpParams);
    setCached(cacheKey, result);
  }
  return result;
}

// The next preset up from the user's chosen budget — mirrors how the budget
// picker presents choices, so "relaxed" still lines up with a value the
// user would recognize (e.g. 5,000円 → 6,000円), rather than an arbitrary
// HotPepper budget-code boundary.
function nextBudgetCeiling(current: number): number {
  const next = DRINK_BUDGET_PRESETS.find((p) => p.value > current);
  return next ? next.value : current + 2000;
}

// Progressively loosens the search — budget, then genre, then search
// radius — stopping as soon as a stage clears MIN_ACCEPTABLE (or, on the
// final stage, finds anything at all). Each HotPepper call goes through the
// same cache as a normal search, so re-running the same relaxed query
// (e.g. a user retrying) doesn't cost extra API quota.
export async function runProgressiveSearch(
  params: SearchParams
): Promise<ProgressiveSearchResult> {
  let best: HotpepperShop[] = [];
  let bestRelaxation: RelaxationInfo | null = null;

  // Stage 0: conditions as given.
  let result = await cachedSearch(params);
  if (result.shops.length >= MIN_ACCEPTABLE) {
    return { shops: result.shops, relaxation: null };
  }
  if (result.shops.length > best.length) {
    best = result.shops;
    bestRelaxation = null;
  }

  // Stage 1: widen the budget ceiling by one preset step.
  const relaxedBudget = nextBudgetCeiling(params.budget);
  const stage1Params = { ...params, budget: relaxedBudget };
  result = await cachedSearch(stage1Params);
  const stage1Relaxation: RelaxationInfo = {
    level: 1,
    label: "予算条件を少し広げて",
    appliedBudget: relaxedBudget,
    genreDropped: false,
    rangeWidened: false,
  };
  if (result.shops.length >= MIN_ACCEPTABLE) {
    return { shops: result.shops, relaxation: stage1Relaxation };
  }
  if (result.shops.length > best.length) {
    best = result.shops;
    bestRelaxation = stage1Relaxation;
  }

  // Stage 2: drop the genre filter (only meaningful if one was set).
  if (params.genre) {
    const stage2Params = { ...stage1Params, genre: undefined };
    result = await cachedSearch(stage2Params);
    const stage2Relaxation: RelaxationInfo = {
      level: 2,
      label: "ジャンル指定を解除して",
      appliedBudget: relaxedBudget,
      genreDropped: true,
      rangeWidened: false,
    };
    if (result.shops.length >= MIN_ACCEPTABLE) {
      return { shops: result.shops, relaxation: stage2Relaxation };
    }
    if (result.shops.length > best.length) {
      best = result.shops;
      bestRelaxation = stage2Relaxation;
    }
  }

  // Stage 3: widen the search radius (1000m → 3000m) — the closest
  // equivalent this app has to "expand the area", since HotPepper searches
  // here are lat/lng+radius, not a station/district code.
  const stage3Params = { ...params, budget: relaxedBudget, genre: undefined, range: 5 as const };
  result = await cachedSearch(stage3Params);
  const stage3Relaxation: RelaxationInfo = {
    level: 3,
    label: "検索範囲を広げて",
    appliedBudget: relaxedBudget,
    genreDropped: Boolean(params.genre),
    rangeWidened: true,
  };
  if (result.shops.length > 0) {
    return { shops: result.shops, relaxation: stage3Relaxation };
  }
  if (result.shops.length > best.length) {
    best = result.shops;
    bestRelaxation = stage3Relaxation;
  }

  // No stage cleared MIN_ACCEPTABLE, and the final (widest) stage found
  // nothing — fall back to whatever the best earlier stage had, even if
  // that's only 1-2 shops. Only truly empty (best.length === 0) falls
  // through to the caller's area-expansion suggestions.
  return { shops: best, relaxation: bestRelaxation };
}
