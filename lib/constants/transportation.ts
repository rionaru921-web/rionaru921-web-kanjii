export interface TransportationOption {
  value: string;
  label: string;
  icon: string;
  category: string;
  description: string;
  // TravelPlan.transport strings (lib/mock/travel.ts) this option should
  // match. Defaults to [label] when omitted.
  matchLabels?: readonly string[];
}

export const TRANSPORTATION_CATEGORIES: Record<string, { label: string; icon: string }> = {
  train: { label: "電車", icon: "🚆" },
  car: { label: "車", icon: "🚙" },
  bus: { label: "バス", icon: "🚌" },
  air: { label: "飛行機", icon: "✈️" },
  sea: { label: "海路", icon: "⛴️" },
  light: { label: "徒歩・自転車", icon: "🚲" },
};

// value/label/matchLabels for car・train・flight must stay exactly as
// before — lib/api/travel.ts matches these against mock plan transport
// strings, so changing them would silently break existing filtering.
export const TRANSPORTATION_OPTIONS: readonly TransportationOption[] = [
  { value: "train", label: "電車", icon: "🚃", category: "train", description: "JR・私鉄各線", matchLabels: ["新幹線", "電車"] },
  { value: "car", label: "車", icon: "🚗", category: "car", description: "マイカー", matchLabels: ["車"] },
  { value: "flight", label: "飛行機", icon: "✈️", category: "air", description: "飛行機（国内線）", matchLabels: ["飛行機"] },

  { value: "shinkansen", label: "新幹線", icon: "🚄", category: "train", description: "長距離高速移動", matchLabels: ["新幹線"] },
  { value: "subway", label: "地下鉄", icon: "🚇", category: "train", description: "都市部の地下鉄" },
  { value: "monorail", label: "モノレール", icon: "🚝", category: "train", description: "モノレール・新交通" },

  { value: "rental_car", label: "レンタカー", icon: "🚙", category: "car", description: "レンタカー" },
  { value: "taxi", label: "タクシー", icon: "🚕", category: "car", description: "タクシー・配車アプリ" },

  { value: "highway_bus", label: "高速バス", icon: "🚌", category: "bus", description: "長距離高速バス" },
  { value: "local_bus", label: "路線バス", icon: "🚍", category: "bus", description: "市内バス" },
  { value: "tour_bus", label: "観光バス", icon: "🚌", category: "bus", description: "観光ツアーバス" },

  { value: "international", label: "飛行機（国際線）", icon: "🛫", category: "air", description: "海外行き飛行機" },

  { value: "ferry", label: "フェリー", icon: "⛴️", category: "sea", description: "フェリー・船舶" },
  { value: "cruise", label: "クルーズ船", icon: "🚢", category: "sea", description: "クルーズ旅行" },

  { value: "bicycle", label: "自転車", icon: "🚲", category: "light", description: "ロードバイク・シェアサイクル" },
  { value: "walking", label: "徒歩", icon: "🚶", category: "light", description: "歩き・ハイキング" },
  { value: "motorcycle", label: "バイク", icon: "🏍️", category: "light", description: "バイク・原付" },
] as const;
