import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Users, DoorClosed, UtensilsCrossed } from "lucide-react";
import type { Restaurant } from "@/lib/api/types";
import { genreNameByCode } from "@/lib/constants/genres";
import { averageBudgetYen } from "@/lib/api/restaurant-utils";

export default function RestaurantCard({
  restaurant,
  people,
}: {
  restaurant: Restaurant;
  people: number;
}) {
  const avgYen = averageBudgetYen(restaurant);
  const total = avgYen * Math.max(people, 1);
  const hasRating = restaurant.rating != null;

  return (
    <div className="rounded-3xl bg-surface-tertiary overflow-hidden shadow-warm hover:shadow-warm-hover hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-44 sm:h-48 w-full bg-gradient-to-br from-gold/15 to-vermilion/10 flex items-center justify-center">
        {restaurant.photoUrl ? (
          <Image
            src={restaurant.photoUrl}
            alt={restaurant.name}
            fill
            sizes="(max-width: 640px) 100vw, 640px"
            className="object-cover"
            style={{ filter: "sepia(0.05) saturate(1.1)" }}
          />
        ) : (
          <UtensilsCrossed className="text-gold/40" size={36} />
        )}
        {restaurant.privateRoom && (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-surface-tertiary/90 backdrop-blur-sm text-gold text-xs px-2.5 py-1 shadow-warm">
            <DoorClosed size={12} />
            個室
          </span>
        )}
      </div>
      <div className="p-5 sm:p-6 flex flex-col gap-3">
        <div>
          <h2 className="font-serif font-bold text-lg leading-snug text-ink hover:text-gold transition-colors">
            {restaurant.name}
          </h2>
          <span className="text-xs text-ink-muted">
            {genreNameByCode(restaurant.genreCode)}
            {restaurant.genreCatch ? ` ・ ${restaurant.genreCatch}` : ""}
          </span>
        </div>

        {hasRating ? (
          <div className="flex items-center gap-1 text-sm">
            <Star className="text-gold fill-gold" size={14} />
            <span className="font-semibold text-ink">{restaurant.rating!.toFixed(1)}</span>
            <span className="text-ink-muted">({restaurant.reviewCount}件)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-gold/10 text-gold text-xs px-2.5 py-1">
              <Users size={12} />
              宴会{restaurant.capacity}人まで
            </span>
          </div>
        )}

        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-ink-muted">予算目安</span>
          <span className="font-display-num font-bold text-2xl text-gold">
            {avgYen > 0 ? `¥${avgYen.toLocaleString()}` : "—"}
          </span>
        </div>

        <div className="flex flex-col gap-1 text-sm text-ink-secondary">
          <span className="truncate">{restaurant.address}</span>
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {restaurant.access || `${restaurant.station}駅`}
          </span>
        </div>

        <div className="flex gap-2 mt-1">
          {restaurant.source === "hotpepper" && (
            <Link
              href={`/nomikai/shop/${restaurant.id}?people=${people}`}
              className="flex-1 inline-flex items-center justify-center rounded-full border border-gold text-gold font-semibold text-sm py-2.5 hover:bg-gold/10 transition-colors"
            >
              詳細を見る
            </Link>
          )}
          <Link
            href={`/nomikai/warikan?total=${total}&shopId=${restaurant.id}`}
            className="flex-1 inline-flex items-center justify-center rounded-full bg-gold-gradient text-white font-semibold text-sm py-2.5 shadow-warm hover:brightness-110 transition-all"
          >
            この店で割り勘
          </Link>
        </div>
      </div>
    </div>
  );
}
