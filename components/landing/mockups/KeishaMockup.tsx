"use client";

import { motion } from "framer-motion";
import { Coins } from "lucide-react";

// Amounts derived from the app's real TIER_WEIGHTS (boss 1.5 / senior 1.2 /
// peer 1.0 / newcomer 0.5) applied to a 16,800円 total — not arbitrary
// numbers, so the math matches what SplitSettingsSection would compute.
const MEMBERS = [
  { name: "田中さん", role: "上司", amount: 6000 },
  { name: "佐藤さん", role: "先輩", amount: 4800 },
  { name: "鈴木さん", role: "同期", amount: 4000 },
  { name: "高橋さん", role: "新人", amount: 2000 },
];

const TOTAL = MEMBERS.reduce((sum, m) => sum + m.amount, 0);

export default function KeishaMockup() {
  return (
    <div className="rounded-2xl border border-gold/20 bg-surface-tertiary shadow-warm-hover p-6 max-w-md mx-auto">
      <div className="mb-4 flex items-center gap-2 border-b border-gold/10 pb-3">
        <Coins size={16} className="text-gold" />
        <span className="font-serif text-xs text-ink-muted">傾斜割りプレビュー</span>
      </div>

      <div className="space-y-3">
        {MEMBERS.map((m, i) => (
          <motion.div
            key={m.name}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex items-center justify-between"
          >
            <div>
              <span className="text-ink text-sm">{m.name}</span>
              <span className="ml-1.5 text-xs text-ink-muted">({m.role})</span>
            </div>
            <span className="font-serif font-semibold text-ink">
              {m.amount.toLocaleString()}
              <span className="text-xs ml-0.5 text-ink-muted">円</span>
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex items-baseline justify-between border-t border-gold/10 pt-3">
        <span className="text-xs text-ink-muted">合計（{MEMBERS.length}名）</span>
        <span className="font-serif font-bold text-lg text-gold">
          {TOTAL.toLocaleString()}
          <span className="text-sm ml-1">円</span>
        </span>
      </div>
    </div>
  );
}
