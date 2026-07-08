import Link from "next/link";
import { Wine, Plane, ChevronRight, History as HistoryIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function HistoryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: history } = user
    ? await supabase
        .from("history")
        .select("id, type, title, event_date, created_at")
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <h1 className="font-serif font-bold text-2xl text-ink mb-1">履歴</h1>
      <p className="text-sm text-ink-secondary mb-6">
        保存した飲み会・旅行の記録を確認できます
      </p>

      {!history || history.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-3 rounded-3xl bg-surface-tertiary shadow-warm">
          <HistoryIcon className="text-ink-muted" size={40} />
          <p className="text-ink-secondary">まだ保存された履歴がありません</p>
          <p className="text-xs text-ink-muted">
            割り勘計算・費用分担の完了画面から「履歴に保存」すると、ここに表示されます
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((item) => {
            const Icon = item.type === "nomikai" ? Wine : Plane;
            return (
              <Link
                key={item.id}
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
                <ChevronRight size={16} className="text-ink-muted shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
