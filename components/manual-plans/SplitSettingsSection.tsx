"use client";

import { AnimatePresence, motion } from "framer-motion";
import { calculateSplit, type SplitMemberInput } from "@/lib/manual-plans/calculate-split";
import {
  SPLIT_MODE_LABELS,
  ROUNDING_UNITS,
  type SplitMode,
  type RoundingUnit,
  type TierLevel,
  type OrganizerDiscount,
} from "@/lib/manual-plans/split-types";

export interface SplitPreviewMember {
  name: string;
  tierLevel: TierLevel;
  weightOverride: number | null;
  organizerDiscount: OrganizerDiscount | null;
}

interface SplitSettingsSectionProps {
  splitMode: SplitMode;
  onSplitModeChange: (mode: SplitMode) => void;
  roundingUnit: RoundingUnit;
  onRoundingUnitChange: (unit: RoundingUnit) => void;
  feeAmount: number | null;
  members: SplitPreviewMember[];
  disabled?: boolean;
}

export default function SplitSettingsSection({
  splitMode,
  onSplitModeChange,
  roundingUnit,
  onRoundingUnitChange,
  feeAmount,
  members,
  disabled,
}: SplitSettingsSectionProps) {
  const splitInputs: SplitMemberInput[] = members.map((m, i) => ({
    id: String(i),
    tierLevel: m.tierLevel,
    weightOverride: m.weightOverride,
    organizerDiscount: m.organizerDiscount,
  }));
  const results = calculateSplit(feeAmount, splitInputs, roundingUnit);
  const allWeightsZero = results != null && results.length > 0 && results.every((r) => r.weight === 0);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-sm font-medium text-ink">割り方</label>
        <div className="mt-1.5 flex gap-2">
          {(["equal", "tiered"] as SplitMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onSplitModeChange(mode)}
              disabled={disabled}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold border transition-colors disabled:opacity-50 ${
                splitMode === mode
                  ? "bg-gold-gradient border-transparent text-white"
                  : "border-gold/15 text-ink-secondary hover:border-gold/30"
              }`}
            >
              {SPLIT_MODE_LABELS[mode]}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {splitMode === "tiered" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden flex flex-col gap-3"
          >
            <div>
              <label className="block text-sm font-medium text-ink">端数の丸め単位</label>
              <div className="mt-1.5 flex gap-2">
                {ROUNDING_UNITS.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => onRoundingUnitChange(unit)}
                    disabled={disabled}
                    className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold border transition-colors disabled:opacity-50 ${
                      roundingUnit === unit
                        ? "bg-gold-gradient border-transparent text-white"
                        : "border-gold/15 text-ink-secondary hover:border-gold/30"
                    }`}
                  >
                    {unit}円
                  </button>
                ))}
              </div>
            </div>

            {allWeightsZero && (
              <p className="rounded-xl border border-vermilion/20 bg-vermilion/10 px-3 py-2.5 text-xs text-vermilion">
                全員の重みが0のため、支払額が0円になります。
              </p>
            )}

            {results && results.length > 0 && (
              <div className="rounded-xl bg-gold/5 border border-gold/15 px-4 py-3">
                <p className="text-xs text-ink-muted mb-1.5">💡 傾斜割りプレビュー</p>
                <ul className="flex flex-col gap-1">
                  {members.map((m, i) => (
                    <li key={i} className="flex items-center justify-between text-sm text-ink">
                      <span className="truncate">{m.name}</span>
                      <span className="font-display-num text-gold shrink-0">
                        ¥{(results[i]?.amount ?? 0).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
