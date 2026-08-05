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
  Lock,
  Mail,
} from "lucide-react";
import type { ManualPlan, ManualPlanMember } from "@/lib/manual-plans/types";
import { buildLineShareText } from "@/lib/manual-plans/format";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

// The qrcode dependency pulled in by ShareQrModal is only needed once the
// user actually opens the QR modal — code-split it out of the main detail
// page bundle instead of loading it on every visit.
const ShareQrModal = dynamic(() => import("./ShareQrModal"), { ssr: false });
const SaveFavoriteButton = dynamic(() => import("./SaveFavoriteButton"), { ssr: false });

export default function PlanDetailActions({
  plan,
  members,
  isCompleted,
}: {
  plan: ManualPlan;
  members: ManualPlanMember[];
  isCompleted: boolean;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [icsLoading, setIcsLoading] = useState(false);
  const [notifyConfirmOpen, setNotifyConfirmOpen] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyResult, setNotifyResult] = useState<{ ok: boolean; message: string } | null>(null);

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

  // These are plain <a href> navigations to server-generated files (PDF/ICS),
  // not fetches we can await — this timer is purely a visual "something is
  // happening" acknowledgment so the button doesn't look unresponsive while
  // the browser generates/downloads the file, not a real loading state.
  function handlePdfClick() {
    setPdfLoading(true);
    setTimeout(() => setPdfLoading(false), 1500);
  }

  function handleIcsClick() {
    setIcsLoading(true);
    setTimeout(() => setIcsLoading(false), 1500);
  }

  function handleLineShare() {
    const text = buildLineShareText(plan, members, shareUrl);
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(lineUrl, "_blank");
  }

  async function handleNotifyConfirmed() {
    setNotifyConfirmOpen(false);
    setNotifyLoading(true);
    setNotifyResult(null);
    try {
      const res = await fetch(`/api/manual-plans/${plan.id}/notify-confirmed`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "送信に失敗しました。");
      setNotifyResult({ ok: true, message: `${data.sent}名に確定メールを送信しました` });
    } catch (err) {
      setNotifyResult({ ok: false, message: err instanceof Error ? err.message : "送信に失敗しました。" });
    } finally {
      setNotifyLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {isCompleted ? (
          <span
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/10 text-ink-muted text-xs font-semibold py-2.5 cursor-not-allowed"
            title="このプランは完了しています"
          >
            <Lock size={14} />
            編集
          </span>
        ) : (
          <Link
            href={`/manual-plans/${plan.id}/edit`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 text-ink-secondary text-xs font-semibold py-2.5 hover:border-gold/40 hover:text-gold transition-colors"
          >
            <Pencil size={14} />
            編集
          </Link>
        )}
        <a
          href={`/api/manual-plans/${plan.id}/pdf`}
          onClick={handlePdfClick}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 text-ink-secondary text-xs font-semibold py-2.5 hover:border-gold/40 hover:text-gold transition-colors"
        >
          {pdfLoading ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
          {pdfLoading ? "生成中..." : "PDFで共有"}
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
          onClick={handleIcsClick}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 text-blue-600 text-xs font-semibold py-2.5 hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          {icsLoading ? <Loader2 size={14} className="animate-spin" /> : <CalendarPlus size={14} />}
          {icsLoading ? "生成中..." : "カレンダーに追加"}
        </a>
      </div>

      {isCompleted && (
        <p className="flex items-center justify-center gap-1.5 text-xs text-ink-muted">
          <Lock size={12} />
          このプランは完了しています。基本情報の編集はできません。
        </p>
      )}

      {plan.event_date && (
        <button
          type="button"
          onClick={() => setNotifyConfirmOpen(true)}
          disabled={notifyLoading}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 text-ink-secondary text-xs font-semibold py-2.5 hover:border-gold/40 hover:text-gold transition-colors disabled:opacity-50"
        >
          {notifyLoading ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
          {notifyLoading ? "送信中..." : "確定メールを参加者に送る"}
        </button>
      )}
      {notifyResult && (
        <p className={`text-[11px] text-center ${notifyResult.ok ? "text-ink-secondary" : "text-vermilion-text"}`}>
          {notifyResult.message}
        </p>
      )}

      {!plan.is_favorite && <SaveFavoriteButton planId={plan.id} defaultName={plan.title} />}

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className={`flex items-center justify-center gap-1.5 rounded-xl border text-xs font-semibold py-2.5 transition-colors disabled:opacity-50 ${
          confirmDelete
            ? "border-vermilion/40 bg-vermilion/10 text-vermilion-text"
            : "border-gold/20 text-ink-secondary hover:border-vermilion/40 hover:text-vermilion-text"
        }`}
      >
        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        {deleting ? "削除中..." : confirmDelete ? "本当に削除しますか？もう一度押してください" : "このプランを削除"}
      </button>
      {error && <p className="text-[11px] text-vermilion-text text-center">{error}</p>}

      {qrOpen && <ShareQrModal open={qrOpen} onClose={() => setQrOpen(false)} url={shareUrl} title={plan.title} />}

      {notifyConfirmOpen && (
        <ConfirmDialog
          title="確定メールを送信しますか？"
          message="メールアドレスが登録されている参加者に、日程・会場が確定した旨のお知らせメールを送信します。"
          confirmLabel="送信する"
          cancelLabel="キャンセル"
          onConfirm={handleNotifyConfirmed}
          onCancel={() => setNotifyConfirmOpen(false)}
        />
      )}
    </div>
  );
}
