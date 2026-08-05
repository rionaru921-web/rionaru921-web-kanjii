"use client";

import { useState } from "react";
import { Plus, X, CalendarDays } from "lucide-react";
import type { OptionalQuestion } from "@/lib/surveys/types";

export default function DateRangeExtendedConfig({
  onAdd,
  disabled,
}: {
  onAdd: (question: OptionalQuestion) => void;
  disabled?: boolean;
}) {
  const [label, setLabel] = useState("日程調整(4段階)");
  const [dates, setDates] = useState<string[]>([]);
  const [draftDate, setDraftDate] = useState("");
  const [useTimeSlots, setUseTimeSlots] = useState(true);

  function addDate() {
    if (!draftDate || dates.includes(draftDate)) return;
    setDates([...dates, draftDate].sort());
    setDraftDate("");
  }

  function removeDate(date: string) {
    setDates(dates.filter((d) => d !== date));
  }

  function handleAdd() {
    if (!label.trim() || dates.length === 0) return;
    onAdd({
      id: `custom_${Date.now()}`,
      label: label.trim(),
      type: "date_range_extended",
      dateCandidates: dates,
      useTimeSlots,
    });
    setDates([]);
    setLabel("日程調整(4段階)");
  }

  return (
    <div className="rounded-xl border border-gold/10 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-medium text-ink">
        <CalendarDays size={16} className="text-gold" />
        日程調整(◎◯△×の4段階)を追加
      </div>

      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        disabled={disabled}
        maxLength={100}
        placeholder="質問文"
        className="w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50"
      />

      {dates.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {dates.map((d) => (
            <span
              key={d}
              className="flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/5 px-3 py-1.5 text-xs text-ink"
            >
              {d}
              <button
                type="button"
                onClick={() => removeDate(d)}
                disabled={disabled}
                aria-label={`${d}を削除`}
                className="flex h-4 w-4 items-center justify-center text-ink-muted hover:text-vermilion-text"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="date"
          value={draftDate}
          onChange={(e) => setDraftDate(e.target.value)}
          disabled={disabled}
          className="flex-1 min-w-0 rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50"
        />
        <button
          type="button"
          onClick={addDate}
          disabled={disabled || !draftDate}
          aria-label="候補日を追加"
          className="flex shrink-0 items-center justify-center min-h-[44px] min-w-[44px] rounded-xl border border-gold/20 text-gold hover:bg-gold/5 transition-colors disabled:opacity-40"
        >
          <Plus size={18} />
        </button>
      </div>

      <label className="flex items-center gap-2 text-xs text-ink-secondary cursor-pointer">
        <input
          type="checkbox"
          checked={useTimeSlots}
          onChange={(e) => setUseTimeSlots(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 accent-gold"
        />
        昼・夜を分けて聞く
      </label>

      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled || !label.trim() || dates.length === 0}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 text-sm font-medium text-gold py-2 hover:bg-gold/5 transition-colors disabled:opacity-50"
      >
        <Plus size={14} />
        この質問を追加
      </button>
    </div>
  );
}
