"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildMonthGrid, isSameDay } from "@/lib/calendar/grid";
import { getHolidayName } from "@/lib/calendar/holidays";
import { toWareki } from "@/lib/calendar/wareki";
import type { CalendarMode, CalendarValue, HighlightedDate, CalendarSize } from "@/lib/calendar/types";

export interface UnifiedCalendarProps {
  mode: CalendarMode;
  value?: CalendarValue;
  onChange?: (v: CalendarValue) => void;

  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  highlightedDates?: HighlightedDate[];
  showTimeSelector?: boolean;
  timeStep?: number;

  showWareki?: boolean;
  showHolidays?: boolean;
  weekStartsOn?: 0 | 1;

  size?: CalendarSize;
  className?: string;
}

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

const CELL_SIZE: Record<CalendarSize, string> = {
  sm: "h-[44px] w-[44px]",
  md: "h-[52px] w-[52px]",
  lg: "h-[64px] w-[64px]",
};

function initialViewDate(value: CalendarValue | undefined): Date {
  if (value instanceof Date) return value;
  if (Array.isArray(value) && value.length > 0) return value[0];
  if (value && !(value instanceof Date) && "start" in value) return value.start;
  return new Date();
}

function isDisabled(date: Date, minDate?: Date, maxDate?: Date, disabledDates?: Date[]): boolean {
  if (minDate && date < stripTime(minDate)) return true;
  if (maxDate && date > stripTime(maxDate)) return true;
  if (disabledDates?.some((d) => isSameDay(d, date))) return true;
  return false;
}

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function withTimeOf(date: Date, reference: Date | null): Date {
  const next = new Date(date);
  if (reference) {
    next.setHours(reference.getHours(), reference.getMinutes(), 0, 0);
  }
  return next;
}

export default function UnifiedCalendar({
  mode,
  value = null,
  onChange,
  minDate,
  maxDate,
  disabledDates,
  highlightedDates,
  showTimeSelector = false,
  timeStep = 30,
  showWareki = true,
  showHolidays = true,
  weekStartsOn = 0,
  size = "md",
  className = "",
}: UnifiedCalendarProps) {
  const [viewDate, setViewDate] = useState(() => initialViewDate(value));
  const [direction, setDirection] = useState(0);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthKey = `${year}-${month}`;

  const grid = useMemo(() => buildMonthGrid(year, month, weekStartsOn), [year, month, weekStartsOn]);
  const today = useMemo(() => new Date(), []);

  const singleValue = value instanceof Date ? value : null;
  const multipleValue = Array.isArray(value) ? value : [];
  const rangeValue = value && !Array.isArray(value) && !(value instanceof Date) ? value : null;

  function changeMonth(delta: number) {
    setDirection(delta);
    setViewDate(new Date(year, month + delta, 1));
  }

  function handleDayClick(date: Date) {
    if (isDisabled(date, minDate, maxDate, disabledDates)) return;
    if (!onChange) return;

    if (mode === "single") {
      onChange(withTimeOf(date, singleValue));
      return;
    }

    if (mode === "multiple") {
      const exists = multipleValue.some((d) => isSameDay(d, date));
      onChange(exists ? multipleValue.filter((d) => !isSameDay(d, date)) : [...multipleValue, date]);
      return;
    }

    if (mode === "range") {
      if (!rangeValue || (rangeValue.start && rangeValue.end)) {
        onChange({ start: date, end: date });
        return;
      }
      const start = rangeValue.start;
      onChange(date < start ? { start: date, end: start } : { start, end: date });
      return;
    }
    // display mode: read-only, no selection
  }

  function handleTimeChange(hour: number, minute: number) {
    if (!onChange || mode !== "single") return;
    const base = singleValue ?? new Date();
    const next = new Date(base);
    next.setHours(hour, minute, 0, 0);
    onChange(next);
  }

  const selectedHour = singleValue?.getHours() ?? 19;
  const selectedMinute = singleValue?.getMinutes() ?? 0;
  const minuteOptions = Array.from({ length: Math.ceil(60 / timeStep) }, (_, i) => i * timeStep);

  return (
    <div className={`select-none ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          aria-label="前月"
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary hover:bg-gold/10 hover:text-gold transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex flex-col items-center overflow-hidden">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={monthKey}
              custom={direction}
              initial={{ x: direction >= 0 ? 24 : -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction >= 0 ? -24 : 24, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
            >
              <span className="font-serif font-bold text-ink">
                {year}年{month + 1}月
              </span>
              {showWareki && <span className="text-xs text-ink-muted">{toWareki(viewDate)}</span>}
            </motion.div>
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          aria-label="翌月"
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary hover:bg-gold/10 hover:text-gold transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={`flex items-center justify-center text-xs font-semibold py-1 ${
              i === 0 ? "text-gold" : i === 6 ? "text-gold/60" : "text-ink-secondary"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map(({ date, inCurrentMonth }) => {
          const disabled = isDisabled(date, minDate, maxDate, disabledDates);
          const isToday = isSameDay(date, today);
          const holidayName = showHolidays ? getHolidayName(date) : null;
          const highlight = highlightedDates?.find((h) => isSameDay(h.date, date));

          const selected =
            mode === "single"
              ? singleValue != null && isSameDay(singleValue, date)
              : mode === "multiple"
                ? multipleValue.some((d) => isSameDay(d, date))
                : mode === "range" && rangeValue
                  ? isSameDay(rangeValue.start, date) || isSameDay(rangeValue.end, date)
                  : false;

          const inRange =
            mode === "range" && rangeValue
              ? date > stripTime(rangeValue.start < rangeValue.end ? rangeValue.start : rangeValue.end) &&
                date < stripTime(rangeValue.start < rangeValue.end ? rangeValue.end : rangeValue.start)
              : false;

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => handleDayClick(date)}
              aria-label={`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`}
              aria-pressed={selected}
              className={`relative flex flex-col items-center justify-center rounded-lg ${CELL_SIZE[size]} text-sm transition-colors
                ${!inCurrentMonth ? "opacity-30" : ""}
                ${disabled ? "opacity-20 cursor-not-allowed" : "cursor-pointer"}
                ${selected ? "bg-gold-gradient text-white font-semibold" : inRange ? "bg-gold/15 text-ink" : "text-ink hover:bg-gold/5"}
              `}
            >
              <span>{date.getDate()}</span>
              {holidayName && !selected && (
                <span className="text-[9px] leading-none text-vermilion truncate max-w-full px-0.5">
                  {holidayName}
                </span>
              )}
              {isToday && !selected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-gold" aria-hidden />
              )}
              {highlight && (
                <span
                  className="absolute top-0.5 right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-gold px-0.5 text-[8px] text-white"
                  aria-hidden
                >
                  {highlight.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {showTimeSelector && mode === "single" && (
        <div className="mt-4 flex items-center justify-center gap-2 border-t border-gold/10 pt-4">
          <select
            value={selectedHour}
            onChange={(e) => handleTimeChange(Number(e.target.value), selectedMinute)}
            className="rounded-lg border border-gold/20 bg-surface px-2 py-1.5 text-sm text-ink outline-none focus:border-gold"
            aria-label="時"
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <span className="text-ink-secondary">:</span>
          <select
            value={selectedMinute}
            onChange={(e) => handleTimeChange(selectedHour, Number(e.target.value))}
            className="rounded-lg border border-gold/20 bg-surface px-2 py-1.5 text-sm text-ink outline-none focus:border-gold"
            aria-label="分"
          >
            {minuteOptions.map((m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
