"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FileText, Wine, Flower2, Leaf, PartyPopper } from "lucide-react";
import type { MockupProps } from "@/components/landing/mockups/mockupTypes";

const EVENT_CHIPS = [
  { label: "飲み会", icon: Wine },
  { label: "歓迎会", icon: Flower2 },
  { label: "送別会", icon: Leaf },
  { label: "誕生日", icon: PartyPopper },
];

const CONTAINER_SIZE = {
  sm: "max-w-xs",
  md: "max-w-sm sm:max-w-md",
  lg: "max-w-sm sm:max-w-lg",
};

// Placeholder for the real product screenshot. The outer motion.div (glow +
// floating) is the permanent "frame" — once a real screenshot exists, only
// the inner .screen card below needs to become an <Image src="/hero-mockup.png" />.
export default function HeroMockup({ size = "md", autoPlay = true, onInteraction }: MockupProps = {}) {
  const [selected, setSelected] = useState(0);
  const reduceMotion = useReducedMotion();
  const shouldFloat = autoPlay && !reduceMotion;

  function selectChip(i: number) {
    setSelected(i);
    onInteraction?.({ type: "chip-select", label: EVENT_CHIPS[i].label });
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, rotate: -3 }}
      animate={{ opacity: 1, scale: 1, rotate: -2, y: shouldFloat ? [0, -10, 0] : 0 }}
      transition={{
        opacity: { duration: 0.8, ease: "easeOut", delay: 0.2 },
        scale: { duration: 0.8, ease: "easeOut", delay: 0.2 },
        rotate: { duration: 0.8, ease: "easeOut", delay: 0.2 },
        y: shouldFloat
          ? { duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror", delay: 1 }
          : { duration: 0.8, ease: "easeOut", delay: 0.2 },
      }}
      className={`relative w-full ${CONTAINER_SIZE[size]}`}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 scale-90 rounded-full bg-gold/20 blur-3xl" />

      {/* screen */}
      <div className="rounded-2xl border border-gold/20 bg-surface-tertiary shadow-warm-hover p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 border-b border-gold/10 pb-3">
          <FileText size={14} className="text-gold" />
          <span className="font-serif text-xs text-ink-muted">プラン作成</span>
          <span className="ml-auto flex items-center gap-1.5 text-[11px] text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            オンライン
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-4"
        >
          <p className="text-gold text-sm mb-1" aria-hidden>
            ◇
          </p>
          <p className="font-serif text-[10px] tracking-[0.25em] text-ink-muted mb-1">第一章</p>
          <p className="font-serif text-lg font-bold text-ink">はじまり</p>
        </motion.div>

        <div className="mb-4 flex flex-wrap gap-2">
          {EVENT_CHIPS.map((chip, i) => {
            const isSelected = i === selected;
            return (
              <motion.button
                key={chip.label}
                type="button"
                onClick={() => selectChip(i)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  isSelected
                    ? "border-gold bg-gold/10 text-ink"
                    : "border-gold/15 text-ink-secondary hover:border-gold/30"
                }`}
              >
                <chip.icon size={12} />
                {chip.label}
              </motion.button>
            );
          })}
        </div>

        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.85 }}
          >
            <p className="text-[11px] text-ink-muted mb-1">タイトル</p>
            <div className="rounded-lg border border-gold/20 bg-surface-secondary px-3 py-2 text-sm text-ink">
              {EVENT_CHIPS[selected].label === "飲み会" && "夏の同期歓迎会"}
              {EVENT_CHIPS[selected].label === "歓迎会" && "4月新入社員 歓迎会"}
              {EVENT_CHIPS[selected].label === "送別会" && "お世話になった先輩の送別会"}
              {EVENT_CHIPS[selected].label === "誕生日" && "同期の誕生日会"}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.95 }}
          >
            <p className="text-[11px] text-ink-muted mb-1">日程</p>
            <div className="rounded-lg border border-gold/20 bg-surface-secondary px-3 py-2 text-sm text-ink">
              2026年8月15日(土) 19:00〜
            </div>
          </motion.div>
        </div>

        <div className="mt-4 border-t border-gold/10 pt-3">
          <div className="flex items-center justify-between text-[11px] text-ink-muted">
            <span className="font-serif">第一章 / 全六章</span>
            <span className="text-gold">17%</span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-gold/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "17%" }}
              transition={{ duration: 1, delay: 1.1, ease: "easeOut" }}
              className="h-full bg-gold-gradient"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
