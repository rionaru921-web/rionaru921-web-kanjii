"use client";

import { useMemo, useState } from "react";
import { Loader2, SearchX } from "lucide-react";
import Link from "next/link";
import RestaurantCard from "./RestaurantCard";
import type { Restaurant } from "@/lib/api/types";
import type { HotpepperSearchParams } from "@/lib/api/hotpepper";
import { averageBudgetYen } from "@/lib/api/restaurant-utils";

type SortMode = "recommended" | "budget" | "capacity";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "recommended", label: "おすすめ順" },
  { value: "budget", label: "予算安い順" },
  { value: "capacity", label: "収容人数多い順" },
];

function sortShops(shops: Restaurant[], mode: SortMode): Restaurant[] {
  if (mode === "recommended") return shops;
  const copy = [...shops];
  if (mode === "budget") {
    copy.sort((a, b) => (averageBudgetYen(a) || Infinity) - (averageBudgetYen(b) || Infinity));
  } else if (mode === "capacity") {
    copy.sort((a, b) => b.capacity - a.capacity);
  }
  return copy;
}

export default function ResultsList({
  initialShops,
  totalAvailable,
  source,
  hotpepperBaseParams,
  people,
}: {
  initialShops: Restaurant[];
  totalAvailable: number;
  source: "mock" | "hotpepper";
  hotpepperBaseParams?: Omit<HotpepperSearchParams, "start">;
  people: number;
}) {
  const [shops, setShops] = useState(initialShops);
  const [available, setAvailable] = useState(totalAvailable);
  const [sortMode, setSortMode] = useState<SortMode>("recommended");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayedShops = useMemo(() => sortShops(shops, sortMode), [shops, sortMode]);
  const canLoadMore = source === "hotpepper" && shops.length < available;

  async function handleLoadMore() {
    if (!hotpepperBaseParams) return;
    setLoading(true);
    setError(null);

    const query = new URLSearchParams();
    if (hotpepperBaseParams.keyword) query.set("keyword", hotpepperBaseParams.keyword);
    if (hotpepperBaseParams.lat != null) query.set("lat", String(hotpepperBaseParams.lat));
    if (hotpepperBaseParams.lng != null) query.set("lng", String(hotpepperBaseParams.lng));
    if (hotpepperBaseParams.range) query.set("range", String(hotpepperBaseParams.range));
    if (hotpepperBaseParams.budget) query.set("budget", hotpepperBaseParams.budget);
    if (hotpepperBaseParams.genre) query.set("genre", hotpepperBaseParams.genre);
    if (hotpepperBaseParams.privateRoom) query.set("privateRoom", "true");
    if (hotpepperBaseParams.partyCapacity)
      query.set("partyCapacity", String(hotpepperBaseParams.partyCapacity));
    query.set("count", String(hotpepperBaseParams.count ?? 20));
    query.set("start", String(shops.length + 1));

    try {
      const res = await fetch(`/api/hotpepper/search?${query.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "追加の検索に失敗しました。");
      }
      const nextShops: Restaurant[] = data.shops.map((s: HotpepperShopLike) => ({
        id: s.id,
        name: s.name,
        genreCode: s.genre.code,
        genreCatch: s.genre.catch,
        budgetLabel: s.budget.name,
        budgetAverage: s.budget.average,
        station: s.stationName,
        privateRoom: s.privateRoom,
        capacity: s.partyCapacity,
        address: s.address,
        access: s.access,
        photoUrl: s.photos.large || s.photos.medium,
        shopUrl: s.urls.pc,
        source: "hotpepper" as const,
      }));
      setShops((prev) => [...prev, ...nextShops]);
      setAvailable(data.totalAvailable ?? available);
    } catch (err) {
      setError(err instanceof Error ? err.message : "追加の検索に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  if (displayedShops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 gap-3 rounded-3xl bg-surface-tertiary shadow-warm">
        <SearchX className="text-ink-muted" size={40} />
        <p className="text-ink-secondary">条件に合うお店が見つかりませんでした</p>
        <Link href="/nomikai" className="text-gold text-sm underline underline-offset-4">
          条件を変えて再検索
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSortMode(opt.value)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors ${
              sortMode === opt.value
                ? "bg-gold-gradient border-transparent text-white"
                : "border-gold/15 bg-surface-tertiary text-ink-secondary hover:border-gold/40 hover:bg-gold/5"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {displayedShops.map((r) => (
        <RestaurantCard key={r.id} restaurant={r} people={people} />
      ))}

      {error && (
        <p className="text-xs text-vermilion text-center">{error}</p>
      )}

      {canLoadMore && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-gold/30 text-gold font-semibold py-3 text-sm hover:bg-gold/5 transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "読み込み中..." : `もっと見る（${shops.length}/${available}件）`}
        </button>
      )}
    </div>
  );
}

interface HotpepperShopLike {
  id: string;
  name: string;
  address: string;
  stationName: string;
  genre: { code: string; name: string; catch: string };
  budget: { code: string; name: string; average: string };
  partyCapacity: number;
  access: string;
  privateRoom: boolean;
  photos: { large: string; medium: string; small: string };
  urls: { pc: string };
}
