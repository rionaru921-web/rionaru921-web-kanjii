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
  MessageCircle,
  CalendarPlus,
} from "lucide-react";
import type { ManualPlan } from "@/lib/manual-plans/types";

// The qrcode dependency pulled in by ShareQrModal is only needed once the
// user actually opens the QR modal — code-split it out of the main detail
// page bundle instead of loading it on every visit.
const ShareQrModal = dynamic(() => import("./ShareQrModal"), { ssr: false });

export default function PlanDetailActions({ plan }: { plan: ManualPlan }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  function handleLineShare() {
    const text = `幹事さんからのお知らせです\n\n${plan.title}\n${shareUrl}`;
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(lineUrl, "_blank");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        <Link
          href={`/manual-plans/${plan.id}/edit`}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 text-ink-secondary text-xs font-semibold py-2.5 hover:border-gold/40 hover:text-gold transition-colors"
        >
          <Pencil size={14} />
          編集
        </Link>
        <a
          href={`/api/manual-plans/${plan.id}/pdf`}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 text-ink-secondary text-xs font-semibold py-2.5 hover:border-gold/40 hover:text-gold transition-colors"
        >
          <FileDown size={14} />
          PDFで共有
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 text-ink-secondary text-xs font-semibold py-2.5 hover:border-gold/40 hover:text-gold transition-colors"
        >
          {copied ? <Check size={14} /> : <LinkIcon size={14} />}
          {copied ? "コピー済み" : "URLで共有"}
        </button>
        <button
          type="button"
          onClick={() => setQrOpen(true)}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 text-ink-secondary text-xs font-semibold py-2.5 hover:border-gold/40 hover:text-gold transition-colors"
        >
          <QrCode size={14} />
          QRで共有
        </button>
        <button
          type="button"
          onClick={handleLineShare}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-[#06C755]/30 text-[#06C755] text-xs font-semibold py-2.5 hover:border-[#06C755]/60 hover:bg-[#06C755]/5 transition-colors"
        >
          <MessageCircle size={14} />
          LINEで共有
        </button>
        <a
          href={`/api/manual-plans/${plan.id}/ics`}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 text-blue-600 text-xs font-semibold py-2.5 hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <CalendarPlus size={14} />
          カレンダーに追加
        </a>
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

      {qrOpen && <ShareQrModal open={qrOpen} onClose={() => setQrOpen(false)} url={shareUrl} title={plan.title} />}
    </div>
  );
}
