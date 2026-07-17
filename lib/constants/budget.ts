export interface BudgetPreset {
  value: number;
  label: string;
  description: string;
}

export const DRINK_BUDGET_PRESETS: readonly BudgetPreset[] = [
  { value: 2000, label: "2,000円", description: "ランチ会・カフェ会" },
  { value: 2500, label: "2,500円", description: "軽い集まり" },
  { value: 3000, label: "3,000円", description: "カジュアル" },
  { value: 4000, label: "4,000円", description: "一般的な飲み会" },
  { value: 5000, label: "5,000円", description: "飲み放題付き" },
  { value: 6000, label: "6,000円", description: "コース付き" },
  { value: 8000, label: "8,000円", description: "歓迎会・送別会" },
  { value: 10000, label: "10,000円", description: "忘年会・新年会" },
  { value: 12000, label: "12,000円", description: "接待・上司多め" },
  { value: 15000, label: "15,000円", description: "特別な会" },
  { value: 20000, label: "20,000円", description: "高級店" },
  { value: 30000, label: "30,000円", description: "VIP接待" },
] as const;

export const TRAVEL_BUDGET_PRESETS: readonly BudgetPreset[] = [
  { value: 5000, label: "5,000円", description: "日帰り・ゲストハウス" },
  { value: 10000, label: "10,000円", description: "ビジネスホテル" },
  { value: 15000, label: "15,000円", description: "中級ホテル" },
  { value: 20000, label: "20,000円", description: "シティホテル" },
  { value: 30000, label: "30,000円", description: "高級旅館" },
  { value: 50000, label: "50,000円", description: "一流温泉旅館" },
  { value: 80000, label: "80,000円", description: "ラグジュアリー" },
  { value: 100000, label: "100,000円", description: "VIP旅行" },
] as const;

export const BUDGET_CUSTOM_MIN = 1000;
export const BUDGET_CUSTOM_MAX = 1000000;

export function findBudgetPresetDescription(
  presets: readonly BudgetPreset[],
  value: number
): string | undefined {
  return presets.find((p) => p.value === value)?.description;
}
