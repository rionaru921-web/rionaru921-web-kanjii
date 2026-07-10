"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus, ChevronDown, Users as UsersIcon } from "lucide-react";
import ShareStatusBadge from "./ShareStatusBadge";
import TimelineBadge from "./TimelineBadge";
import { formatDateRange } from "@/lib/manual-plans/format";
import { getTimelineStatus, type ManualPlan } from "@/lib/manual-plans/types";

export interface ManualPlanListItem extends ManualPlan {
  memberCount: number;
}

type Tab = "shared" | "draft";

const TABS: { value: Tab; label: string }[] = [
  { value: "shared", label: "共有中" },
  { value: "draft", label: "下書き" },
];

export default function ManualPlansList({ plans }: { plans: ManualPlanListItem[] }) {
  const [tab, setTab] = useState<Tab>("shared");
  const [showArchived, setShowArchived] = useState(false);

  const sharedCount = plans.filter((p) => p.is_shared).length;
  const draftCount = plans.length - sharedCount;

  const { visible, archived } = useMemo(() => {
    const tabPlans = plans.filter((p) => (tab === "shared" ? p.is_shared : !p.is_shared));
    const visible: ManualPlanListItem[] = [];
    const archived: ManualPlanListItem[] = [];
    for (const plan of tabPlans) {
      if (getTimelineStatus(plan) === "archived") {
        archived.push(plan);
      } else {
        visible.push(plan);
      }
    }
    return { visible, archived };
  }, [plans, tab]);

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              tab === t.value
                ? "bg-gold-gradient text-white"
                : "border border-gold/15 text-ink-secondary hover:border-gold/30"
            }`}
          >
            {t.label} ({t.value === "shared" ? sharedCount : draftCount})
          </button>
        ))}
      </div>

      {visible.length === 0 && archived.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-3 rounded-3xl bg-surface-tertiary shadow-warm">
          <CalendarPlus className="text-ink-muted" size={40} />
          <p className="text-ink-secondary">
            {tab === "shared" ? "共有中のプランがありません" : "下書きのプランがありません"}
          </p>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

function PlanCard({ plan }: { plan: ManualPlanListItem }) {
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
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="flex items-center gap-1 text-[11px] text-ink-muted">
            <UsersIcon size={12} />
            {plan.memberCount}
          </span>
          <ShareStatusBadge isShared={plan.is_shared} />
        </div>
      </div>
    </Link>
  );
}
