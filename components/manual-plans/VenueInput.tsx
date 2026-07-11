"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { buildGoogleMapsUrl, buildAppleMapsUrl, buildEmbedUrl } from "@/lib/manual-plans/maps";
import HotpepperSearchModal from "./HotpepperSearchModal";
import type { HotpepperShop } from "@/lib/api/hotpepper";

export interface VenueValue {
  venueName: string;
  venueAddress: string;
  venueUrl: string;
  venueHotpepperId: string;
  venueLat: number | null;
  venueLng: number | null;
}

interface VenueInputProps {
  value: VenueValue;
  onChange: (next: VenueValue) => void;
  disabled?: boolean;
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors focus:border-gold disabled:opacity-50";
const labelClass = "block text-sm font-medium text-ink";

// Consolidates the old separate 店名/住所/URL/地図URL fields into one smart
// input: map links and the preview are derived from venueName (+ address,
// when Hotpepper selection supplied one) rather than requiring the user to
// paste map URLs by hand. onChange always emits the full VenueValue (not a
// partial merge) so a hand-edit of the name field can unambiguously clear
// the address/url/hotpepper-id that came from a prior Hotpepper pick.
export default function VenueInput({ value, onChange, disabled }: VenueInputProps) {
  const [hotpepperOpen, setHotpepperOpen] = useState(false);

  const query = [value.venueName, value.venueAddress].filter(Boolean).join(" ").trim();

  function handleNameChange(name: string) {
    onChange({
      venueName: name,
      venueAddress: "",
      venueUrl: "",
      venueHotpepperId: "",
      venueLat: null,
      venueLng: null,
    });
  }

  function handleSelectShop(shop: HotpepperShop) {
    onChange({
      venueName: shop.name,
      venueAddress: shop.address,
      venueUrl: shop.urls.pc,
      venueHotpepperId: shop.id,
      venueLat: shop.lat || null,
      venueLng: shop.lng || null,
    });
    setHotpepperOpen(false);
  }

  return (
    <div>
      <label className={labelClass}>場所</label>
      <input
        type="text"
        value={value.venueName}
        onChange={(e) => handleNameChange(e.target.value)}
        disabled={disabled}
        className={inputClass}
        placeholder="お店の名前や住所を入力"
      />

      <button
        type="button"
        onClick={() => setHotpepperOpen(true)}
        disabled={disabled}
        className="mt-2 flex items-center gap-1.5 rounded-xl border border-gold/20 text-gold text-xs font-semibold px-3 py-2 hover:bg-gold/5 transition-colors disabled:opacity-50"
      >
        <Search size={14} />
        ホットペッパーで店を探す
      </button>

      {query && (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="text-ink/60">地図で開く:</span>
            <a
              href={buildGoogleMapsUrl(query)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              🗺️ Google Maps
            </a>
            <a
              href={buildAppleMapsUrl(query)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              🍎 Apple Maps
            </a>
          </div>

          <iframe
            src={buildEmbedUrl(query)}
            className="mt-3 h-48 w-full rounded-lg border border-gold/20"
            loading="lazy"
            title="地図プレビュー"
          />
        </>
      )}

      {hotpepperOpen && (
        <HotpepperSearchModal onClose={() => setHotpepperOpen(false)} onSelect={handleSelectShop} />
      )}
    </div>
  );
}
