"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

// Step 3 of the real 5-question flow (lib/coaching/questions.ts) — the
// question text is copied verbatim, not invented.
const STEP = 3;
const TOTAL_STEPS = 5;
const PERCENT = Math.round((STEP / TOTAL_STEPS) * 100);

export default function CoachMockup() {
  return (
    <div className="rounded-2xl border border-gold/20 bg-surface-tertiary shadow-warm-hover p-6 max-w-md mx-auto">
      <div className="mb-4 flex items-center gap-2 border-b border-gold/10 pb-3">
        <GraduationCap size={16} className="text-gold" />
        <span className="font-serif text-xs text-ink-muted">AI幹事コーチ</span>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-[11px] text-ink-muted">
          <span className="font-serif">ステップ {STEP}/{TOTAL_STEPS}</span>
          <span className="text-gold">{PERCENT}%</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-gold/10">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${PERCENT}%` }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-gold-gradient"
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <p className="font-serif text-sm font-semibold text-ink mb-3">
          一番良かった点を教えてください
        </p>
        <div className="rounded-lg border border-gold/20 bg-surface-secondary px-3 py-2.5 text-sm text-ink-muted">
          お店の雰囲気が...
        </div>
      </motion.div>

      <div className="mt-4 flex justify-end">
        <span className="inline-flex items-center rounded-full bg-gold-gradient px-4 py-1.5 text-xs font-semibold text-white">
          次へ →
        </span>
      </div>
    </div>
  );
}
