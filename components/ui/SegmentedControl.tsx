"use client";

import { useId, type ReactNode } from "react";
import { motion } from "framer-motion";

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  "aria-label"?: string;
}

const SIZE_CLASSES: Record<NonNullable<SegmentedControlProps<string>["size"]>, string> = {
  sm: "text-[11px] py-1",
  md: "text-xs py-2",
  lg: "text-sm py-2.5",
};

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  disabled,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  const layoutId = useId();

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex gap-1 rounded-xl border border-gold/15 bg-gold/5 p-1"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`relative flex-1 rounded-lg font-semibold transition-colors disabled:opacity-50 ${SIZE_CLASSES[size]} ${
              selected ? "text-white" : "text-ink-secondary hover:text-ink"
            }`}
          >
            {selected && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg bg-gold-gradient"
                transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
              />
            )}
            <span className="relative flex items-center justify-center gap-1">
              {option.icon}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
