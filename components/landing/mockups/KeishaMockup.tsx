"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import type { MockupProps } from "./mockupTypes";

// Amounts derived from the app's real TIER_WEIGHTS (boss 1.5 / senior 1.2 /
// peer 1.0 / newcomer 0.5) applied to a 16,800円 total — not arbitrary
// numbers, so the math matches what SplitSettingsSection would compute.
const MEMBERS = [
  { name: "田中さん", role: "上司", amount: 6000 },
  { name: "佐藤さん", role: "先輩", amount: 4800 },
  { name: "鈴木さん", role: "同期", amount: 4000 },
  { name: "高橋さん", role: "新人", amount: 2000 },
];

type Level = "high" | "mid" | "low";
const LEVELS: Level[] = ["high", "mid", "low"];
const LEVEL_LABEL: Record<Level, string> = { high: "高", mid: "中", low: "低" };
// "mid" reproduces each member's original amount exactly, so the default
// (non-interactive) render is pixel-for-pixel identical to pre-Wave-12.
const LEVEL_MULTIPLIER: Record<Level, number> = { high: 1.25, mid: 1, low: 0.75 };

const CONTAINER_SIZE = {
  sm: "max-w-sm p-5",
  md: "max-w-md p-6",
  lg: "max-w-xl p-8",
};

export default function KeishaMockup({ size = "md", autoPlay = true, onInteraction }: MockupProps = {}) {
  const [levels, setLevels] = useState<Record<string, Level>>(() =>
    Object.fromEntries(MEMBERS.map((m) => [m.name, "mid" as Level]))
  );

  function cycleLevel(name: string) {
    setLevels((prev) => {
      const currentIndex = LEVELS.indexOf(prev[name]);
      const nextLevel = LEVELS[(currentIndex + 1) % LEVELS.length];
      onInteraction?.({ type: "level-change", label: `${name}:${LEVEL_LABEL[nextLevel]}` });
      return { ...prev, [name]: nextLevel };
    });
  }

  const amounts = MEMBERS.map((m) => Math.round((m.amount * LEVEL_MULTIPLIER[levels[m.name]]) / 100) * 100);
  const total = amounts.reduce((sum, a) => sum + a, 0);

  const entrance = (i: number) =>
    autoPlay
      ? {
          initial: { opacity: 0, x: -10 },
          whileInView: { opacity: 1, x: 0 },
          viewport: { once: true, margin: "-40px" },
          transition: { duration: 0.4, delay: i * 0.1 },
        }
      : {
          initial: { opacity: 0, x: -10 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.4, delay: i * 0.1 },
        };

  return (
    <div className={`rounded-2xl border border-gold/20 bg-surface-tertiary shadow-warm-hover mx-auto ${CONTAINER_SIZE[size]}`}>
      <div className="mb-4 flex items-center gap-2 border-b border-gold/10 pb-3">
        <Coins size={16} className="text-gold" />
        <span className="font-serif text-xs text-ink-muted">傾斜割りプレビュー</span>
      </div>

      <div className="space-y-3">
        {MEMBERS.map((m, i) => {
          const level = levels[m.name];
          return (
            <motion.div key={m.name} {...entrance(i)} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-ink text-sm">{m.name}</span>
                <span className="text-xs text-ink-muted">({m.role})</span>
                <button
                  type="button"
                  onClick={() => cycleLevel(m.name)}
                  className="ml-1 rounded-full border border-gold/25 bg-gold/5 px-2 py-0.5 text-[10px] text-gold transition-colors hover:bg-gold/10"
                >
                  傾斜: {LEVEL_LABEL[level]}
                </button>
              </div>
              <motion.span
                key={amounts[i]}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="font-serif font-semibold text-ink"
              >
                {amounts[i].toLocaleString()}
                <span className="text-xs ml-0.5 text-ink-muted">円</span>
              </motion.span>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex items-baseline justify-between border-t border-gold/10 pt-3">
        <span className="text-xs text-ink-muted">合計（{MEMBERS.length}名）</span>
        <motion.span
          key={total}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="font-serif font-bold text-lg text-gold"
        >
          {total.toLocaleString()}
          <span className="text-sm ml-1">円</span>
        </motion.span>
      </div>
    </div>
  );
}
