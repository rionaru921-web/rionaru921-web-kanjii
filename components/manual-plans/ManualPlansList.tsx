"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatDateRange } from "@/lib/manual-plans/format";
import type { ManualPlan, ManualPlanStatus } from "@/lib/manual-plans/types";

const FILTERS: { value: "all" | ManualPlanStatus; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "draft", label: "進行中" },
  { value: "confirmed", label: "確定" },
  { value: "completed", label: "完了" },
  { value: "cancelled", label: "キャンセル" },
];

export default function ManualPlansList({ plans }: { plans: ManualPlan[] }) {
  const [filter, setFilter] = useState<"all" | ManualPlanStatus>("all");
  const filtered = filter === "all" ? plans : plans.filter((p) => p.status === filter);

  return (
    <div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              filter === f.value
                ? "bg-gold-gradient text-white"
                : "border border-gold/15 text-ink-secondary hover:border-gold/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-3 rounded-3xl bg-surface-tertiary shadow-warm">
          <CalendarPlus className="text-ink-muted" size={40} />
          <p className="text-ink-secondary">該当するプランがありません</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((plan) => (
            <Link
              key={plan.id}
              href={`/manual-plans/${plan.id}`}
              className="flex flex-col gap-2 rounded-3xl bg-surface-tertiary shadow-warm p-5 hover:shadow-warm-hover hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-ink truncate">{plan.title}</p>
                <StatusBadge status={plan.status} />
              </div>
              <p className="text-xs text-ink-muted">{formatDateRange(plan.event_date, plan.end_date)}</p>
              {plan.venue_name && <p className="text-xs text-ink-secondary truncate">{plan.venue_name}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
