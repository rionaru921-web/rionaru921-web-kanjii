"use client";

import { motion } from "framer-motion";

interface StatsSectionProps {
  totalCount: number;
}

export default function StatsSection({ totalCount }: StatsSectionProps) {
  // The history table only stores finalized records (type: nomikai | travel)
  // and has no status column, so "完了" / "進行中" can't be derived — shown
  // as "-" per the fallback spec.
  const stats = [
    { label: "作成", value: String(totalCount) },
    { label: "完了", value: "-" },
    { label: "進行中", value: "-" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-3xl bg-surface-tertiary shadow-warm p-6"
    >
      <h2 className="font-serif font-bold text-lg text-ink mb-4">📊 あなたの活動</h2>
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-display-num font-black text-3xl sm:text-4xl text-gold">{stat.value}</p>
            <p className="text-xs text-ink-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
