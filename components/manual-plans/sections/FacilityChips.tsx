"use client";

import { VENUE_FACILITIES, VENUE_FACILITY_LABELS, type VenueFacility } from "@/lib/manual-plans/facility-types";
import OtherInput from "@/components/manual-plans/OtherInput";

interface FacilityChipsProps {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

function isPreset(value: string): value is VenueFacility {
  return (VENUE_FACILITIES as readonly string[]).includes(value);
}

export default function FacilityChips({ value, onChange, disabled }: FacilityChipsProps) {
  const customFacilities = value.filter((v) => !isPreset(v));

  function toggle(facility: VenueFacility) {
    onChange(value.includes(facility) ? value.filter((f) => f !== facility) : [...value, facility]);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-ink">設備・こだわり</label>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {VENUE_FACILITIES.map((facility) => (
          <button
            key={facility}
            type="button"
            aria-pressed={value.includes(facility)}
            onClick={() => toggle(facility)}
            disabled={disabled}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors disabled:opacity-50 ${
              value.includes(facility)
                ? "bg-gold-gradient border-transparent text-white"
                : "border-gold/15 text-ink-secondary hover:border-gold/30"
            }`}
          >
            {VENUE_FACILITY_LABELS[facility]}
          </button>
        ))}
      </div>

      <OtherInput
        values={customFacilities}
        onChange={(next) => onChange([...value.filter(isPreset), ...next])}
        placeholder="その他の設備・こだわりを追加(例: 駐車場あり)"
        disabled={disabled}
      />
    </div>
  );
}
