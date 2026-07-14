"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus, ChevronDown, Users as UsersIcon } from "lucide-react";
import TimelineBadge from "./TimelineBadge";
import { formatDateRange } from "@/lib/manual-plans/format";
import { getTimelineStatus, type ManualPlan } from "@/lib/manual-plans/types";
import { calculateAttendanceRate } from "@/lib/manual-plans/attendance-stats";

export interface ManualPlanListItem extends ManualPlan {
  memberCount: number;
  attendingCount: number;
}

export default function ManualPlansList({ plans }: { plans: ManualPlanListItem[] }) {
  const [showArchived, setShowArchived] = useState(false);

  const { visible, archived } = useMemo(() => {
    const visible: ManualPlanListItem[] = [];
    const archived: ManualPlanListItem[] = [];
    for (const plan of plans) {
      if (getTimelineStatus(plan) === "archived") {
        archived.push(plan);
      } else {
        visible.push(plan);
      }
    }
    return { visible, archived };
  }, [plans]);

  if (visible.length === 0 && archived.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 gap-3 rounded-3xl bg-surface-tertiary shadow-warm">
        <CalendarPlus className="text-ink-muted" size={40} />
        <p className="text-ink-secondary">まだプランがありません</p>
      </div>
    );
  }

  return (
    <div>
      {visible.length === 0 ? (
        <p className="text-sm text-ink-muted text-center py-6">表示できるプランがありません</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {visible.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-ink-secondary transition-colors mx-auto"
          >
            <ChevronDown
              size={14}
              className={`transition-transform ${showArchived ? "rotate-180" : ""}`}
            />
            過去のプランを表示 ({archived.length})
          </button>
          {showArchived && (
            <div className="grid sm:grid-cols-2 gap-4 mt-4 opacity-60">
              {archived.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan }: { plan: ManualPlanListItem }) {
  const { rate, attending, total } = calculateAttendanceRate(plan.attendingCount, plan.memberCount);
  return (
    <Link
      href={`/manual-plans/${plan.id}`}
      className="flex flex-col gap-2 rounded-3xl bg-surface-tertiary shadow-warm p-5 hover:shadow-warm-hover hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-ink truncate">{plan.title}</p>
        <TimelineBadge status={getTimelineStatus(plan)} />
      </div>
      <p className="text-xs text-ink-muted">{formatDateRange(plan.event_date, plan.end_date)}</p>
      <div className="flex items-center justify-between gap-2">
        {plan.venue_name ? (
          <p className="text-xs text-ink-secondary truncate">{plan.venue_name}</p>
        ) : (
          <span />
        )}
        <span className="flex items-center gap-1 text-[11px] text-ink-muted shrink-0">
          <UsersIcon size={12} />
          {rate === null ? "-" : `${attending}/${total}名 参加 (${rate}%)`}
        </span>
      </div>
    </Link>
  );
}
