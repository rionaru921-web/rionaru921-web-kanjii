import { mockTravelPlans } from "../mock/travel";
import { TRAVEL_TYPE_LABELS } from "./types";
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
    if (params.travelType) {
      const label = TRAVEL_TYPE_LABELS[params.travelType];
      if (label && !plan.tags.includes(label)) return false;
    }
    if (params.transport) {
      const transportMatches: Record<string, string[]> = {
        car: ["車"],
        train: ["新幹線", "電車"],
        flight: ["飛行機"],
      };
      const accepted = transportMatches[params.transport] ?? [];
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
