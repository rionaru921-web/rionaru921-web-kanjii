"use client";

export default function BudgetSliderAnswer({
  min,
  max,
  step,
  value,
  onChange,
  disabled,
}: {
  min: number;
  max: number;
  step: number;
  value: number | undefined;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  // 未回答の間はローカル表示用に中間値を出すだけで onChange は呼ばない
  // (ユーザーが実際に操作するまで optional_answers には何も書き込まない)。
  const display = value ?? Math.round((min + max) / 2 / step) * step;

  return (
    <div className="flex flex-col gap-3">
      <div className="text-center">
        <div className="font-serif text-3xl text-gold">¥{display.toLocaleString()}</div>
        {value === undefined && <div className="text-xs text-ink-muted mt-0.5">スライダーを動かして選んでください</div>}
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={display}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        aria-label="希望予算"
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-gold bg-gold/15 disabled:opacity-50"
      />
      <div className="flex justify-between text-xs text-ink-muted">
        <span>¥{min.toLocaleString()}</span>
        <span>¥{max.toLocaleString()}</span>
      </div>
    </div>
  );
}
