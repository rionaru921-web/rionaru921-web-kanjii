"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Wallet, BookmarkPlus, Check } from "lucide-react";
import type { HotpepperShop } from "@/lib/api/hotpepper";
import { genreNameByCode } from "@/lib/constants/genres";
import { parseYenAmount } from "@/lib/api/restaurant-utils";
import PhotoGallery from "./PhotoGallery";
import ShopInfoTable from "./ShopInfoTable";
import ReserveButton from "./ReserveButton";

// TODO(P5): persist to a Supabase "saved_shops" table once that schema
// exists. Left as a client-only stub so the button is functional (gives
// feedback) without a half-built backend dependency.
async function saveToHistory(shopId: string) {
  void shopId;
  await new Promise((resolve) => setTimeout(resolve, 300));
}

export default function ShopDetail({
  shop,
  people,
  reserveUrl,
}: {
  shop: HotpepperShop;
  people: number;
  reserveUrl: string;
}) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const averageYen = parseYenAmount(shop.budget.average);
  const total = averageYen * Math.max(people, 1);
  const images = [shop.photos.large, ...shop.shopImages].filter(Boolean);

  async function handleSave() {
    setSaving(true);
    await saveToHistory(shop.id);
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <PhotoGallery images={images} alt={shop.name} />

      <div>
        <h1 className="font-serif font-bold text-2xl text-ink mb-1">{shop.name}</h1>
        <p className="text-sm text-gold mb-2">
          {genreNameByCode(shop.genre.code)}
          {shop.genre.catch ? ` ・ ${shop.genre.catch}` : ""}
        </p>
        <p className="text-sm text-ink-secondary">{shop.address}</p>
      </div>

      <div>
        <h2 className="font-serif font-bold text-base text-ink mb-3">設備・特徴</h2>
        <ShopInfoTable shop={shop} />
      </div>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <h2 className="flex items-center gap-1.5 font-serif font-bold text-base text-ink mb-3">
          <Clock size={16} className="text-gold" />
          営業時間
        </h2>
        <p className="text-sm text-ink-secondary">{shop.open || "情報なし"}</p>
        {shop.close && <p className="text-xs text-ink-muted mt-1">定休日: {shop.close}</p>}
      </div>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <h2 className="flex items-center gap-1.5 font-serif font-bold text-base text-ink mb-3">
          <MapPin size={16} className="text-gold" />
          アクセス
        </h2>
        <p className="text-sm text-ink-secondary mb-3">{shop.access || "情報なし"}</p>
        {shop.lat && shop.lng ? (
          <div className="rounded-xl overflow-hidden border border-gold/10 h-52">
            <iframe
              title={`${shop.name}の地図`}
              className="w-full h-full"
              loading="lazy"
              src={`https://www.google.com/maps?q=${shop.lat},${shop.lng}&z=16&output=embed`}
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <ReserveButton shopUrl={reserveUrl} shopId={shop.id} />

        <Link
          href={`/nomikai/warikan?total=${total}&shopId=${shop.id}`}
          className="flex items-center justify-center gap-2 rounded-full border-2 border-gold text-gold font-bold py-3.5 text-base hover:bg-gold/10 transition-all"
        >
          <Wallet size={18} />
          この店で割り勘計算
        </Link>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || saved}
          className="flex items-center justify-center gap-2 rounded-full border border-gold/30 text-gold font-semibold py-3 text-sm hover:bg-gold/5 transition-colors disabled:opacity-70"
        >
          {saved ? <Check size={16} /> : <BookmarkPlus size={16} />}
          {saved ? "履歴に保存しました" : saving ? "保存中..." : "履歴に保存"}
        </button>
      </div>
    </div>
  );
}
