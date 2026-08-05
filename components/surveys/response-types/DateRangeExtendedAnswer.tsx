"use client";

import { DATE_CHOICE_LEVELS, type DateChoiceLevel, type DateRangeExtendedAnswer as DateRangeExtendedValue } from "@/lib/surveys/types";

const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${d.getMonth() + 1}/${d.getDate()}(${WEEKDAY_JA[d.getDay()]})`;
}

function ChoiceButtons({
  value,
  onChange,
  disabled,
  ariaLabelPrefix,
}: {
  value: DateChoiceLevel | undefined;
  onChange: (v: DateChoiceLevel) => void;
  disabled?: boolean;
  ariaLabelPrefix: string;
}) {
  return (
    <div className="flex gap-1.5">
      {DATE_CHOICE_LEVELS.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onChange(c.value)}
          disabled={disabled}
          aria-label={`${ariaLabelPrefix}: ${c.label}`}
          aria-pressed={value === c.value}
          className={`w-10 h-10 shrink-0 rounded-xl text-lg font-bold border transition-colors disabled:opacity-50 ${
            value === c.value
              ? `${c.colorClass} bg-current/10 border-current`
              : "text-ink-tertiary border-gold/15 hover:border-gold/30"
          }`}
        >
          {c.symbol}
        </button>
      ))}
    </div>
  );
}

export default function DateRangeExtendedAnswer({
  dateCandidates,
  useTimeSlots,
  value,
  onChange,
  disabled,
}: {
  dateCandidates: string[];
  useTimeSlots: boolean;
  value: DateRangeExtendedValue;
  onChange: (value: DateRangeExtendedValue) => void;
  disabled?: boolean;
}) {
  function setLevel(date: string, slot: "lunch" | "dinner" | null, level: DateChoiceLevel) {
    if (!slot) {
      onChange({ ...value, [date]: level });
      return;
    }
    const current = value[date];
    const currentObj = current && typeof current === "object" ? current : {};
    onChange({ ...value, [date]: { ...currentObj, [slot]: level } });
  }

  return (
    <div className="flex flex-col gap-3">
      {dateCandidates.map((date) => {
        const current = value[date];
        const dateLabel = formatDate(date);
        return (
          <div key={date} className="rounded-xl border border-gold/10 px-3 py-3">
            <p className="text-sm font-medium text-ink mb-2">{dateLabel}</p>
            {useTimeSlots ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-ink-secondary shrink-0">昼(11-14時)</span>
                  <ChoiceButtons
                    value={current && typeof current === "object" ? current.lunch : undefined}
                    onChange={(v) => setLevel(date, "lunch", v)}
                    disabled={disabled}
                    ariaLabelPrefix={`${dateLabel} 昼`}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-ink-secondary shrink-0">夜(17-21時)</span>
                  <ChoiceButtons
                    value={current && typeof current === "object" ? current.dinner : undefined}
                    onChange={(v) => setLevel(date, "dinner", v)}
                    disabled={disabled}
                    ariaLabelPrefix={`${dateLabel} 夜`}
                  />
                </div>
              </div>
            ) : (
              <ChoiceButtons
                value={typeof current === "string" ? current : undefined}
                onChange={(v) => setLevel(date, null, v)}
                disabled={disabled}
                ariaLabelPrefix={dateLabel}
              />
            )}
          </div>
        );
      })}
      <div className="flex flex-wrap gap-3 text-[11px] text-ink-muted">
        {DATE_CHOICE_LEVELS.map((c) => (
          <span key={c.value} className="flex items-center gap-1">
            <span className={`${c.colorClass} font-bold`}>{c.symbol}</span>
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
