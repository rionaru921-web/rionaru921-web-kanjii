"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

// Step 1 of the real 5-question flow (lib/coaching/questions.ts), shown as
// its "choice" type — distinct from mockups/CoachMockup.tsx (Wave 9-C),
// which shows step 3's "text" type. Question text copied verbatim.
const CHOICES = ["100%（全員参加）", "80〜99%", "60〜79%", "60%未満", "その他"];

export default function CoachMiniMockup() {
  return (
    <div className="rounded-2xl border border-gold/20 bg-surface-tertiary shadow-warm-hover p-5 max-w-sm mx-auto">
      <div className="mb-3 flex items-center gap-2 border-b border-gold/10 pb-2.5">
        <GraduationCap size={14} className="text-gold" />
        <span className="font-serif text-xs text-ink-muted">AI幹事コーチ</span>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-[10px] text-ink-muted">
          <span className="font-serif">ステップ 1/5</span>
          <span className="text-gold">20%</span>
        </div>
        <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-gold/10">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "20%" }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-gold-gradient"
          />
        </div>
      </div>

      <p className="font-serif text-sm font-semibold text-ink mb-2.5">
        当日の参加率はどうでしたか？
      </p>

      <div className="flex flex-wrap gap-1.5">
        {CHOICES.map((choice, i) => (
          <motion.span
            key={choice}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className={`rounded-full border px-2.5 py-1 text-[11px] ${
              i === 0
                ? "border-gold bg-gold/10 text-ink"
                : "border-gold/15 text-ink-secondary"
            }`}
          >
            {choice}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
