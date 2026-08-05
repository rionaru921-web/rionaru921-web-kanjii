import type { DateRangeExtendedBreakdown } from "@/lib/surveys/aggregate";

const BG_CLASS: Record<keyof DateRangeExtendedBreakdown, string> = {
  certain: "bg-sage",
  probably: "bg-gold",
  maybe: "bg-ink-secondary",
  no: "bg-vermilion",
};

const ORDER: (keyof DateRangeExtendedBreakdown)[] = ["certain", "probably", "maybe", "no"];

// ◎◯△×の内訳を1本の帯グラフで見せる。DateRecommendation から使う共通部品。
export default function StackedChoiceBar({ breakdown }: { breakdown: DateRangeExtendedBreakdown }) {
  const total = breakdown.certain + breakdown.probably + breakdown.maybe + breakdown.no;

  if (total === 0) {
    return <div className="h-2.5 w-full rounded-full bg-gold/10" />;
  }

  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gold/10">
      {ORDER.map((key) =>
        breakdown[key] > 0 ? (
          <div key={key} className={BG_CLASS[key]} style={{ width: `${(breakdown[key] / total) * 100}%` }} />
        ) : null
      )}
    </div>
  );
}
