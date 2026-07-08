import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import EventPreview from "@/components/share/EventPreview";
import HistoryDetailActions from "@/components/history/HistoryDetailActions";
import type { HistoryRecord } from "@/lib/history/types";

export default async function HistoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: record } = user
    ? await supabase
        .from("history")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <Link
        href="/history"
        className="inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-gold transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        履歴一覧に戻る
      </Link>

      {record ? (
        <div className="flex flex-col gap-6">
          <EventPreview
            type={record.type}
            title={record.title}
            eventDate={record.event_date}
            payload={(record as HistoryRecord).payload}
          />
          <HistoryDetailActions record={record as HistoryRecord} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-3 rounded-3xl bg-surface-tertiary shadow-warm">
          <SearchX className="text-ink-muted" size={40} />
          <p className="text-ink-secondary">履歴が見つかりませんでした</p>
          <Link href="/history" className="text-gold text-sm underline underline-offset-4">
            履歴一覧に戻る
          </Link>
        </div>
      )}
    </main>
  );
}
