"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Bookmark, Loader2, Check } from "lucide-react";

export default function SaveFavoriteButton({ planId, defaultName }: { planId: string; defaultName: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  function handleOpen() {
    setName(defaultName);
    setError(null);
    setOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      setError("名前を入力してください。");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/manual-plans/${planId}/save-favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favoriteName: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "保存に失敗しました。");
      setOpen(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 text-ink-secondary text-xs font-semibold py-2.5 hover:border-gold/40 hover:text-gold transition-colors"
      >
        {saved ? <Check size={14} /> : <Bookmark size={14} />}
        {saved ? "保存しました" : "よく使うプランとして保存"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70"
            onClick={() => !saving && setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full sm:max-w-sm bg-surface-tertiary shadow-warm-hover rounded-t-3xl sm:rounded-3xl p-6"
            >
              <h3 className="font-serif font-bold text-lg text-ink">よく使うプランとして保存</h3>
              <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
                会場・会費・割り方などの内容を保存します。日時と参加者は含まれません。
              </p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
                autoFocus
                maxLength={60}
                placeholder="例: 月次飲み会"
                className="mt-4 w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50"
              />
              {error && <p className="mt-2 text-xs text-vermilion-text">{error}</p>}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-gold/15 bg-surface-tertiary py-2.5 text-sm font-medium text-ink transition-colors hover:bg-gold/5 disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gold-gradient py-2.5 text-sm font-semibold text-white shadow-gold transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                  {saving ? "保存中..." : "保存する"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
