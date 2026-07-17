"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface CategorizedOption {
  value: string;
  label: string;
  icon?: string;
  category: string;
  description?: string;
}

interface CategorizedSelectProps {
  categories: Record<string, { label: string; icon?: string }>;
  options: readonly CategorizedOption[];
  value: string[];
  onChange: (value: string[]) => void;
  multiple?: boolean;
  ariaLabel?: string;
}

export default function CategorizedSelect({
  categories,
  options,
  value,
  onChange,
  multiple = true,
  ariaLabel,
}: CategorizedSelectProps) {
  const categoryKeys = Object.keys(categories);
  const [activeCategory, setActiveCategory] = useState(categoryKeys[0]);

  function toggle(optionValue: string) {
    if (!multiple) {
      onChange(value.includes(optionValue) ? [] : [optionValue]);
      return;
    }
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue]
    );
  }

  const visibleOptions = options.filter((o) => o.category === activeCategory);

  return (
    <div>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1"
      >
        {categoryKeys.map((key) => {
          const cat = categories[key];
          const active = key === activeCategory;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveCategory(key)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors whitespace-nowrap ${
                active
                  ? "bg-gold-gradient border-transparent text-white"
                  : "border-gold/15 bg-surface-warm text-ink-secondary hover:border-gold/40 hover:bg-gold/5"
              }`}
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-2 gap-2 mt-1"
        >
          {visibleOptions.map((option) => {
            const selected = value.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                aria-pressed={selected}
                className={`flex flex-col items-start gap-0.5 rounded-xl px-3 py-2.5 text-left border transition-colors ${
                  selected
                    ? "bg-gold-gradient border-transparent text-white"
                    : "border-gold/15 bg-surface-warm text-ink-secondary hover:border-gold/40 hover:bg-gold/5"
                }`}
              >
                <span className="text-xs font-semibold flex items-center gap-1">
                  {option.icon && <span>{option.icon}</span>}
                  {option.label}
                </span>
                {option.description && (
                  <span
                    className={`text-[10px] font-normal ${
                      selected ? "text-white/80" : "text-ink-muted"
                    }`}
                  >
                    {option.description}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map((v) => {
            const opt = options.find((o) => o.value === v);
            if (!opt) return null;
            return (
              <span
                key={v}
                className="inline-flex items-center gap-1 rounded-full bg-gold/10 text-gold text-[11px] font-semibold px-2.5 py-1"
              >
                {opt.icon} {opt.label}
                <button
                  type="button"
                  onClick={() => toggle(v)}
                  aria-label={`${opt.label}を解除`}
                  className="ml-0.5 hover:opacity-70"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
