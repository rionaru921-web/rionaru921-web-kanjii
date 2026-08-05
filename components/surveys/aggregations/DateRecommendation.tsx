import { Trophy } from "lucide-react";
import StackedChoiceBar from "./StackedChoiceBar";
import type { DateRangeExtendedDateScore } from "@/lib/surveys/aggregate";

const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${d.getMonth() + 1}/${d.getDate()}(${WEEKDAY_JA[d.getDay()]})`;
}

function slotLabel(slot: DateRangeExtendedDateScore["slot"]): string {
  return slot === "lunch" ? " 昼" : slot === "dinner" ? " 夜" : "";
}

export default function DateRecommendation({ scores }: { scores: DateRangeExtendedDateScore[] }) {
  const answered = scores.filter((s) => s.total > 0);

  if (answered.length === 0) {
    return <p className="text-xs text-ink-muted">回答がまだありません</p>;
  }

  const top3 = answered.slice(0, 3);

  return (
    <div className="flex flex-col gap-3">
      {top3.map((item, i) => (
        <div
          key={`${item.date}-${item.slot ?? "single"}`}
          className={`rounded-xl border p-3 ${i === 0 ? "border-gold bg-gold/5" : "border-gold/15"}`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              {i === 0 && <Trophy size={14} className="text-gold shrink-0" />}
              {formatDate(item.date)}
              {slotLabel(item.slot)}
            </span>
            <span className="text-xs text-ink-secondary shrink-0">
              {item.attendable}/{item.total}人 参加可能
            </span>
          </div>
          <StackedChoiceBar breakdown={item.breakdown} />
        </div>
      ))}
    </div>
  );
}
