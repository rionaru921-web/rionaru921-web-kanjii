"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import {
  BUDGET_CUSTOM_MAX,
  BUDGET_CUSTOM_MIN,
  type BudgetPreset,
} from "@/lib/constants/budget";

interface BudgetPickerProps {
  presets: readonly BudgetPreset[];
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

function clamp(n: number) {
  const rounded = Math.round(n / 100) * 100;
  return Math.min(BUDGET_CUSTOM_MAX, Math.max(BUDGET_CUSTOM_MIN, rounded));
}

export default function BudgetPicker({
  presets,
  value,
  onChange,
  label = "予算（お一人様）",
}: BudgetPickerProps) {
  const matchedPreset = presets.find((p) => p.value === value);
  const [customMode, setCustomMode] = useState(() => !matchedPreset);
  const [customInput, setCustomInput] = useState(() =>
    matchedPreset ? "" : String(value)
  );

  function selectPreset(preset: BudgetPreset) {
    setCustomMode(false);
    onChange(preset.value);
  }

  function selectCustom() {
    setCustomMode(true);
    const n = Number(customInput);
    if (customInput.trim() && Number.isFinite(n)) {
      onChange(clamp(n));
    }
  }

  function handleCustomInput(raw: string) {
    setCustomInput(raw);
    const n = Number(raw);
    if (raw.trim() && Number.isFinite(n)) {
      onChange(clamp(n));
    }
  }

  return (
    <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="flex items-center gap-1.5 text-sm text-ink-secondary">
          <Wallet size={16} />
          {label}
        </label>
        <span className="text-lg font-serif font-bold text-gold">
          ¥{value.toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-2">
        {presets.map((preset) => {
          const selected = !customMode && value === preset.value;
          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => selectPreset(preset)}
              className={`flex flex-col items-center rounded-xl px-2 py-2 text-xs font-semibold border transition-colors ${
                selected
                  ? "bg-gold-gradient border-transparent text-white"
                  : "border-gold/15 bg-surface-warm text-ink-secondary hover:border-gold/40 hover:bg-gold/5"
              }`}
            >
              <span>{preset.label}</span>
              <span
                className={`text-[10px] font-normal mt-0.5 ${
                  selected ? "text-white/80" : "text-ink-muted"
                }`}
              >
                {preset.description}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={selectCustom}
          className={`flex items-center justify-center rounded-xl px-2 py-2 text-xs font-semibold border transition-colors ${
            customMode
              ? "bg-gold-gradient border-transparent text-white"
              : "border-gold/15 bg-surface-warm text-ink-secondary hover:border-gold/40 hover:bg-gold/5"
          }`}
        >
          その他（自由入力）
        </button>
      </div>

      {customMode && (
        <input
          type="text"
          inputMode="numeric"
          value={customInput}
          onChange={(e) => handleCustomInput(e.target.value)}
          placeholder={`${BUDGET_CUSTOM_MIN.toLocaleString()}〜${BUDGET_CUSTOM_MAX.toLocaleString()}円（100円単位）`}
          className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted"
        />
      )}
    </div>
  );
}
