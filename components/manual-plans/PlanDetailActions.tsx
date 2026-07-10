"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Trash2,
  Loader2,
  FileDown,
  Link as LinkIcon,
  QrCode,
  Check,
  Globe,
} from "lucide-react";
import type { ManualPlan } from "@/lib/manual-plans/types";

// The qrcode dependency pulled in by ShareQrModal is only needed once the
// user actually opens the QR modal — code-split it out of the main detail
// page bundle instead of loading it on every visit.
const ShareQrModal = dynamic(() => import("./ShareQrModal"), { ssr: false });

const disabledButtonClass =
  "flex items-center justify-center gap-1.5 rounded-xl border border-gold/10 text-ink-muted/50 text-xs font-semibold py-2.5 cursor-not-allowed opacity-60";
const enabledButtonClass =
  "flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 text-ink-secondary text-xs font-semibold py-2.5 hover:border-gold/40 hover:text-gold transition-colors";

export default function PlanDetailActions({ plan }: { plan: ManualPlan }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(plan.is_shared);
  const [sharing, setSharing] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/plan/${plan.share_token}`
      : `/share/plan/${plan.share_token}`;

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/manual-plans/${plan.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "削除に失敗しました。");
      }
      router.push("/manual-plans");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました。");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShareToggle(nextShared: boolean) {
    setSharing(true);
    setError(null);
    try {
      const res = await fetch(`/api/manual-plans/${plan.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_shared: nextShared }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "共有状態の更新に失敗しました。");
      }
      setIsShared(nextShared);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "共有状態の更新に失敗しました。");
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {!isShared && (
        <button
          type="button"
          onClick={() => handleShareToggle(true)}
          disabled={sharing}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-gold-gradient py-3 text-sm font-semibold text-white shadow-gold transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {sharing ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
          共有を開始する
        </button>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Link
          href={`/manual-plans/${plan.id}/edit`}
          className={enabledButtonClass}
        >
          <Pencil size={14} />
          編集
        </Link>

        {isShared ? (
          <a href={`/api/manual-plans/${plan.id}/pdf`} className={enabledButtonClass}>
            <FileDown size={14} />
            PDFで共有
          </a>
        ) : (
          <button type="button" disabled title="共有を開始してください" className={disabledButtonClass}>
            <FileDown size={14} />
            PDFで共有
          </button>
        )}

        {isShared ? (
          <button type="button" onClick={handleCopy} className={enabledButtonClass}>
            {copied ? <Check size={14} /> : <LinkIcon size={14} />}
            {copied ? "コピー済み" : "URLで共有"}
          </button>
        ) : (
          <button type="button" disabled title="共有を開始してください" className={disabledButtonClass}>
            <LinkIcon size={14} />
            URLで共有
          </button>
        )}

        {isShared ? (
          <button type="button" onClick={() => setQrOpen(true)} className={enabledButtonClass}>
            <QrCode size={14} />
            QRで共有
          </button>
        ) : (
          <button type="button" disabled title="共有を開始してください" className={disabledButtonClass}>
            <QrCode size={14} />
            QRで共有
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className={`flex items-center justify-center gap-1.5 rounded-xl border text-xs font-semibold py-2.5 transition-colors disabled:opacity-60 ${
          confirmDelete
            ? "border-vermilion/40 bg-vermilion/10 text-vermilion"
            : "border-gold/20 text-ink-secondary hover:border-vermilion/40 hover:text-vermilion"
        }`}
      >
        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        {deleting ? "削除中..." : confirmDelete ? "本当に削除しますか？もう一度押してください" : "このプランを削除"}
      </button>
      {error && <p className="text-[11px] text-vermilion text-center">{error}</p>}

      {isShared && (
        <button
          type="button"
          onClick={() => handleShareToggle(false)}
          disabled={sharing}
          className="text-[11px] text-ink-muted hover:text-ink-secondary hover:underline underline-offset-2 transition-colors self-center disabled:opacity-60"
        >
          共有を停止する
        </button>
      )}

      {qrOpen && <ShareQrModal open={qrOpen} onClose={() => setQrOpen(false)} url={shareUrl} title={plan.title} />}
    </div>
  );
}
