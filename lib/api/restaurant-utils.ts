import type { Restaurant } from "./types";

// HotPepper's budget.average is free text and often contains more than one
// number (e.g. "4000円(通常平均） 5000円(宴会平均)" or "ランチ1000～2000円、
// ディナー2000円～3000円"). Stripping all non-digit characters concatenates
// every number in the string into one nonsensical figure (4000 + 5000 -> the
// string "40005000"), so this takes just the first number token instead.
export function parseYenAmount(text: string): number {
  const match = text.match(/[\d,]+/);
  if (!match) return 0;
  const parsed = parseInt(match[0].replace(/,/g, ""), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

// A single per-person yen figure usable for sorting/totals regardless of
// whether the restaurant came from the mock dataset (budgetMin/Max) or the
// HotPepper API (budgetAverage, a free-text string like "3000円").
//
// Deliberately has no server-only dependencies (unlike lib/api/restaurants.ts,
// which pulls in the HotPepper client) so Client Components can import it.
export function averageBudgetYen(r: Restaurant): number {
  if (r.budgetMin != null && r.budgetMax != null) {
    return Math.round((r.budgetMin + r.budgetMax) / 2);
  }
  if (r.budgetAverage) {
    return parseYenAmount(r.budgetAverage);
  }
  return 0;
}
