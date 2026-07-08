// Server-only client for the HotPepper Gourmet API. Never import this from
// a Client Component — it reads HOTPEPPER_API_KEY (no NEXT_PUBLIC_ prefix)
// and calling it from the browser would leak the key.
import "server-only";

const ENDPOINT = "https://webservice.recruit.co.jp/hotpepper/gourmet/v1/";

export interface HotpepperSearchParams {
  id?: string;
  keyword?: string;
  lat?: number;
  lng?: number;
  range?: 1 | 2 | 3 | 4 | 5;
  budget?: string;
  genre?: string;
  privateRoom?: boolean;
  partyCapacity?: number;
  count?: number;
  start?: number;
}

export interface HotpepperShop {
  id: string;
  name: string;
  address: string;
  stationName: string;
  lat: number;
  lng: number;
  genre: { code: string; name: string; catch: string };
  budget: { code: string; name: string; average: string };
  capacity: number;
  partyCapacity: number;
  access: string;
  privateRoom: boolean;
  open: string;
  close: string;
  photos: { large: string; medium: string; small: string };
  shopImages: string[];
  urls: { pc: string };
  wifi: string;
  card: string;
  nonSmoking: string;
  freeDrink: string;
  freeFood: string;
  course: string;
}

export class HotpepperApiError extends Error {
  constructor(
    message: string,
    public readonly kind: "missing_key" | "rate_limited" | "network" | "api" = "api"
  ) {
    super(message);
    this.name = "HotpepperApiError";
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapShop(raw: any): HotpepperShop {
  return {
    id: raw.id,
    name: raw.name,
    address: raw.address ?? "",
    stationName: raw.station_name ?? "",
    lat: Number(raw.lat) || 0,
    lng: Number(raw.lng) || 0,
    genre: {
      code: raw.genre?.code ?? "",
      name: raw.genre?.name ?? "",
      catch: raw.genre?.catch ?? "",
    },
    budget: {
      code: raw.budget?.code ?? "",
      name: raw.budget?.name ?? "",
      average: raw.budget?.average ?? "",
    },
    capacity: Number(raw.capacity) || 0,
    partyCapacity: Number(raw.party_capacity) || Number(raw.capacity) || 0,
    access: raw.access ?? raw.mobile_access ?? "",
    privateRoom: raw.private_room ? raw.private_room !== "なし" : false,
    open: raw.open ?? "",
    close: raw.close ?? "",
    photos: {
      large: raw.photo?.pc?.l ?? "",
      medium: raw.photo?.pc?.m ?? "",
      small: raw.photo?.pc?.s ?? "",
    },
    shopImages: [raw.shop_image1, raw.shop_image2].filter(Boolean),
    urls: { pc: raw.urls?.pc ?? "" },
    wifi: raw.wifi ?? "",
    card: raw.card ?? "",
    nonSmoking: raw.non_smoking ?? "",
    freeDrink: raw.free_drink ?? "",
    freeFood: raw.free_food ?? "",
    course: raw.course ?? "",
  };
}

async function callHotpepper(params: HotpepperSearchParams) {
  const apiKey = process.env.HOTPEPPER_API_KEY;
  if (!apiKey) {
    throw new HotpepperApiError(
      "HOTPEPPER_API_KEY が設定されていません。.env.local を確認してください。",
      "missing_key"
    );
  }

  const query = new URLSearchParams({ key: apiKey, format: "json" });
  if (params.id) query.set("id", params.id);
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.lat != null) query.set("lat", String(params.lat));
  if (params.lng != null) query.set("lng", String(params.lng));
  if (params.range) query.set("range", String(params.range));
  if (params.budget) query.set("budget", params.budget);
  if (params.genre) query.set("genre", params.genre);
  if (params.privateRoom) query.set("private_room", "1");
  if (params.partyCapacity) query.set("party_capacity", String(params.partyCapacity));
  query.set("count", String(params.count ?? 20));
  query.set("start", String(params.start ?? 1));

  let response: Response;
  try {
    response = await fetch(`${ENDPOINT}?${query.toString()}`, {
      // HotPepper results change slowly; let our own cache layer (cache.ts)
      // own the TTL instead of double-caching at the fetch layer.
      cache: "no-store",
    });
  } catch {
    throw new HotpepperApiError(
      "ホットペッパーAPIへの接続に失敗しました。ネットワークをご確認ください。",
      "network"
    );
  }

  if (response.status === 429) {
    throw new HotpepperApiError(
      "APIのレート制限に達しました。しばらく時間をおいて再度お試しください。",
      "rate_limited"
    );
  }

  if (!response.ok) {
    throw new HotpepperApiError(
      `ホットペッパーAPIがエラーを返しました (status: ${response.status})`,
      "api"
    );
  }

  const data = await response.json();
  const apiError = data?.results?.error;
  if (apiError && apiError.length > 0) {
    throw new HotpepperApiError(
      apiError.map((e: { message: string }) => e.message).join(" / "),
      "api"
    );
  }

  return data.results;
}

export async function searchHotpepper(params: HotpepperSearchParams): Promise<{
  shops: HotpepperShop[];
  totalAvailable: number;
  start: number;
}> {
  const results = await callHotpepper(params);
  const shops = (results?.shop ?? []).map(mapShop);

  return {
    shops,
    totalAvailable: Number(results?.results_available) || 0,
    start: Number(results?.results_start) || 1,
  };
}

export async function getShopById(id: string): Promise<HotpepperShop | null> {
  const results = await callHotpepper({ id, count: 1 });
  const shop = results?.shop?.[0];
  return shop ? mapShop(shop) : null;
}
