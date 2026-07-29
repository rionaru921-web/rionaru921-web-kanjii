"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { inputClass, labelClass } from "@/lib/manual-plans/form-styles";

export interface NijikaiValue {
  enabled: boolean;
  venue: string;
  budget: string;
  url: string;
  startTime: string;
}

interface NijikaiSectionProps {
  value: NijikaiValue;
  onChange: (next: NijikaiValue) => void;
  disabled?: boolean;
}

export default function NijikaiSection({ value, onChange, disabled }: NijikaiSectionProps) {
  const reduceMotion = useReducedMotion();

  function patch(fields: Partial<NijikaiValue>) {
    onChange({ ...value, ...fields });
  }

  return (
    <div className="rounded-2xl border border-gold/10 p-4">
      <label className="flex items-center justify-between gap-3 cursor-pointer">
        <span className="text-sm font-medium text-ink">二次会もある</span>
        <button
          type="button"
          role="switch"
          aria-checked={value.enabled}
          onClick={() => patch({ enabled: !value.enabled })}
          disabled={disabled}
          className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${
            value.enabled ? "bg-gold-gradient" : "bg-surface-warm border border-gold/15"
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-warm transition-transform ${
              value.enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </label>

      <AnimatePresence initial={false}>
        {value.enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>会場</label>
                <input
                  type="text"
                  value={value.venue}
                  onChange={(e) => patch({ venue: e.target.value })}
                  disabled={disabled}
                  className={inputClass}
                  placeholder="例: カラオケ〇〇店"
                />
              </div>
              <div>
                <label className={labelClass}>開始時刻</label>
                <input
                  type="time"
                  value={value.startTime}
                  onChange={(e) => patch({ startTime: e.target.value })}
                  disabled={disabled}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>予算(円)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={value.budget}
                  onChange={(e) => patch({ budget: e.target.value })}
                  disabled={disabled}
                  className={inputClass}
                  placeholder="2000"
                />
              </div>
              <div>
                <label className={labelClass}>URL(任意)</label>
                <input
                  type="text"
                  value={value.url}
                  onChange={(e) => patch({ url: e.target.value })}
                  disabled={disabled}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
