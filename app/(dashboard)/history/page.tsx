import Link from "next/link";
import { Wine, Plane, ChevronRight, History as HistoryIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import TimelineBadge from "@/components/manual-plans/TimelineBadge";
import { getTimelineStatus } from "@/lib/manual-plans/types";
import type { RecentPlanItem } from "@/components/dashboard/RecentPlans";

export default async function HistoryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: history } = user
    ? await supabase
        .from("history")
        .select("id, type, title, event_date, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const { data: manualPlans } = user
    ? await supabase
        .from("manual_plans")
        .select("id, title, event_date, end_date, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  // "履歴を見る" covers both the warikan/travel calculator saves (history
  // table) and organizer plans (manual_plans) — see RecentPlans on the
  // dashboard, which already merges the same two sources for its preview.
  const items: RecentPlanItem[] = [
    ...(history ?? []).map((h) => ({ kind: "history" as const, ...h })),
    ...(manualPlans ?? []).map((m) => ({ kind: "manual" as const, ...m })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <h1 className="font-serif font-bold text-2xl text-ink mb-1">履歴</h1>
      <p className="text-sm text-ink-secondary mb-6">
        保存した飲み会・旅行の記録、作成したプランを確認できます
      </p>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-3 rounded-3xl bg-surface-tertiary shadow-warm">
          <HistoryIcon className="text-ink-muted" size={40} />
          <p className="text-ink-secondary">まだ履歴がありません。最初の幹事を始めましょう</p>
          <p className="text-xs text-ink-muted">
            割り勘計算・費用分担の完了画面から「履歴に保存」する、またはプランを作成すると、ここに表示されます
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
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
      )}
    </main>
  );
}
