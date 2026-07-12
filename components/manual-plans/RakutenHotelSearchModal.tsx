"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Loader2, Hotel, MapPin, Star, MapPinned } from "lucide-react";
import type { RakutenHotel } from "@/lib/api/rakuten";
import { RAKUTEN_PREFECTURES } from "@/lib/manual-plans/rakuten-areas";

interface RakutenHotelSearchModalProps {
  onClose: () => void;
  onSelect: (hotel: RakutenHotel) => void;
}

type SearchTab = "keyword" | "area";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors focus:border-gold";

const tabButtonClass = (active: boolean) =>
  `flex-1 flex items-center justify-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
    active ? "border-gold text-gold" : "border-transparent text-ink-muted hover:text-ink"
  }`;

// Same pattern as HotpepperSearchModal, but for lodging (via
// /api/rakuten/hotels, backed by 楽天トラベル SimpleHotelSearch) rather than
// restaurants — used for the 旅行 use case alongside the 飲み会 one.
//
// Two search modes because keyword search alone requires the user to
// already know a place name. Area mode lets them pick a prefecture (and
// optionally a well-known city/spot) instead. The prefecture selection
// sends the API's middleClassCode; the API route falls back to a plain
// keyword search on the prefecture name if that code turns out to be wrong
// or returns nothing (the code list isn't verified against the live API).
// City selection is intentionally keyword-only (never a smallClassCode) —
// see lib/manual-plans/rakuten-areas.ts for why.
export default function RakutenHotelSearchModal({ onClose, onSelect }: RakutenHotelSearchModalProps) {
  const [tab, setTab] = useState<SearchTab>("keyword");

  const [keyword, setKeyword] = useState("");
  const [prefectureCode, setPrefectureCode] = useState("");
  const [city, setCity] = useState("");

  const [hotels, setHotels] = useState<RakutenHotel[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPrefecture = useMemo(
    () => RAKUTEN_PREFECTURES.find((p) => p.code === prefectureCode) ?? null,
    [prefectureCode]
  );

  function handlePrefectureChange(code: string) {
    setPrefectureCode(code);
    setCity("");
  }

  async function runSearch(params: URLSearchParams) {
    setLoading(true);
    setError(null);
    try {
      params.set("hits", "10");
      const res = await fetch(`/api/rakuten/hotels?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "検索に失敗しました。");
      setHotels(data.hotels ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "検索に失敗しました。");
      setHotels(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleKeywordSearch() {
    if (!keyword.trim()) {
      setError("エリアやキーワードを入力してください。");
      return;
    }
    await runSearch(new URLSearchParams({ keyword: keyword.trim() }));
  }

  async function handleAreaSearch() {
    if (!selectedPrefecture) {
      setError("都道府県を選択してください。");
      return;
    }

    if (city) {
      await runSearch(new URLSearchParams({ keyword: `${selectedPrefecture.name} ${city}` }));
      return;
    }

    await runSearch(
      new URLSearchParams({
        middleClassCode: selectedPrefecture.code,
        areaLabel: selectedPrefecture.name,
      })
    );
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
            <Hotel className="h-5 w-5 text-gold" />
            宿泊施設を探す
          </h2>

          <div className="mt-4 flex border-b border-gold/15">
            <button type="button" onClick={() => setTab("keyword")} className={tabButtonClass(tab === "keyword")}>
              <Search className="h-4 w-4" />
              キーワードで検索
            </button>
            <button type="button" onClick={() => setTab("area")} className={tabButtonClass(tab === "area")}>
              <MapPinned className="h-4 w-4" />
              エリアで検索
            </button>
          </div>

          {tab === "keyword" ? (
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-ink">エリア・キーワード</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="例: 箱根、京都、新宿の温泉、部屋食"
                  className={inputClass}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleKeywordSearch();
                    }
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleKeywordSearch}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-gold-gradient py-2.5 text-sm font-semibold text-white shadow-gold transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                検索する
              </button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-ink">都道府県</label>
                  <select
                    value={prefectureCode}
                    onChange={(e) => handlePrefectureChange(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">選択してください</option>
                    {RAKUTEN_PREFECTURES.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink">市区町村・エリア</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!selectedPrefecture?.cities?.length}
                    className={inputClass}
                  >
                    <option value="">指定なし</option>
                    {selectedPrefecture?.cities?.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAreaSearch}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-gold-gradient py-2.5 text-sm font-semibold text-white shadow-gold transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                検索する
              </button>
            </div>
          )}

          {error && (
            <div className="mt-3 rounded-xl border border-vermilion/20 bg-vermilion/10 px-3 py-2.5 text-sm text-vermilion">
              {error}
            </div>
          )}

          {hotels && (
            <div className="mt-5">
              <p className="text-xs text-ink-muted mb-2">検索結果({hotels.length}件)</p>
              {hotels.length === 0 ? (
                <p className="text-sm text-ink-secondary py-6 text-center">
                  条件に合う宿泊施設が見つかりませんでした。
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {hotels.map((hotel) => (
                    <div key={hotel.hotelNo} className="flex gap-3 rounded-2xl border border-gold/15 p-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gold/10 flex items-center justify-center">
                        {hotel.hotelThumbnailUrl ? (
                          <Image
                            src={hotel.hotelThumbnailUrl}
                            alt={hotel.hotelName}
                            fill
                            sizes="64px"
                            className="object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <Hotel className="h-5 w-5 text-gold/40" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink truncate">{hotel.hotelName}</p>
                        {hotel.reviewAverage > 0 && (
                          <p className="text-xs text-ink-muted truncate flex items-center gap-1">
                            <Star size={11} className="shrink-0 fill-gold text-gold" />
                            {hotel.reviewAverage.toFixed(2)} ({hotel.reviewCount}件)
                            {hotel.hotelMinCharge > 0 && ` ・ ${hotel.hotelMinCharge.toLocaleString()}円〜`}
                          </p>
                        )}
                        <p className="text-xs text-ink-secondary truncate flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="shrink-0" />
                          {[hotel.address1, hotel.address2].filter(Boolean).join("")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelect(hotel)}
                        className="self-center shrink-0 rounded-xl border border-gold/30 text-gold text-xs font-semibold px-3 py-2 hover:bg-gold/5 transition-colors"
                      >
                        このホテルを選ぶ
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
