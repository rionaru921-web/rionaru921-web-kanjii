import { mockRestaurants } from "../mock/restaurants";
import {
  searchHotpepper,
  type HotpepperSearchParams,
  type HotpepperShop,
} from "./hotpepper";
import { budgetPerPersonToCode } from "../constants/budgets";
import { findStationByName } from "../constants/locations";
import type { Restaurant, RestaurantSearchResult, SearchParams } from "./types";

export { averageBudgetYen } from "./restaurant-utils";

// Shared by the initial SSR fetch (below) and the results page, which needs
// the same hotpepper-shaped query to build the "もっと見る" pagination
// request sent client-side to /api/hotpepper/search.
export function buildHotpepperSearchParams(
  params: SearchParams
): Omit<HotpepperSearchParams, "start"> {
  const station = params.station ? findStationByName(params.station) : undefined;

  return {
    keyword: station ? undefined : params.station,
    lat: station?.lat,
    lng: station?.lng,
    range: params.range ?? 3,
    budget: budgetPerPersonToCode(params.budget),
    genre: params.genre,
    privateRoom: params.privateRoom,
    partyCapacity: params.people,
    // 20 was tight enough that the AI's post-search capacity filter
    // (suggestShops) sometimes had too few candidates left to pick 3-5
    // good ones from. genre/privateRoom are already optional (undefined
    // unless the user picks one), so this is the one real lever here.
    count: 30,
  };
}

// Falls back to mock data whenever the API key isn't configured, so the app
// keeps working out of the box; NEXT_PUBLIC_USE_MOCK lets you force mock
// mode during development to conserve HotPepper API quota.
const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK === "true" || !process.env.HOTPEPPER_API_KEY;

export async function searchRestaurants(
  params: SearchParams,
  options?: { forceMock?: boolean }
): Promise<RestaurantSearchResult> {
  if (USE_MOCK || options?.forceMock) {
    return searchMockRestaurants(params);
  }
  return searchHotpepperAsRestaurants(params);
}

function searchMockRestaurants(params: SearchParams): RestaurantSearchResult {
  const filtered = mockRestaurants.filter((r) => {
    if (r.capacity < params.people) return false;
    if ((r.budgetMin ?? 0) > params.budget) return false;
    if (params.genre && r.genreCode !== params.genre) return false;
    if (params.privateRoom && !r.privateRoom) return false;
    if (
      params.station &&
      !r.station.includes(params.station) &&
      !params.station.includes(r.station)
    ) {
      return false;
    }
    return true;
  });

  const sorted = filtered
    .map((restaurant) => ({
      restaurant,
      score: (restaurant.rating ?? 0) * (restaurant.reviewCount ?? 0),
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.restaurant);

  return {
    shops: sorted.slice(0, 10),
    totalAvailable: sorted.length,
    start: 1,
    source: "mock",
  };
}

async function searchHotpepperAsRestaurants(
  params: SearchParams
): Promise<RestaurantSearchResult> {
  const result = await searchHotpepper({
    ...buildHotpepperSearchParams(params),
    start: params.start ?? 1,
  });

  return {
    shops: result.shops.map(hotpepperShopToRestaurant),
    totalAvailable: result.totalAvailable,
    start: result.start,
    source: "hotpepper",
  };
}

export function hotpepperShopToRestaurant(shop: HotpepperShop): Restaurant {
  return {
    id: shop.id,
    name: shop.name,
    genreCode: shop.genre.code,
    genreCatch: shop.genre.catch,
    budgetLabel: shop.budget.name,
    budgetAverage: shop.budget.average,
    station: shop.stationName,
    privateRoom: shop.privateRoom,
    capacity: shop.partyCapacity,
    address: shop.address,
    access: shop.access,
    photoUrl: shop.photos.large || shop.photos.medium,
    shopUrl: shop.urls.pc,
    source: "hotpepper",
  };
}
