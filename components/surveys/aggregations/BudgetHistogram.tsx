import type { BudgetSliderStats } from "@/lib/surveys/aggregate";

function StatTile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl px-3 py-3 text-center ${highlight ? "bg-gold/10" : "bg-surface"}`}>
      <p className="text-[11px] text-ink-muted mb-1">{label}</p>
      <p className={`font-display-num text-lg font-semibold ${highlight ? "text-gold" : "text-ink"}`}>{value}</p>
    </div>
  );
}

export default function BudgetHistogram({ stats }: { stats: BudgetSliderStats }) {
  if (stats.count === 0) {
    return <p className="text-xs text-ink-muted">回答がまだありません</p>;
  }

  const maxCount = Math.max(1, ...stats.buckets.map((b) => b.count));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        <StatTile label="平均" value={`¥${stats.mean.toLocaleString()}`} />
        <StatTile label="中央値" value={`¥${stats.median.toLocaleString()}`} />
        <StatTile label="おすすめ幹事予算" value={`¥${stats.mode.toLocaleString()}`} highlight />
      </div>

      <div className="flex flex-col gap-2.5">
        {stats.buckets.map((b) => (
          <div key={b.start} className="flex items-center gap-3 text-sm">
            <span className="w-20 shrink-0 truncate text-ink-secondary text-xs">{b.label}</span>
            <div className="flex-1 h-2.5 rounded-full bg-gold/10 overflow-hidden">
              <div
                className={`h-full rounded-full ${b.count === maxCount ? "bg-gold-gradient" : "bg-gold/30"}`}
                style={{ width: `${(b.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right font-display-num text-ink text-xs">{b.count}名</span>
          </div>
        ))}
      </div>
    </div>
  );
}
