// Restaurant is a unified shape produced by both the mock dataset and the
// HotPepper Gourmet API adapter, so RestaurantCard etc. don't need to branch
// on data source. Fields only one source can populate are optional.
export interface Restaurant {
  id: string;
  name: string;
  genreCode: string; // HOTPEPPER_GENRES code, e.g. "G001"
  genreCatch?: string; // hotpepper only: short catch copy for the shop
  rating?: number; // mock only
  reviewCount?: number; // mock only
  budgetMin?: number; // mock only (yen)
  budgetMax?: number; // mock only (yen)
  budgetLabel?: string; // hotpepper only, e.g. "3001~4000円"
  budgetAverage?: string; // hotpepper only, e.g. "3000円"
  station: string;
  privateRoom: boolean;
  capacity: number; // banquet/party capacity, used for people-count filtering
  address: string;
  access?: string; // hotpepper only, e.g. "JR名古屋駅より徒歩3分"
  photoUrl?: string; // hotpepper only
  shopUrl?: string; // hotpepper only, links to the hotpepper.jp shop page
  source: "mock" | "hotpepper";
}

export interface SearchParams {
  people: number;
  budget: number;
  datetime?: string;
  station?: string;
  genre?: string; // HOTPEPPER_GENRES code
  privateRoom?: boolean;
  range?: 1 | 2 | 3 | 4 | 5; // hotpepper search radius: 300m/500m/1000m/2000m/3000m
  start?: number; // 1-indexed pagination offset, hotpepper only
}

export interface RestaurantSearchResult {
  shops: Restaurant[];
  totalAvailable: number;
  start: number;
  source: "mock" | "hotpepper";
}

// --- Travel ---

export type TravelDifficulty = "easy" | "medium" | "active";

export interface TravelItineraryDay {
  day: number;
  summary: string;
}

export interface TravelPlan {
  id: string;
  title: string;
  destination: string;
  days: number;
  nights: number;
  totalPrice: number;
  pricePerPerson: number;
  hotelName: string;
  hotelRating: number;
  spots: string[];
  restaurants: string[];
  transport: string;
  difficulty: TravelDifficulty;
  tags: string[];
  itinerary: TravelItineraryDay[];
}

export interface TravelSearchParams {
  destination?: string;
  people: number;
  startDate?: string;
  endDate?: string;
  budget: number;
  travelType?: string[];
  transport?: string[];
}

export const DESTINATIONS = [
  "京都",
  "沖縄",
  "北海道",
  "箱根",
  "軽井沢",
  "福岡",
  "名古屋",
  "大阪",
  "東京",
];

export const DIFFICULTY_LABELS: Record<TravelDifficulty, string> = {
  easy: "のんびり",
  medium: "標準",
  active: "アクティブ",
};
