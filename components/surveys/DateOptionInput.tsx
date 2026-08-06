"use client";

import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import type { DateOption } from "@/lib/surveys/types";
import { formatDateOptionLabel } from "@/lib/surveys/format";

const TIME_SLOTS = ["昼", "夜", "その他"];

export default function DateOptionInput({
  values,
  onChange,
  disabled,
}: {
  values: DateOption[];
  onChange: (values: DateOption[]) => void;
  disabled?: boolean;
}) {
  const [draftDate, setDraftDate] = useState("");
  const [draftSlot, setDraftSlot] = useState(TIME_SLOTS[1]);
  const containerRef = useRef<HTMLDivElement>(null);

  function addOption() {
    if (!draftDate) return;
    if (values.some((v) => v.date === draftDate && v.time_slot === draftSlot)) return;
    onChange([...values, { date: draftDate, time_slot: draftSlot }]);
    setDraftDate("");
  }

  function removeOption(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  // 日付→時間帯ボタンの間のフォーカス移動では追加しない(選び終わる前に
  // デフォルト枠で確定してしまうため)。ウィジェット全体からフォーカスが
  // 外れた時だけ、入力済みの下書きを「＋」代わりに自動確定する。
  function handleContainerBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (containerRef.current?.contains(e.relatedTarget as Node | null)) return;
    addOption();
  }

  return (
    <div ref={containerRef} onBlur={handleContainerBlur} className="flex flex-col gap-2">
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((opt, i) => (
            <span
              key={`${opt.date}-${opt.time_slot}-${i}`}
              className="flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/5 px-3 py-1.5 text-sm text-ink"
            >
              {formatDateOptionLabel(opt)}
              <button
                type="button"
                onClick={() => removeOption(i)}
                disabled={disabled}
                className="flex h-4 w-4 items-center justify-center text-ink-muted hover:text-vermilion-text"
                aria-label="この日程候補を削除"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="date"
          value={draftDate}
          onChange={(e) => setDraftDate(e.target.value)}
          disabled={disabled}
          className="w-full sm:flex-1 min-w-0 rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50"
        />
        <div className="flex items-center gap-2">
          <div className="flex flex-1 sm:flex-none gap-1">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setDraftSlot(slot)}
                disabled={disabled}
                className={`flex-1 sm:flex-none rounded-xl px-3 py-2.5 text-sm font-medium border transition-colors disabled:opacity-50 ${
                  draftSlot === slot
                    ? "bg-gold-gradient border-transparent text-white"
                    : "border-gold/15 text-ink-secondary hover:border-gold/30"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            disabled={disabled || !draftDate}
            className="flex shrink-0 items-center justify-center min-h-[44px] min-w-[44px] rounded-xl border border-gold/20 text-gold hover:bg-gold/5 transition-colors disabled:opacity-40"
            aria-label="日程候補を追加"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
