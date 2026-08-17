"use client";

import { useState } from "react";
import { Plus, Coins } from "lucide-react";
import { sanitizeNumericInput } from "@/lib/format/currency";
import type { OptionalQuestion } from "@/lib/surveys/types";

const DEFAULT_MIN = 1000;
const DEFAULT_MAX = 20000;
const DEFAULT_STEP = 500;

export default function BudgetSliderConfig({
  onAdd,
  disabled,
}: {
  onAdd: (question: OptionalQuestion) => void;
  disabled?: boolean;
}) {
  const [label, setLabel] = useState("希望予算(スライダー)");
  const [minInput, setMinInput] = useState(String(DEFAULT_MIN));
  const [maxInput, setMaxInput] = useState(String(DEFAULT_MAX));
  const [stepInput, setStepInput] = useState(String(DEFAULT_STEP));

  const min = Number(minInput) || 0;
  const max = Number(maxInput) || 0;
  const step = Number(stepInput) || 0;
  const valid = label.trim().length > 0 && min < max && step > 0;

  function handleAdd() {
    if (!valid) return;
    onAdd({
      id: `custom_${Date.now()}`,
      label: label.trim(),
      type: "budget_slider",
      sliderMin: min,
      sliderMax: max,
      sliderStep: step,
    });
    setLabel("希望予算(スライダー)");
    setMinInput(String(DEFAULT_MIN));
    setMaxInput(String(DEFAULT_MAX));
    setStepInput(String(DEFAULT_STEP));
  }

  return (
    <div className="rounded-xl border border-gold/10 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-medium text-ink">
        <Coins size={16} className="text-gold" />
        予算スライダーを追加
      </div>

      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        disabled={disabled}
        maxLength={100}
        placeholder="質問文"
        className="w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50"
      />

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[11px] text-ink-muted mb-1">最小(円)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={minInput}
            onChange={(e) => setMinInput(sanitizeNumericInput(e.target.value))}
            disabled={disabled}
            className="w-full rounded-xl border border-gold/20 bg-surface px-2 py-2 text-sm text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-[11px] text-ink-muted mb-1">最大(円)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={maxInput}
            onChange={(e) => setMaxInput(sanitizeNumericInput(e.target.value))}
            disabled={disabled}
            className="w-full rounded-xl border border-gold/20 bg-surface px-2 py-2 text-sm text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-[11px] text-ink-muted mb-1">刻み(円)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={stepInput}
            onChange={(e) => setStepInput(sanitizeNumericInput(e.target.value))}
            disabled={disabled}
            className="w-full rounded-xl border border-gold/20 bg-surface px-2 py-2 text-sm text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50"
          />
        </div>
      </div>

      {min >= max && <p className="text-xs text-vermilion-text">最大は最小より大きい値にしてください。</p>}

      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled || !valid}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 text-sm font-medium text-gold py-2 hover:bg-gold/5 transition-colors disabled:opacity-50"
      >
        <Plus size={14} />
        この質問を追加
      </button>
    </div>
  );
}
