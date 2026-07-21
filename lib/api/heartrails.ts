import "server-only";
import type { Station } from "@/lib/constants/locations";

const HEARTRAILS_ENDPOINT = "https://express.heartrails.com/api/json";

interface HeartRailsRawStation {
  name: string;
  prefecture: string;
  line: string;
  x: string | number; // longitude
  y: string | number; // latitude
}

// Free, no-signup, nationwide station database (JR/private rail/subway/monorail) —
// https://express.heartrails.com/api.html. Used as an on-demand supplement to the
// small curated STATIONS list in lib/constants/locations.ts, not a replacement:
// the curated list covers common stations instantly with no network round-trip,
// this fills in everything else. Call sites should cache/debounce (see
// app/api/stations/search/route.ts and components/shared/StationAutocomplete.tsx).
export async function searchStationsByName(query: string): Promise<Station[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `${HEARTRAILS_ENDPOINT}?method=getStations&name=${encodeURIComponent(trimmed)}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const data = await res.json();
    // The API returns a bare object (not wrapped in an array) when there's
    // exactly one match, and omits the key entirely when there are none.
    const rawStations: HeartRailsRawStation[] = Array.isArray(data?.response?.station)
      ? data.response.station
      : data?.response?.station
        ? [data.response.station]
        : [];

    return rawStations
      .map((s) => ({
        // HeartRails returns bare names ("東岡崎") — normalize to match the
        // "〇〇駅" convention used throughout the rest of the app (STATIONS,
        // user-typed input, HotPepper keyword search).
        name: s.name.endsWith("駅") ? s.name : `${s.name}駅`,
        lat: Number(s.y),
        lng: Number(s.x),
        line: s.line,
        prefecture: s.prefecture,
      }))
      .filter((s) => s.name && Number.isFinite(s.lat) && Number.isFinite(s.lng));
  } catch (error) {
    console.error("[heartrails] station search failed:", error);
    return [];
  }
}
