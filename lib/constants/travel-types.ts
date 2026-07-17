export interface TravelTypeOption {
  value: string;
  label: string;
  icon: string;
  category: string;
  description: string;
}

export const TRAVEL_TYPE_CATEGORIES: Record<string, { label: string }> = {
  sightseeing: { label: "観光" },
  relax: { label: "癒し" },
  play: { label: "遊び" },
  food: { label: "グルメ" },
  outdoor: { label: "アウトドア" },
  sports: { label: "スポーツ" },
  nature: { label: "自然" },
  culture: { label: "文化" },
};

// value/label for sightseeing・gourmet・onsen・active must stay exactly as
// before — lib/api/travel.ts matches these labels against mock plan tags,
// so changing them would silently break existing travel-type filtering.
export const TRAVEL_TYPES: readonly TravelTypeOption[] = [
  { value: "sightseeing", label: "観光重視", icon: "🏛️", category: "sightseeing", description: "有名スポット巡り" },
  { value: "gourmet", label: "グルメ重視", icon: "🍜", category: "food", description: "ご当地グルメ" },
  { value: "onsen", label: "温泉重視", icon: "♨️", category: "relax", description: "温泉・リラックス" },
  { value: "active", label: "アクティブ", icon: "🏄", category: "sports", description: "体を動かすアクティビティ" },

  { value: "history", label: "歴史巡り", icon: "🏯", category: "sightseeing", description: "城・寺社・史跡" },
  { value: "temple", label: "寺社巡り", icon: "⛩️", category: "sightseeing", description: "お参り・御朱印" },

  { value: "resort", label: "リゾート", icon: "🏝️", category: "relax", description: "南国・リゾート地" },
  { value: "ryokan", label: "旅館・宿泊重視", icon: "🏨", category: "relax", description: "和風旅館・料理" },

  { value: "amusement", label: "遊園地", icon: "🎢", category: "play", description: "ディズニー・USJ等" },
  { value: "aquarium", label: "水族館", icon: "🐟", category: "play", description: "水族館めぐり" },
  { value: "zoo", label: "動物園", icon: "🦁", category: "play", description: "動物園・サファリ" },

  { value: "food_tour", label: "食べ歩き", icon: "🍡", category: "food", description: "食べ歩き・屋台" },
  { value: "wine", label: "酒蔵・ワイナリー", icon: "🍷", category: "food", description: "酒蔵見学・試飲" },

  { value: "outdoor", label: "アウトドア", icon: "🏔️", category: "outdoor", description: "登山・ハイキング" },
  { value: "camping", label: "キャンプ", icon: "⛺", category: "outdoor", description: "キャンプ・BBQ" },
  { value: "bbq", label: "BBQ・バーベキュー", icon: "🍖", category: "outdoor", description: "BBQ・野外食事" },

  { value: "ski", label: "スキー・スノボ", icon: "🎿", category: "sports", description: "ゲレンデ・スキー場" },
  { value: "golf", label: "ゴルフ", icon: "⛳", category: "sports", description: "ゴルフ場" },
  { value: "marine", label: "マリンスポーツ", icon: "🏄‍♂️", category: "sports", description: "サーフィン・SUP・ダイビング" },

  { value: "beach", label: "ビーチ", icon: "🏖️", category: "nature", description: "海水浴・砂浜" },
  { value: "nature", label: "自然散策", icon: "🌲", category: "nature", description: "森林浴・湿原" },

  { value: "art", label: "美術館・博物館", icon: "🎨", category: "culture", description: "美術館・博物館巡り" },
  { value: "live", label: "ライブ・コンサート", icon: "🎵", category: "culture", description: "ライブ観戦" },
  { value: "theme_park", label: "テーマパーク", icon: "🎡", category: "culture", description: "各種テーマパーク" },
] as const;
