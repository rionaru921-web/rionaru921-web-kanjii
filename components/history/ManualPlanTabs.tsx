"use client";

import { useState } from "react";
import Link from "next/link";
import { History as HistoryIcon, ChevronRight } from "lucide-react";
import TimelineBadge from "@/components/manual-plans/TimelineBadge";
import { getTimelineStatus } from "@/lib/manual-plans/types";

export interface ManualPlanTabItem {
  id: string;
  title: string;
  event_date: string | null;
  end_date: string | null;
  created_at: string;
}

type Tab = "inProgress" | "completed";

// Client Component so the tab selection can live in browser state — the RSC
// parent (app/(dashboard)/history/page.tsx) only ever splits the plans into
// inProgress/completed once per request via isCompletedPlan.
export default function ManualPlanTabs({
  inProgress,
  completed,
}: {
  inProgress: ManualPlanTabItem[];
  completed: ManualPlanTabItem[];
}) {
  const [tab, setTab] = useState<Tab>("inProgress");
  const items = tab === "inProgress" ? inProgress : completed;

  return (
    <div>
      <div className="inline-flex rounded-full bg-surface-tertiary p-1 shadow-warm mb-4">
        {(
          [
            { key: "inProgress", label: "進行中", count: inProgress.length },
            { key: "completed", label: "完了", count: completed.length },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-gold-gradient text-white shadow-gold" : "text-ink-secondary hover:text-gold"
            }`}
          >
            {t.label}
            <span
              className={`text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center ${
                tab === t.key ? "bg-white/20" : "bg-gold/10 text-gold"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-ink-muted text-center py-10">
          {tab === "inProgress" ? "進行中のプランはありません" : "完了したプランはまだありません"}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/manual-plans/${item.id}`}
              className="flex items-center gap-4 rounded-3xl bg-surface-tertiary shadow-warm p-4 hover:shadow-warm-hover hover:-translate-y-0.5 transition-all"
            >
              <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-gold/10 text-gold shrink-0">
                <HistoryIcon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink truncate">{item.title}</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {item.event_date
                    ? new Date(item.event_date).toLocaleDateString("ja-JP")
                    : new Date(item.created_at).toLocaleDateString("ja-JP")}
                </p>
              </div>
              <TimelineBadge status={getTimelineStatus(item)} />
              <ChevronRight size={16} className="text-ink-muted shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
