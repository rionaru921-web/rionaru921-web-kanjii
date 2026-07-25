// 会場の設備タグ。venue_facilities カラム(jsonb配列)に保存する文字列のid。

export const VENUE_FACILITIES = [
  "private_room",
  "wifi",
  "tv",
  "karaoke",
  "smoking_ok",
  "smoking_no",
] as const;

export type VenueFacility = (typeof VENUE_FACILITIES)[number];

export const VENUE_FACILITY_LABELS: Record<VenueFacility, string> = {
  private_room: "個室あり",
  wifi: "Wi-Fi",
  tv: "TV",
  karaoke: "カラオケ",
  smoking_ok: "喫煙可",
  smoking_no: "全席禁煙",
};
