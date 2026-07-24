"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UtensilsCrossed, AlertTriangle, ChevronRight, Wallet } from "lucide-react";
import MizuhikiDivider from "@/components/shared/MizuhikiDivider";
import { parseYenAmount } from "@/lib/api/restaurant-utils";
import type { AIRecommendation as AIRecommendationType } from "@/lib/ai/suggest";

// TODO(P5+): persist to Supabase once the history schema exists.
async function saveDecision(shopId: string) {
  void shopId;
  await new Promise((resolve) => setTimeout(resolve, 300));
}

export default function AIRecommendation({
  recommendation,
  people,
}: {
  recommendation: AIRecommendationType;
  people: number;
}) {
  const { shop } = recommendation;
  const [deciding, setDeciding] = useState(false);
  if (!shop) return null;

  const averageYen = parseYenAmount(shop.budget.average);
  const total = averageYen * Math.max(people, 1);
  const hasScore = recommendation.matchScore > 0;

  async function handleDecide() {
    setDeciding(true);
    await saveDecision(shop!.id);
    window.location.href = `/nomikai/warikan?total=${total}&shopId=${shop!.id}`;
  }

  return (
    <div className="rounded-3xl bg-surface-tertiary shadow-warm overflow-hidden">
      <div className="relative h-44 w-full bg-gradient-to-br from-gold/15 to-vermilion/10 flex items-center justify-center">
        {shop.photos.large ? (
          <Image
            src={shop.photos.large}
            alt={shop.name}
            fill
            sizes="(max-width: 640px) 100vw, 640px"
            className="object-cover"
            style={{ filter: "sepia(0.05) saturate(1.1)" }}
          />
        ) : (
          <UtensilsCrossed className="text-gold/40" size={36} />
        )}
        <span className="absolute top-3 left-3 flex items-center justify-center w-14 h-14 rounded-full bg-surface-tertiary/95 shadow-warm">
          <span className="font-display-num font-black text-2xl text-gold leading-none">
            {String(recommendation.rank).padStart(2, "0")}
          </span>
        </span>
        {hasScore && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-surface-tertiary/95 backdrop-blur-sm px-3 py-1.5 shadow-warm">
            <div className="w-12 h-1.5 rounded-full bg-surface-warm overflow-hidden">
              <div
                className="h-full bg-gold-gradient"
                style={{ width: `${Math.min(recommendation.matchScore, 100)}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gold">
              {recommendation.matchScore}%
            </span>
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6 flex flex-col gap-4">
        <div>
          <h3 className="font-serif font-bold text-lg text-ink leading-snug">
            {shop.name}
          </h3>
          <p className="text-sm text-gold mt-0.5">{recommendation.title}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <MizuhikiDivider className="flex-1" />
            <span className="font-serif text-xs font-semibold text-ink-muted whitespace-nowrap">
              なぜこの店？
            </span>
            <MizuhikiDivider className="flex-1" />
          </div>
          <p className="text-sm text-ink-secondary leading-relaxed">{recommendation.reason}</p>
        </div>

        {recommendation.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recommendation.highlights.map((h) => (
              <span
                key={h}
                className="text-[11px] rounded-full bg-sage/10 text-sage px-2.5 py-1"
              >
                {h}
              </span>
            ))}
          </div>
        )}

        {recommendation.warnings && (
          <div className="flex items-start gap-2 rounded-xl bg-vermilion/10 border border-vermilion/20 px-3 py-2.5">
            <AlertTriangle size={14} className="text-vermilion-text shrink-0 mt-0.5" />
            <p className="text-xs text-ink-secondary">{recommendation.warnings}</p>
          </div>
        )}

        <div className="flex gap-2 mt-1">
          <Link
            href={`/nomikai/shop/${shop.id}?people=${people}`}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-full border border-gold text-gold font-semibold text-sm py-2.5 hover:bg-gold/10 transition-colors"
          >
            詳細を見る
            <ChevronRight size={14} />
          </Link>
          <button
            type="button"
            onClick={handleDecide}
            disabled={deciding}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-gradient text-white font-semibold text-sm py-2.5 hover:brightness-110 transition-all disabled:opacity-60"
          >
            <Wallet size={14} />
            {deciding ? "保存中..." : "この店に決める"}
          </button>
        </div>
      </div>
    </div>
  );
}
