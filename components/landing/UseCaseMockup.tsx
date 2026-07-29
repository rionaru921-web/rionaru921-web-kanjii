"use client";

import { motion } from "framer-motion";
import { Cake, Flower2, Heart, Leaf, PartyPopper, Plane, Snowflake, Wine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UseCaseMockupData } from "@/lib/use-cases";

const CHIP_ICONS: Record<string, LucideIcon> = {
  飲み会: Wine,
  旅行: Plane,
  歓迎会: Flower2,
  送別会: Leaf,
  忘年会: Snowflake,
  新年会: PartyPopper,
  誕生日: Cake,
  記念日: Heart,
};

interface UseCaseMockupProps {
  mockup: UseCaseMockupData;
  delay?: number;
}

// 80%-scale variant of HeroMockup for the use-case cards — same visual
// language (chapter marker, chip row, field preview, progress bar), driven
// entirely by per-scene data instead of being hardcoded.
export default function UseCaseMockup({ mockup, delay = 0 }: UseCaseMockupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className="relative w-full"
    >
      <div className="rounded-2xl border border-gold/20 bg-surface-tertiary shadow-warm-hover p-4">
        <div className="mb-3 flex items-center gap-1.5 border-b border-gold/10 pb-2">
          <span className="font-serif text-[11px] text-ink-muted">{mockup.eventName}</span>
        </div>

        <div className="mb-3">
          <p className="text-gold text-xs mb-0.5" aria-hidden>
            ◇
          </p>
          <p className="font-serif text-[9px] tracking-[0.2em] text-ink-muted mb-0.5">
            {mockup.chapterNumber}
          </p>
          <p className="font-serif text-sm font-bold text-ink">{mockup.chapterTitle}</p>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {mockup.chips.map((label, i) => {
            const Icon = CHIP_ICONS[label];
            const selected = i === mockup.activeChipIndex;
            return (
              <span
                key={label}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] ${
                  selected
                    ? "border-gold bg-gold/10 text-ink"
                    : "border-gold/15 text-ink-secondary"
                }`}
              >
                {Icon && <Icon size={10} />}
                {label}
              </span>
            );
          })}
        </div>

        <div className="rounded-lg border border-gold/20 bg-surface-secondary px-2.5 py-1.5 text-[11px] text-ink">
          {mockup.date}
        </div>

        <div className="mt-3 border-t border-gold/10 pt-2">
          <div className="flex items-center justify-between text-[9px] text-ink-muted">
            <span className="font-serif">{mockup.chapterNumber} / 全六章</span>
            <span className="text-gold">{mockup.progressPercent}%</span>
          </div>
          <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-gold/10">
            <div
              className="h-full bg-gold-gradient"
              style={{ width: `${mockup.progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
