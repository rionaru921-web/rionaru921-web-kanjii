import { mockTravelPlans } from "../mock/travel";
import { TRAVEL_TYPES } from "../constants/travel-types";
import { TRANSPORTATION_OPTIONS } from "../constants/transportation";
import type { TravelPlan, TravelSearchParams } from "./types";

// P1: モックデータをフィルタして返す
// P2で: 旅行プランAPI呼び出しに差し替え予定
export async function searchTravelPlans(
  params: TravelSearchParams
): Promise<TravelPlan[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const filtered = mockTravelPlans.filter((plan) => {
    if (plan.pricePerPerson > params.budget) return false;
    if (
      params.destination &&
      !plan.destination.includes(params.destination) &&
      !params.destination.includes(plan.destination)
    ) {
      return false;
    }
    // Multiple travel types are OR-matched: a plan passes if it carries the
    // tag for at least one selected type.
    if (params.travelType && params.travelType.length > 0) {
      const labels = params.travelType
        .map((code) => TRAVEL_TYPES.find((t) => t.value === code)?.label)
        .filter((label): label is string => Boolean(label));
      if (labels.length > 0 && !labels.some((label) => plan.tags.includes(label))) {
        return false;
      }
    }
    if (params.transport && params.transport.length > 0) {
      const accepted = params.transport.flatMap((code) => {
        const option = TRANSPORTATION_OPTIONS.find((t) => t.value === code);
        if (!option) return [];
        return option.matchLabels ?? [option.label];
      });
      if (accepted.length > 0 && !accepted.includes(plan.transport)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => b.hotelRating - a.hotelRating);
  return sorted.slice(0, 5);
}

export function planTotalForPeople(plan: TravelPlan, people: number): number {
  return plan.pricePerPerson * Math.max(people, 1);
}
