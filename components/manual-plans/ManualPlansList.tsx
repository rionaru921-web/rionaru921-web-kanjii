"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, CalendarPlus, ChevronDown, Search, Users as UsersIcon } from "lucide-react";
import TimelineBadge from "./TimelineBadge";
import { formatDateRange } from "@/lib/manual-plans/format";
import { getTimelineStatus, type EventType, type ManualPlan } from "@/lib/manual-plans/types";
import { calculateAttendanceRate } from "@/lib/manual-plans/attendance-stats";
import { PLAN_TEMPLATES } from "@/lib/plan-templates";

export interface ManualPlanListItem extends ManualPlan {
  memberCount: number;
  attendingCount: number;
}

// "none" represents event_type === null (自由入力/その他扱いのプラン)。
// DB上のnullをURLパラメータで安全に表現するためのセンチネル。
const NONE_TYPE = "none";

const TYPE_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "すべて" },
  ...PLAN_TEMPLATES.filter((t): t is typeof t & { eventType: EventType } => t.eventType !== null).map(
    (t) => ({ value: t.eventType, label: t.label })
  ),
  { value: NONE_TYPE, label: "その他" },
];

type SortOrder = "desc" | "asc";

export default function ManualPlansList({ plans }: { plans: ManualPlanListItem[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const typeFilter = searchParams.get("type") ?? "all";
  const sortOrder: SortOrder = searchParams.get("sort") === "asc" ? "asc" : "desc";

  const [searchInput, setSearchInput] = useState(query);
  const [showArchived, setShowArchived] = useState(false);

  // URLが外部要因(戻る/進むボタン等)で変わったら入力欄も追従させる。
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // 入力のたびにURLを書き換えるとカクつくため300ms待ってから反映する。
  useEffect(() => {
    if (searchInput === query) return;
    const handle = setTimeout(() => {
      updateParams({ q: searchInput.trim() || null });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function updateParams(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const filtered = useMemo(() => {
    let result = plans;

    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || (p.venue_name ?? "").toLowerCase().includes(q)
      );
    }

    if (typeFilter === NONE_TYPE) {
      result = result.filter((p) => p.event_type === null);
    } else if (typeFilter !== "all") {
      result = result.filter((p) => p.event_type === typeFilter);
    }

    result = [...result].sort((a, b) => {
      const dateA = new Date(a.event_date ?? a.created_at).getTime();
      const dateB = new Date(b.event_date ?? b.created_at).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [plans, query, typeFilter, sortOrder]);

  const { visible, archived } = useMemo(() => {
    const visible: ManualPlanListItem[] = [];
    const archived: ManualPlanListItem[] = [];
    for (const plan of filtered) {
      if (getTimelineStatus(plan) === "archived") {
        archived.push(plan);
      } else {
        visible.push(plan);
      }
    }
    return { visible, archived };
  }, [filtered]);

  const isFiltering = query.trim() !== "" || typeFilter !== "all";

  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 gap-3 rounded-3xl bg-surface-tertiary shadow-warm">
        <CalendarPlus className="text-ink-muted" size={40} />
        <p className="text-ink-secondary">まだプランがありません</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" size={16} />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="タイトルや会場で検索"
            className="w-full rounded-full bg-surface-tertiary shadow-warm pl-10 pr-4 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-ink-muted"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => updateParams({ type: f.value === "all" ? null : f.value })}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                typeFilter === f.value
                  ? "bg-gold-gradient text-white shadow-gold"
                  : "bg-surface-tertiary text-ink-secondary shadow-warm hover:text-gold"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-muted">{filtered.length}件のプラン</span>
          <button
            type="button"
            onClick={() => updateParams({ sort: sortOrder === "desc" ? "asc" : null })}
            className="inline-flex items-center gap-1 text-xs font-medium text-ink-secondary hover:text-gold transition-colors"
          >
            <ArrowUpDown size={13} />
            {sortOrder === "desc" ? "新しい順" : "古い順"}
          </button>
        </div>
      </div>

      {visible.length === 0 && archived.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 gap-3 rounded-3xl bg-surface-tertiary shadow-warm">
          <Search className="text-ink-muted" size={32} />
          <p className="text-ink-secondary text-sm">該当するプランがありません</p>
          {isFiltering && <p className="text-xs text-ink-muted">検索条件やフィルターを変えてみてください</p>}
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
