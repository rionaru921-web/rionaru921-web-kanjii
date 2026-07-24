"use client";

import { useEffect, useState } from "react";
import { X, Copy, Check, Loader2, AlertTriangle } from "lucide-react";
import QRCodeDisplay from "./QRCodeDisplay";
import ShareButtons from "./ShareButtons";
import type { HistoryPayload, HistoryType } from "@/lib/history/types";

type ExpiryOption = "7" | "30" | "never";

const EXPIRY_OPTIONS: { value: ExpiryOption; label: string }[] = [
  { value: "7", label: "7日間" },
  { value: "30", label: "30日間" },
  { value: "never", label: "無期限" },
];

export default function ShareModal({
  open,
  onClose,
  historyType,
  title,
  eventDate,
  payload,
  historyId: initialHistoryId,
}: {
  open: boolean;
  onClose: () => void;
  historyType: HistoryType;
  title: string;
  eventDate?: string;
  payload: HistoryPayload;
  historyId?: string;
}) {
  const [historyId, setHistoryId] = useState<string | undefined>(initialHistoryId);
  const [expiry, setExpiry] = useState<ExpiryOption>("30");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    createLink();
    // Re-create whenever the modal opens or the expiry choice changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, expiry]);

  async function ensureHistoryId(): Promise<string> {
    if (historyId) return historyId;
    const res = await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: historyType, title, eventDate, payload }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "履歴の保存に失敗しました。");
    setHistoryId(data.id);
    return data.id;
  }

  async function createLink() {
    setLoading(true);
    setError(null);
    try {
      const id = await ensureHistoryId();
      const res = await fetch("/api/share/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          historyType,
          historyId: id,
          expiresInDays: expiry === "never" ? undefined : Number(expiry),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "共有リンクの作成に失敗しました。");
      setShareUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "共有リンクの作成に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-sm bg-surface-tertiary shadow-warm-hover rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif font-bold text-lg text-ink">共有</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink transition-colors"
            aria-label="閉じる"
          >
            <X size={20} />
          </button>
        </div>

        {loading && !shareUrl && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 size={28} className="text-gold animate-spin" />
            <p className="text-sm text-ink-secondary">共有リンクを作成中...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-xs text-vermilion-text bg-vermilion/10 border border-vermilion/20 rounded-xl px-3 py-2.5 mb-4">
            <AlertTriangle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        {shareUrl && (
          <div className="flex flex-col gap-5">
            <div className="flex justify-center">
              <QRCodeDisplay value={shareUrl} size={160} />
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-gold/15 bg-surface-tertiary px-3 py-2.5">
              <span className="flex-1 text-xs text-ink-secondary truncate">{shareUrl}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-1 text-xs font-semibold text-gold hover:brightness-125"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "コピー済み" : "コピー"}
              </button>
            </div>

            <ShareButtons url={shareUrl} title={title} />

            <div>
              <p className="text-xs text-ink-secondary mb-2">有効期限</p>
              <div className="grid grid-cols-3 gap-2">
                {EXPIRY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setExpiry(opt.value)}
                    disabled={loading}
                    className={`rounded-xl px-2 py-2 text-xs font-semibold border transition-colors disabled:opacity-50 ${
                      expiry === opt.value
                        ? "bg-gold-gradient border-transparent text-white"
                        : "border-gold/15 text-ink-secondary hover:border-gold/30"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
