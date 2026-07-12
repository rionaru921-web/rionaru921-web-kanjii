// Server-only client for the Rakuten Travel SimpleHotelSearch API. Never
// import this from a Client Component — it reads RAKUTEN_APPLICATION_ID
// (no NEXT_PUBLIC_ prefix) and calling it from the browser would leak it.
import "server-only";

const ENDPOINT =
  "https://app.rakuten.co.jp/services/api/Travel/SimpleHotelSearch/20170426";

export interface RakutenSearchParams {
  keyword?: string;
  largeClassCode?: string;
  middleClassCode?: string;
  smallClassCode?: string;
  hits?: number;
  page?: number;
}

export interface RakutenHotel {
  hotelNo: number;
  hotelName: string;
  hotelKanaName: string;
  address1: string;
  address2: string;
  telephoneNo: string;
  hotelImageUrl: string;
  hotelThumbnailUrl: string;
  hotelInformationUrl: string;
  planListUrl: string;
  reviewAverage: number;
  reviewCount: number;
  hotelMinCharge: number;
  latitude: number;
  longitude: number;
  access: string;
  nearestStation: string;
  hotelSpecial: string;
}

export class RakutenApiError extends Error {
  constructor(
    message: string,
    public readonly kind: "missing_key" | "rate_limited" | "network" | "api" = "api"
  ) {
    super(message);
    this.name = "RakutenApiError";
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHotel(raw: any): RakutenHotel {
  // formatVersion=2 returns each item in `hotels` as a single flat object
  // (not the nested [{ hotelBasicInfo: {...} }] shape formatVersion=1 uses).
  const basicInfo = raw.hotelBasicInfo ?? raw;
  return {
    hotelNo: Number(basicInfo.hotelNo) || 0,
    hotelName: basicInfo.hotelName ?? "",
    hotelKanaName: basicInfo.hotelKanaName ?? "",
    address1: basicInfo.address1 ?? "",
    address2: basicInfo.address2 ?? "",
    telephoneNo: basicInfo.telephoneNo ?? "",
    hotelImageUrl: basicInfo.hotelImageUrl ?? "",
    hotelThumbnailUrl: basicInfo.hotelThumbnailUrl ?? "",
    hotelInformationUrl: basicInfo.hotelInformationUrl ?? "",
    planListUrl: basicInfo.planListUrl ?? "",
    reviewAverage: Number(basicInfo.reviewAverage) || 0,
    reviewCount: Number(basicInfo.reviewCount) || 0,
    hotelMinCharge: Number(basicInfo.hotelMinCharge) || 0,
    latitude: Number(basicInfo.latitude) || 0,
    longitude: Number(basicInfo.longitude) || 0,
    access: basicInfo.access ?? "",
    nearestStation: basicInfo.nearestStation ?? "",
    hotelSpecial: basicInfo.hotelSpecial ?? "",
  };
}

export async function searchRakutenHotels(params: RakutenSearchParams): Promise<{
  hotels: RakutenHotel[];
  total: number;
}> {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID;
  if (!applicationId) {
    throw new RakutenApiError(
      "RAKUTEN_APPLICATION_ID が設定されていません。.env.local を確認してください。",
      "missing_key"
    );
  }

  const url = new URL(ENDPOINT);
  url.searchParams.set("applicationId", applicationId);
  url.searchParams.set("format", "json");
  url.searchParams.set("formatVersion", "2");
  if (params.keyword) url.searchParams.set("keyword", params.keyword);
  if (params.largeClassCode) url.searchParams.set("largeClassCode", params.largeClassCode);
  if (params.middleClassCode) url.searchParams.set("middleClassCode", params.middleClassCode);
  if (params.smallClassCode) url.searchParams.set("smallClassCode", params.smallClassCode);
  url.searchParams.set("hits", String(Math.min(params.hits ?? 10, 30)));
  url.searchParams.set("page", String(params.page ?? 1));

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });
  } catch {
    throw new RakutenApiError(
      "楽天トラベルAPIへの接続に失敗しました。ネットワークをご確認ください。",
      "network"
    );
  }

  if (response.status === 429) {
    throw new RakutenApiError(
      "APIのレート制限に達しました。しばらく時間をおいて再度お試しください。",
      "rate_limited"
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Rakuten API error:", errorText);
    throw new RakutenApiError(
      `楽天トラベルAPIがエラーを返しました (status: ${response.status})`,
      "api"
    );
  }

  const data = await response.json();
  const apiError = data?.error;
  if (apiError) {
    throw new RakutenApiError(
      data.error_description ? `${apiError}: ${data.error_description}` : String(apiError),
      "api"
    );
  }

  const hotels: RakutenHotel[] = (data.hotels ?? []).map(mapHotel);

  return {
    hotels,
    total: Number(data.pagingInfo?.recordCount) || hotels.length,
  };
}
