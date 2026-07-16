export type PlanTier = "free" | "premium" | "team";

export interface PlanLimits {
  maxPlansPerMonth: number;
  maxAiSuggestionsPerMonth: number;
  canUseTieredSplit: boolean;
  canExportPdf: boolean;
  canUseAdvancedSharing: boolean;
}

// free の数値上限(maxPlansPerMonth / maxAiSuggestionsPerMonth)は将来の
// 想定値であり、まだどこからも参照・強制されていない。機能フラグ
// (canUseTieredSplit 等)はベータ期間中につき全ティアで true にしてある。
// 正式な制限を導入する際はこのテーブルだけ更新すればよい(呼び出し側は
// getUserPlanLimits() 経由でしか値を見ない想定)。
export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxPlansPerMonth: 10,
    maxAiSuggestionsPerMonth: 20,
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
