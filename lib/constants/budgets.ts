export interface BudgetOption {
  code: string;
  label: string;
  min: number;
  max: number;
}

// Verified live against HotPepper's budget master endpoint
// (https://webservice.recruit.co.jp/hotpepper/budget/v1/) on 2026-07-08.
// Several codes here (B008–B011, B001–B003, B015–B021) differ from what's
// written in HotPepper's own gourmet-search API documentation, which is
// stale for this master list — using an undocumented-but-live code (e.g.
// budget=B010 expecting "3000-4000円") silently returns zero results
// instead of an error, so this list is sourced from the live master API,
// not the docs.
export const HOTPEPPER_BUDGETS: BudgetOption[] = [
  { code: "B009", label: "〜500円", min: 0, max: 500 },
  { code: "B010", label: "501〜1,000円", min: 500, max: 1000 },
  { code: "B011", label: "1,001〜1,500円", min: 1000, max: 1500 },
  { code: "B001", label: "1,501〜2,000円", min: 1500, max: 2000 },
  { code: "B002", label: "2,001〜3,000円", min: 2000, max: 3000 },
  { code: "B003", label: "3,001〜4,000円", min: 3000, max: 4000 },
  { code: "B008", label: "4,001〜5,000円", min: 4000, max: 5000 },
  { code: "B015", label: "5,001〜6,000円", min: 5000, max: 6000 },
  { code: "B016", label: "6,001〜7,000円", min: 6000, max: 7000 },
  { code: "B017", label: "7,001〜8,000円", min: 7000, max: 8000 },
  { code: "B018", label: "8,001〜9,000円", min: 8000, max: 9000 },
  { code: "B019", label: "9,001〜10,000円", min: 9000, max: 10000 },
  { code: "B020", label: "10,001〜12,000円", min: 10000, max: 12000 },
  { code: "B021", label: "12,001〜15,000円", min: 12000, max: 15000 },
  { code: "B012", label: "15,001〜20,000円", min: 15000, max: 20000 },
  { code: "B013", label: "20,001〜30,000円", min: 20000, max: 30000 },
  { code: "B014", label: "30,001円〜", min: 30000, max: 999999 },
];

// Treats budget as a ceiling ("up to this much per person"), matching how
// it's presented in the UI and how the mock-data search path already
// filters (lib/api/restaurants.ts excludes anything whose budgetMin exceeds
// params.budget). Returns every HotPepper budget code whose range is fully
// at or under that ceiling, comma-joined — HotPepper's `budget=` param
// accepts a comma-separated code list and searches across all of them.
//
// This intentionally does NOT use `budget >= b.min && budget < b.max` to
// pick a single bucket: for a round number like 5000, HOTPEPPER_BUDGETS'
// "4,001〜5,000円" bucket has max=5000 (exclusive), so that comparison
// skips it and lands on "5,001〜6,000円" instead — a bucket that is, by
// its own label, entirely over the requested budget. Every STEP2 preset
// value (2000/3000/4000/5000/6000/8000/10000/12000/15000/20000/30000) sits
// exactly on a bucket boundary and was affected.
export function budgetPerPersonToCode(budget: number): string {
  const codes = HOTPEPPER_BUDGETS.filter((b) => b.min < budget).map((b) => b.code);
  return codes.length > 0 ? codes.join(",") : "B002";
}
