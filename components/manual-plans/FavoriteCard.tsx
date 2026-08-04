"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Loader2, Trash2, MapPin } from "lucide-react";
import type { ManualPlan } from "@/lib/manual-plans/types";

export default function FavoriteCard({ favorite }: { favorite: ManualPlan }) {
  const router = useRouter();
  const [using, setUsing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUse() {
    setUsing(true);
    setError(null);
    try {
      const res = await fetch(`/api/manual-plans/${favorite.id}/use-favorite`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "作成に失敗しました。");
      router.push(`/manual-plans/${data.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました。");
      setUsing(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/manual-plans/${favorite.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "削除に失敗しました。");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました。");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-surface-tertiary shadow-warm p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Bookmark size={14} className="text-gold shrink-0" />
          <p className="font-semibold text-ink truncate">{favorite.favorite_name || favorite.title}</p>
        </div>
      </div>
      {favorite.venue_name && (
        <p className="flex items-center gap-1 text-xs text-ink-secondary truncate">
          <MapPin size={12} className="shrink-0 text-ink-muted" />
          {favorite.venue_name}
        </p>
      )}
      {favorite.fee_amount != null && (
        <p className="text-xs text-ink-muted">会費目安: ¥{favorite.fee_amount.toLocaleString()}</p>
      )}

      <div className="flex items-center gap-2 mt-1">
        <button
          type="button"
          onClick={handleUse}
          disabled={using}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gold-gradient text-white text-xs font-semibold py-2.5 hover:brightness-110 transition-all shadow-gold disabled:opacity-50"
        >
          {using ? <Loader2 size={14} className="animate-spin" /> : null}
          {using ? "作成中..." : "このプランを使う"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="削除"
          className={`flex shrink-0 items-center justify-center min-h-[38px] min-w-[38px] rounded-xl border text-xs font-semibold transition-colors disabled:opacity-50 ${
            confirmDelete
              ? "border-vermilion/40 bg-vermilion/10 text-vermilion-text"
              : "border-gold/20 text-ink-secondary hover:border-vermilion/40 hover:text-vermilion-text"
          }`}
        >
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      </div>
      {confirmDelete && !deleting && (
        <p className="text-[11px] text-vermilion-text text-center">もう一度押すと削除します</p>
      )}
      {error && <p className="text-[11px] text-vermilion-text text-center">{error}</p>}
    </div>
  );
}
