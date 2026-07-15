export type SplitMode = "equal" | "tiered";

export type TierLevel = "organizer" | "boss" | "senior" | "peer" | "junior" | "newcomer";

export type OrganizerDiscount = "free" | "half" | "discount" | "none";

export type RoundingUnit = 100 | 500 | 1000;

export const SPLIT_MODE_LABELS: Record<SplitMode, string> = {
  equal: "均等割り",
  tiered: "傾斜割り",
};

export const TIER_LEVELS: TierLevel[] = ["organizer", "boss", "senior", "peer", "junior", "newcomer"];

export const TIER_LABELS: Record<TierLevel, string> = {
  organizer: "幹事",
  boss: "上司",
  senior: "先輩",
  peer: "同期",
  junior: "後輩",
  newcomer: "新人",
};

// Base weight per tier — overridable per-member via weight_override, and
// superseded entirely for organizer-tier members that also pick an
// organizer_discount (see resolveMemberWeight in calculate-split.ts).
export const TIER_WEIGHTS: Record<TierLevel, number> = {
  organizer: 1.0,
  boss: 1.5,
  senior: 1.2,
  peer: 1.0,
  junior: 0.8,
  newcomer: 0.5,
};

export const ORGANIZER_DISCOUNTS: OrganizerDiscount[] = ["free", "half", "discount", "none"];

export const ORGANIZER_DISCOUNT_LABELS: Record<OrganizerDiscount, string> = {
  free: "無料(0円)",
  half: "半額(0.5倍)",
  discount: "割引(0.8倍)",
  none: "通常(1.0倍)",
};

// Takes priority over TIER_WEIGHTS.organizer whenever set — see
// resolveMemberWeight.
export const ORGANIZER_DISCOUNT_WEIGHTS: Record<OrganizerDiscount, number> = {
  free: 0,
  half: 0.5,
  discount: 0.8,
  none: 1.0,
};

export const ROUNDING_UNITS: RoundingUnit[] = [100, 500, 1000];
export const DEFAULT_ROUNDING_UNIT: RoundingUnit = 100;
export const DEFAULT_TIER_LEVEL: TierLevel = "peer";
