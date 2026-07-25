"use client";

import { motion } from "framer-motion";
import { Wine, Plane, Flower2, Leaf, Snowflake, PartyPopper } from "lucide-react";

const USE_CASES = [
  { label: "飲み会", icon: Wine },
  { label: "旅行", icon: Plane },
  { label: "歓迎会", icon: Flower2 },
  { label: "送別会", icon: Leaf },
  { label: "忘年会", icon: Snowflake },
  { label: "新年会", icon: PartyPopper },
];

export default function UseCaseTags() {
  return (
    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-4">
      {USE_CASES.map((tag, i) => (
        <motion.div
          key={tag.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 + i * 0.05 }}
          whileHover={{ scale: 1.05, y: -2 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-surface-tertiary/70 px-3 py-1.5 text-xs text-ink-secondary hover:border-gold/50 hover:bg-gold/5 transition-colors cursor-default"
        >
          <tag.icon size={13} className="text-gold" />
          <span className="font-serif">{tag.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
