import Link from "next/link";
import { Wine, Plane, History as HistoryIcon, ChevronRight } from "lucide-react";
import TimelineBadge from "@/components/manual-plans/TimelineBadge";
import { getTimelineStatus } from "@/lib/manual-plans/types";
import type { HistoryType } from "@/lib/history/types";

interface RecentHistoryItem {
  kind: "history";
  id: string;
  type: HistoryType;
  title: string;
  event_date: string | null;
  created_at: string;
}

interface RecentManualItem {
  kind: "manual";
  id: string;
  title: string;
  event_date: string | null;
  end_date: string | null;
  created_at: string;
}

export type RecentPlanItem = RecentHistoryItem | RecentManualItem;

export default function RecentPlans({ records }: { records: RecentPlanItem[] }) {
  return (
    <section className="animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
      <h2 className="font-serif font-bold text-lg text-ink mb-4">🕐 直近の履歴</h2>
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-14 gap-3 rounded-3xl bg-surface-tertiary shadow-warm">
          <HistoryIcon className="text-ink-muted" size={32} />
          <p className="text-ink-secondary text-sm">まだプランがありません。最初のプランを作ってみましょう!</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {records.map((item) => {
              if (item.kind === "manual") {
                return (
                  <Link
                    key={`manual-${item.id}`}
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
                );
              }

              const Icon = item.type === "nomikai" ? Wine : Plane;
              const typeLabel = item.type === "nomikai" ? "飲み会" : "旅行";
              return (
                <Link
                  key={`history-${item.id}`}
                  href={`/history/${item.id}`}
                  className="flex items-center gap-4 rounded-3xl bg-surface-tertiary shadow-warm p-4 hover:shadow-warm-hover hover:-translate-y-0.5 transition-all"
                >
                  <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-gold/10 text-gold shrink-0">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink truncate">{item.title}</p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {item.event_date ?? new Date(item.created_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-gold bg-gold/10 rounded-full px-2.5 py-1 shrink-0">
                    {typeLabel}
                  </span>
                  <ChevronRight size={16} className="text-ink-muted shrink-0" />
                </Link>
              );
            })}
          </div>
          <Link
            href="/history"
            className="inline-block mt-4 text-sm font-medium text-gold hover:text-gold-deep transition-colors"
          >
            すべての履歴を見る →
          </Link>
        </>
      )}
    </section>
  );
}
