export interface GenreOption {
  code: string;
  name: string;
}

// Verified live against HotPepper's genre master endpoint
// (https://webservice.recruit.co.jp/hotpepper/genre/v1/) on 2026-07-08 —
// codes match the gourmet-search API docs, names updated to the official
// wording (e.g. "焼肉・ホルモン" not "焼肉").
export const HOTPEPPER_GENRES: GenreOption[] = [
  { code: "G001", name: "居酒屋" },
  { code: "G002", name: "ダイニングバー・バル" },
  { code: "G003", name: "創作料理" },
  { code: "G004", name: "和食" },
  { code: "G005", name: "洋食" },
  { code: "G006", name: "イタリアン・フレンチ" },
  { code: "G007", name: "中華" },
  { code: "G008", name: "焼肉・ホルモン" },
  { code: "G017", name: "韓国料理" },
  { code: "G009", name: "アジア・エスニック料理" },
  { code: "G010", name: "各国料理" },
  { code: "G011", name: "カラオケ・パーティ" },
  { code: "G012", name: "バー・カクテル" },
  { code: "G013", name: "ラーメン" },
  { code: "G016", name: "お好み焼き・もんじゃ" },
  { code: "G014", name: "カフェ・スイーツ" },
  { code: "G015", name: "その他グルメ" },
];

const GENRE_MAP = new Map(HOTPEPPER_GENRES.map((g) => [g.code, g.name]));

export function genreNameByCode(code?: string): string {
  if (!code) return "その他グルメ";
  return GENRE_MAP.get(code) ?? "その他グルメ";
}
