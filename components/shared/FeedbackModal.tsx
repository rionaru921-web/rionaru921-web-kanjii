"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Star } from "lucide-react";

interface FeedbackModalProps {
  onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (rating === 0) {
      setError("満足度を選択してください。");
      return;
    }
    if (!comment.trim()) {
      setError("コメントを入力してください。");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "送信に失敗しました。");

      setSent(true);
      setTimeout(onClose, 3000);
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
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full sm:max-w-md bg-surface-tertiary shadow-warm-hover rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-ink-muted transition-colors hover:text-ink"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>

          {sent ? (
            <div className="py-10 text-center">
              <p className="font-serif font-bold text-lg text-ink">ありがとうございました!</p>
              <p className="mt-2 text-sm text-ink-secondary">
                いただいたご意見は今後の改善に活用させていただきます。
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-serif font-bold text-lg text-ink">フィードバックを送る</h2>
              <p className="mt-1 text-sm text-ink-secondary">使いやすさや気づいた点を教えてください</p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink">満足度</label>
                  <div className="mt-2 flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        disabled={loading}
                        aria-label={`満足度 ${value}`}
                        className="p-1 disabled:opacity-50"
                      >
                        <Star
                          className={`h-7 w-7 transition-colors ${
                            value <= rating ? "text-gold fill-gold" : "text-ink/20"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink">コメント</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 2000))}
                    maxLength={2000}
                    rows={5}
                    disabled={loading}
                    className="mt-1.5 w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors focus:border-gold disabled:opacity-50"
                    placeholder="ご意見・ご要望をお聞かせください"
                  />
                  <p className="mt-1 text-right text-xs text-ink-muted">{comment.length}/2000</p>
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
                  送信する
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
