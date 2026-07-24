"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Trash2, Loader2 } from "lucide-react";
import ShareModal from "@/components/share/ShareModal";
import type { HistoryRecord } from "@/lib/history/types";

// @react-pdf/renderer pulls in browser-only APIs; rendering it during SSR of
// this client component crashes the page. ssr:false defers it to the client.
const PDFPreviewButton = dynamic(() => import("@/components/pdf/PDFPreviewButton"), {
  ssr: false,
});

export default function HistoryDetailActions({ record }: { record: HistoryRecord }) {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filename = `KanjiLabo_${record.title}_${record.created_at.slice(0, 10)}.pdf`;

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/history/${record.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "削除に失敗しました。");
      }
      router.push("/history");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました。");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {record.payload.kind === "nomikai" ? (
          <PDFPreviewButton kind="nomikai" data={record.payload.pdf} filename={filename} />
        ) : (
          <PDFPreviewButton kind="travel" data={record.payload.pdf} filename={filename} />
        )}
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-gold-gradient text-white font-semibold text-sm py-2.5 hover:brightness-110 transition-all"
        >
          共有リンクを作成
        </button>
      </div>

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className={`flex items-center justify-center gap-1.5 rounded-xl border text-xs font-semibold py-2.5 transition-colors disabled:opacity-60 ${
          confirmDelete
            ? "border-vermilion/40 bg-vermilion/10 text-vermilion-text"
            : "border-gold/20 text-ink-secondary hover:border-vermilion/40 hover:text-vermilion-text"
        }`}
      >
        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        {deleting ? "削除中..." : confirmDelete ? "本当に削除しますか？もう一度押してください" : "この履歴を削除"}
      </button>
      {error && <p className="text-[11px] text-vermilion-text text-center">{error}</p>}

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        historyType={record.type}
        title={record.title}
        eventDate={record.event_date ?? undefined}
        payload={record.payload}
        historyId={record.id}
      />
    </div>
  );
}
