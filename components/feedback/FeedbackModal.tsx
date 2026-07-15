"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";

interface FeedbackModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: "bug", label: "バグ報告" },
  { value: "feature", label: "機能要望" },
  { value: "question", label: "使い方の質問" },
  { value: "other", label: "その他" },
] as const;

export default function FeedbackModal({ onClose, onSuccess }: FeedbackModalProps) {
  const [category, setCategory] = useState<string>(CATEGORIES[0].value);
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (content.trim().length < 10) {
      setError("内容は10文字以上でご入力ください。");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback/general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          content: content.trim(),
          email: email.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "送信に失敗しました。");

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full sm:max-w-md bg-surface-tertiary shadow-warm-hover rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="absolute right-4 top-4 rounded-full p-1.5 text-ink-muted transition-colors hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="font-serif font-bold text-lg text-ink">フィードバックを送る</h2>
          <p className="mt-1 text-sm text-ink-secondary">
            バグ報告・ご要望など、お気軽にお聞かせください
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">カテゴリ</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    disabled={loading}
                    className={`text-xs rounded-full px-3 py-1.5 border transition-colors disabled:opacity-50 ${
                      category === c.value
                        ? "bg-gold-gradient border-transparent text-white"
                        : "border-gold/15 text-ink-secondary hover:border-gold/40 hover:text-gold"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">内容</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 2000))}
                maxLength={2000}
                rows={5}
                disabled={loading}
                placeholder="ご意見・不具合の内容をご記入ください（10文字以上）"
                className="w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors focus:border-gold disabled:opacity-50"
              />
              <p className="mt-1 text-right text-xs text-ink-muted">{content.length}/2000</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                メールアドレス（任意・返信が必要な方）
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors focus:border-gold disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-vermilion/20 bg-vermilion/10 px-3 py-2.5 text-sm text-vermilion">
                {error}
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-gold/15 bg-surface-tertiary py-2.5 text-sm font-medium text-ink transition-colors hover:bg-gold/5 disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold-gradient py-2.5 text-sm font-semibold text-white shadow-gold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "送信中..." : "送信する"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
