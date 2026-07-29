"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface OtherInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  disabled?: boolean;
}

// Reusable "add a custom tag" affordance for preset+free-text jsonb array
// fields (venue_facilities, payment_methods) — the preset chips stay
// toggle-only, this handles the escape hatch alongside them.
export default function OtherInput({
  values,
  onChange,
  placeholder = "その他を追加",
  maxItems = 5,
  disabled,
}: OtherInputProps) {
  const [input, setInput] = useState("");
  const reduceMotion = useReducedMotion();

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed || values.includes(trimmed) || values.length >= maxItems) return;
    onChange([...values, trimmed]);
    setInput("");
  }

  function handleRemove(target: string) {
    onChange(values.filter((v) => v !== target));
  }

  return (
    <div className="mt-3">
      <AnimatePresence>
        {values.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="flex flex-wrap gap-2 mb-3 overflow-hidden"
          >
            {values.map((v) => (
              <motion.span
                key={v}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-ink text-sm"
              >
                {v}
                <button
                  type="button"
                  onClick={() => handleRemove(v)}
                  disabled={disabled}
                  aria-label={`${v} を削除`}
                  className="-mr-1 flex h-[18px] w-[18px] items-center justify-center hover:text-vermilion-text transition-colors disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {values.length < maxItems ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={30}
            className="flex-1 min-h-[44px] px-3 py-2 rounded-lg border border-gold/20 bg-surface text-ink outline-none transition-colors focus:border-gold disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={disabled || !input.trim()}
            aria-label="追加"
            className="flex shrink-0 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-gold-gradient text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <p className="text-xs text-ink-muted mt-2">最大 {maxItems} 個まで追加できます</p>
      )}
    </div>
  );
}
