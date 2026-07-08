export interface Station {
  name: string;
  lat: number;
  lng: number;
}

export const STATIONS: Station[] = [
  { name: "名古屋駅", lat: 35.170694, lng: 136.881637 },
  { name: "栄駅", lat: 35.171099, lng: 136.908391 },
  { name: "金山駅", lat: 35.143047, lng: 136.900571 },
  { name: "大須観音駅", lat: 35.159253, lng: 136.899256 },
  { name: "伏見駅", lat: 35.169194, lng: 136.897708 },
  { name: "藤が丘駅", lat: 35.184361, lng: 137.017608 },
  { name: "岡崎駅", lat: 34.938175, lng: 137.164097 },
  { name: "豊橋駅", lat: 34.762683, lng: 137.381681 },
  { name: "東京駅", lat: 35.681236, lng: 139.767125 },
  { name: "渋谷駅", lat: 35.658034, lng: 139.701636 },
  { name: "新宿駅", lat: 35.690921, lng: 139.700258 },
  { name: "大阪駅", lat: 34.702485, lng: 135.495951 },
  { name: "梅田駅", lat: 34.702485, lng: 135.495951 },
  { name: "難波駅", lat: 34.666339, lng: 135.500736 },
  { name: "京都駅", lat: 34.985849, lng: 135.758767 },
  { name: "博多駅", lat: 33.590188, lng: 130.420685 },
  { name: "札幌駅", lat: 43.068625, lng: 141.350801 },
  { name: "仙台駅", lat: 38.260139, lng: 140.882437 },
];

export function findStationByName(name: string): Station | undefined {
  const trimmed = name.trim();
  if (!trimmed) return undefined;
  return STATIONS.find(
    (s) => s.name.includes(trimmed) || trimmed.includes(s.name.replace("駅", ""))
  );
}
