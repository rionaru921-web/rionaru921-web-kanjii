"use client";

import { motion } from "framer-motion";
import { CalendarCheck } from "lucide-react";

// Mirrors two real features: UnifiedCalendar's wareki-aware date display
// (lib/calendar/wareki.ts) and MemberList's attendance count summary
// ("参加X人 / 不参加X人 / 未定X人 / 未回答X人"), using the same status
// colors as AttendanceStatusBadge.tsx.
const WEEK = [
  { label: "月", date: 17 },
  { label: "火", date: 18 },
  { label: "水", date: 19 },
  { label: "木", date: 20, selected: true },
  { label: "金", date: 21 },
  { label: "土", date: 22 },
  { label: "日", date: 23 },
];

const ATTENDANCE = [
  { label: "参加", count: 3, className: "text-emerald-600" },
  { label: "不参加", count: 0, className: "text-gray-500" },
  { label: "未定", count: 1, className: "text-orange-500" },
  { label: "未回答", count: 1, className: "text-ink-muted" },
];

export default function CalendarMockup() {
  return (
    <div className="rounded-2xl border border-gold/20 bg-surface-tertiary shadow-warm-hover p-6 max-w-md mx-auto">
      <div className="mb-4 flex items-center gap-2 border-b border-gold/10 pb-3">
        <CalendarCheck size={16} className="text-gold" />
        <span className="font-serif text-xs text-ink-muted">2026年8月20日(木)・令和8年</span>
      </div>

      <div className="flex justify-between gap-1.5">
        {WEEK.map((day, i) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-[10px] text-ink-muted">{day.label}</span>
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-serif ${
                day.selected
                  ? "bg-gold-gradient text-white font-bold"
                  : "text-ink-secondary"
              }`}
            >
              {day.date}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-gold/10 pt-3 text-xs">
        {ATTENDANCE.map((a) => (
          <span key={a.label} className={a.className}>
            {a.label} {a.count}人
          </span>
        ))}
      </div>
    </div>
  );
}
