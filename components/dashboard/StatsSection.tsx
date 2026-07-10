"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface StatsSectionProps {
  totalCount: number;
}

export default function StatsSection({ totalCount }: StatsSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-3xl bg-surface-tertiary shadow-warm border border-gold/20 p-6"
    >
      <h2 className="flex items-center gap-2 font-serif font-bold text-lg text-ink mb-4">
        <Sparkles className="text-gold" size={18} />
        あなたの活動
      </h2>
      {totalCount === 0 ? (
        <p className="text-sm text-ink-secondary text-center py-4">
          まだプランを作っていません。最初のプランを作ってみましょう!
        </p>
      ) : (
        <div className="text-center">
          <p className="font-display-num font-black text-4xl sm:text-5xl text-gold">{totalCount}</p>
          <p className="text-xs text-ink-muted mt-1">件のプランを作成</p>
        </div>
      )}
    </motion.section>
  );
}
