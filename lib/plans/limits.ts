export type PlanTier = "free" | "premium" | "team";

export interface PlanLimits {
  maxPlansPerMonth: number;
  maxAiSuggestionsPerMonth: number;
  canUseTieredSplit: boolean;
  canExportPdf: boolean;
  canUseAdvancedSharing: boolean;
}

// maxAiSuggestionsPerMonth は lib/plans/checkAiUsage.ts が実際に強制する
// (app/api/ai/suggest/route.ts 経由)。maxPlansPerMonth 等の他の数値上限は
// まだどこからも参照・強制されていない将来の想定値。機能フラグ
// (canUseTieredSplit 等)はベータ期間中につき全ティアで true にしてある。
export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxPlansPerMonth: 10,
    maxAiSuggestionsPerMonth: 10,
    canUseTieredSplit: true,
    canExportPdf: true,
    canUseAdvancedSharing: true,
  },
  premium: {
    maxPlansPerMonth: -1,
    maxAiSuggestionsPerMonth: -1,
    canUseTieredSplit: true,
    canExportPdf: true,
    canUseAdvancedSharing: true,
  },
  team: {
    maxPlansPerMonth: -1,
    maxAiSuggestionsPerMonth: -1,
    canUseTieredSplit: true,
    canExportPdf: true,
    canUseAdvancedSharing: true,
  },
};

export function getUserPlanLimits(planTier: PlanTier): PlanLimits {
  return PLAN_LIMITS[planTier];
}
