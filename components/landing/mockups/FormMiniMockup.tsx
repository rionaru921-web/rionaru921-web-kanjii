"use client";

import { motion } from "framer-motion";
import { FileText, Flower2, Leaf, PartyPopper, Wine } from "lucide-react";

const EVENT_CHIPS = [
  { label: "飲み会", icon: Wine },
  { label: "歓迎会", icon: Flower2 },
  { label: "送別会", icon: Leaf },
  { label: "誕生日", icon: PartyPopper },
];

// Compact companion to HeroMockup for the how-to guide's step 1 —
// deliberately smaller and without the title/date fields, since this
// section only needs to convey "select event type, chapters progress".
export default function FormMiniMockup() {
  return (
    <div className="rounded-2xl border border-gold/20 bg-surface-tertiary shadow-warm-hover p-5 max-w-sm mx-auto">
      <div className="mb-3 flex items-center gap-2 border-b border-gold/10 pb-2.5">
        <FileText size={14} className="text-gold" />
        <span className="font-serif text-xs text-ink-muted">プラン作成</span>
      </div>

      <p className="text-gold text-xs mb-1" aria-hidden>
        ◇
      </p>
      <p className="font-serif text-[10px] tracking-[0.2em] text-ink-muted mb-0.5">第一章</p>
      <p className="font-serif text-base font-bold text-ink mb-3">はじまり</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {EVENT_CHIPS.map((chip, i) => {
          const selected = i === 0;
          return (
            <motion.div
              key={chip.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${
                selected ? "border-gold bg-gold/10 text-ink" : "border-gold/15 text-ink-secondary"
              }`}
            >
              <chip.icon size={11} />
              {chip.label}
            </motion.div>
          );
        })}
      </div>

      <div className="border-t border-gold/10 pt-2.5">
        <div className="flex items-center justify-between text-[10px] text-ink-muted">
          <span className="font-serif">第一章 / 全六章</span>
          <span className="text-gold">17%</span>
        </div>
        <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-gold/10">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "17%" }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gold-gradient"
          />
        </div>
      </div>
    </div>
  );
}
