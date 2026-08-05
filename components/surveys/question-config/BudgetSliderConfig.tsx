"use client";

import { useState } from "react";
import { Plus, Coins } from "lucide-react";
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
  const [min, setMin] = useState(DEFAULT_MIN);
  const [max, setMax] = useState(DEFAULT_MAX);
  const [step, setStep] = useState(DEFAULT_STEP);

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
    setMin(DEFAULT_MIN);
    setMax(DEFAULT_MAX);
    setStep(DEFAULT_STEP);
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
            type="number"
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            disabled={disabled}
            min={0}
            step={100}
            className="w-full rounded-xl border border-gold/20 bg-surface px-2 py-2 text-sm text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-[11px] text-ink-muted mb-1">最大(円)</label>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            disabled={disabled}
            min={0}
            step={100}
            className="w-full rounded-xl border border-gold/20 bg-surface px-2 py-2 text-sm text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-[11px] text-ink-muted mb-1">刻み(円)</label>
          <input
            type="number"
            value={step}
            onChange={(e) => setStep(Number(e.target.value))}
            disabled={disabled}
            min={100}
            step={100}
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
