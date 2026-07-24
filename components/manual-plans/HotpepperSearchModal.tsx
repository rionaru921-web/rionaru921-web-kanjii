"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Loader2, UtensilsCrossed, MapPin } from "lucide-react";
import { HOTPEPPER_GENRES } from "@/lib/constants/genres";
import { HOTPEPPER_BUDGETS } from "@/lib/constants/budgets";
import type { HotpepperShop } from "@/lib/api/hotpepper";

interface HotpepperSearchModalProps {
  onClose: () => void;
  onSelect: (shop: HotpepperShop) => void;
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors focus:border-gold";

// Reuses the existing /api/hotpepper/search route (same one the AI 飲み会
// suggestion flow calls) rather than adding a parallel endpoint — it
// already supports keyword/genre/budget and has its own rate limiting and
// response caching, both of which a second manual-plans-only route would
// have had to reimplement.
export default function HotpepperSearchModal({ onClose, onSelect }: HotpepperSearchModalProps) {
  const [keyword, setKeyword] = useState("");
  const [genre, setGenre] = useState("");
  const [budget, setBudget] = useState("");
  const [shops, setShops] = useState<HotpepperShop[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!keyword.trim()) {
      setError("エリアやキーワードを入力してください。");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ keyword: keyword.trim(), count: "10" });
      if (genre) params.set("genre", genre);
      if (budget) params.set("budget", budget);

      const res = await fetch(`/api/hotpepper/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "検索に失敗しました。");
      setShops(data.shops ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "検索に失敗しました。");
      setShops(null);
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
          className="relative z-10 w-full sm:max-w-lg bg-surface-tertiary shadow-warm-hover rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-ink-muted transition-colors hover:text-ink"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="font-serif font-bold text-lg text-ink flex items-center gap-2">
            <Search className="h-5 w-5 text-gold" />
            ホットペッパーで店を探す
          </h2>

          <div className="mt-4 flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-ink">エリア・キーワード</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="例: 新橋 居酒屋"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-ink">ジャンル</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className={inputClass}
                >
                  <option value="">指定なし</option>
                  {HOTPEPPER_GENRES.map((g) => (
                    <option key={g.code} value={g.code}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">予算</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className={inputClass}
                >
                  <option value="">指定なし</option>
                  {HOTPEPPER_BUDGETS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-gold-gradient py-2.5 text-sm font-semibold text-white shadow-gold transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              検索する
            </button>

            {error && (
              <div className="rounded-xl border border-vermilion/20 bg-vermilion/10 px-3 py-2.5 text-sm text-vermilion-text">
                {error}
              </div>
            )}
          </div>

          {shops && (
            <div className="mt-5">
              <p className="text-xs text-ink-muted mb-2">検索結果({shops.length}件)</p>
              {shops.length === 0 ? (
                <p className="text-sm text-ink-secondary py-6 text-center">
                  条件に合うお店が見つかりませんでした。
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {shops.map((shop) => (
                    <div key={shop.id} className="flex gap-3 rounded-2xl border border-gold/15 p-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gold/10 flex items-center justify-center">
                        {shop.photos.small ? (
                          <Image
                            src={shop.photos.small}
                            alt={shop.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <UtensilsCrossed className="h-5 w-5 text-gold/40" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink truncate">{shop.name}</p>
                        <p className="text-xs text-ink-muted truncate">
                          {shop.genre.name} ・ {shop.budget.average || shop.budget.name}
                        </p>
                        <p className="text-xs text-ink-secondary truncate flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="shrink-0" />
                          {shop.address}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelect(shop)}
                        className="self-center shrink-0 rounded-xl border border-gold/30 text-gold text-xs font-semibold px-3 py-2 hover:bg-gold/5 transition-colors"
                      >
                        この店を選ぶ
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
