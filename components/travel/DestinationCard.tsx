"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  MapPin,
  Building2,
  Train,
  ChevronDown,
  Wallet,
} from "lucide-react";
import type { TravelPlan } from "@/lib/api/types";
import { planTotalForPeople } from "@/lib/api/travel";
import ItineraryView from "./ItineraryView";

const DESTINATION_IMAGES: Record<string, string> = {
  京都: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=80",
};
const DEFAULT_DESTINATION_IMAGE =
  "https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=1200&q=80";

export default function DestinationCard({
  plan,
  people,
}: {
  plan: TravelPlan;
  people: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const total = planTotalForPeople(plan, people);
  const image = DESTINATION_IMAGES[plan.destination] ?? DEFAULT_DESTINATION_IMAGE;

  return (
    <div className="rounded-3xl bg-surface-tertiary shadow-warm overflow-hidden">
      <div className="relative h-44 sm:h-52 w-full">
        <Image
          src={image}
          alt={plan.destination}
          fill
          sizes="(max-width: 640px) 100vw, 640px"
          className="object-cover"
          style={{ filter: "sepia(0.05) saturate(1.1)" }}
        />
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-surface-tertiary/90 backdrop-blur-sm px-2.5 py-1 shadow-warm">
          <Star className="text-gold fill-gold" size={13} />
          <span className="text-sm font-semibold text-ink">{plan.hotelRating.toFixed(1)}</span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-3">
          <h2 className="font-serif font-bold text-lg text-ink leading-snug">
            {plan.title}
          </h2>
          <span className="flex items-center gap-1 text-xs text-ink-muted mt-1">
            <MapPin size={12} />
            {plan.destination}・{plan.nights}泊{plan.days}日
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="font-display-num font-black text-3xl text-gold">
            ¥{total.toLocaleString()}
          </span>
          <span className="text-xs text-ink-muted">
            (お一人様 ¥{plan.pricePerPerson.toLocaleString()} × {people}人)
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {plan.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] rounded-full bg-gold/10 text-gold px-2.5 py-1"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-1.5 text-sm text-ink-secondary mb-4">
          <span className="flex items-center gap-1.5">
            <Building2 size={14} />
            {plan.hotelName}
          </span>
          <span className="flex items-center gap-1.5">
            <Train size={14} />
            {plan.transport}
          </span>
          <span className="text-xs text-ink-muted">
            観光地: {plan.spots.join("・")}
          </span>
          <span className="text-xs text-ink-muted">
            食事処: {plan.restaurants.join("・")}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs font-semibold text-gold mb-1"
        >
          詳細を見る
          <ChevronDown
            size={14}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gold/10">
            <ItineraryView itinerary={plan.itinerary} />
          </div>
        )}
      </div>

      <Link
        href={`/travel/budget?total=${total}&title=${encodeURIComponent(plan.title)}&planId=${plan.id}`}
        className="flex items-center justify-center gap-2 bg-gold-gradient text-white font-semibold text-sm py-3.5 hover:brightness-110 transition-all"
      >
        <Wallet size={16} />
        費用分担計算
      </Link>
    </div>
  );
}
