import "server-only";
import { searchStationsByName } from "@/lib/api/heartrails";

export interface AreaSuggestion {
  stationName: string;
  reason: string;
}

// "When all else fails" expansion targets per prefecture, built from the
// curated STATIONS list (lib/constants/locations.ts) rather than a
// separate data file to keep in sync. Aichi is filled in first since
// that's where most current usage is; other prefectures can grow this list
// over time without touching any other part of this feature.
const PREFECTURE_FALLBACKS: Record<string, string[]> = {
  愛知県: ["名古屋駅", "栄駅", "金山駅"],
  東京都: ["東京駅", "渋谷駅", "新宿駅", "池袋駅"],
  大阪府: ["大阪駅", "梅田駅", "難波駅"],
  京都府: ["京都駅"],
  福岡県: ["博多駅", "西鉄福岡（天神）駅"],
  北海道: ["札幌駅"],
  宮城県: ["仙台駅"],
};

// HeartRails is the source of truth for prefecture, not the curated
// STATIONS list — that list only stores name/lat/lng (see the Station
// type's comment), so even well-known stations need this lookup.
async function resolvePrefecture(stationName: string): Promise<string | undefined> {
  const remote = await searchStationsByName(stationName);
  return remote[0]?.prefecture;
}

export async function getExpansionSuggestions(
  originalStation: string | undefined
): Promise<AreaSuggestion[]> {
  if (!originalStation) return [];

  const prefecture = await resolvePrefecture(originalStation);
  if (!prefecture) return [];

  const candidates = PREFECTURE_FALLBACKS[prefecture] ?? [];
  return candidates
    .filter((name) => name !== originalStation)
    .slice(0, 3)
    .map((name) => ({
      stationName: name,
      reason: "店舗数が豊富な主要駅",
    }));
}
