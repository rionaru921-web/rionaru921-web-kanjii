import { TIER_WEIGHTS, ORGANIZER_DISCOUNT_WEIGHTS, type TierLevel, type OrganizerDiscount } from "./split-types";

export interface SplitMemberInput {
  id: string;
  tierLevel: TierLevel;
  weightOverride: number | null;
  organizerDiscount: OrganizerDiscount | null;
}

export interface SplitMemberResult {
  id: string;
  weight: number;
  amount: number;
}

// Priority, highest first:
//  1. organizer_discount, but ONLY for tier_level === 'organizer' (the DB
//     check constraint already enforces organizer_discount is null for any
//     other tier — this guard just keeps the function correct even when
//     called with not-yet-persisted form state).
//  2. weight_override, if the member explicitly set one.
//  3. the tier's base weight.
export function resolveMemberWeight(
  member: Pick<SplitMemberInput, "tierLevel" | "weightOverride" | "organizerDiscount">
): number {
  if (member.tierLevel === "organizer" && member.organizerDiscount != null) {
    return ORGANIZER_DISCOUNT_WEIGHTS[member.organizerDiscount];
  }
  if (member.weightOverride != null) return member.weightOverride;
  return TIER_WEIGHTS[member.tierLevel];
}

// Splits feeAmount across members proportionally to each member's resolved
// weight, rounding each member's share UP to the nearest roundingUnit —
// same rounding direction as perPersonFee ("never collect less than the
// total fee"), just applied per-member instead of once. The group absorbs
// any over-collection this produces, exactly like perPersonFee's existing
// remainder-rounding behavior.
//
// Returns null when there's nothing sensible to compute (matches
// perPersonFee's null-for-unusable-input convention) — but feeAmount === 0
// is a valid budget (free event) and returns all-zero amounts, not null.
export function calculateSplit(
  feeAmount: number | null,
  members: SplitMemberInput[],
  roundingUnit: number = 100
): SplitMemberResult[] | null {
  if (feeAmount == null || members.length === 0) return null;

  const unit = roundingUnit > 0 ? roundingUnit : 100;
  const weights = members.map((m) => Math.max(0, resolveMemberWeight(m)));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // All-weights-zero fallback (e.g. every organizer-tier member picked
  // 'free', or every weight_override was set to 0): dividing by a zero
  // totalWeight would produce NaN/Infinity, so fall back to splitting
  // evenly across all members.
  const usableWeights = totalWeight > 0 ? weights : members.map(() => 1);
  const usableTotal = totalWeight > 0 ? totalWeight : members.length;

  return members.map((member, i) => {
    const weight = usableWeights[i];
    const rawShare = (feeAmount * weight) / usableTotal;
    const amount = Math.ceil(rawShare / unit) * unit;
    return { id: member.id, weight, amount };
  });
}
