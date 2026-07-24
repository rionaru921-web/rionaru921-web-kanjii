"use client";

import { motion } from "framer-motion";
import { Clock, Sparkles, Calculator, Share2 } from "lucide-react";

const FEATURES = [
  { icon: Clock, label: "30秒で完了" },
  { icon: Sparkles, label: "かんたん入力" },
  { icon: Calculator, label: "傾斜割り対応" },
  { icon: Share2, label: "URL・QR・PDF共有" },
];

export default function FeatureBadges() {
  return (
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:flex-wrap sm:overflow-visible">
      {FEATURES.map((feature, i) => (
        <motion.span
          key={feature.label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          className="flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-gold/10 px-3 text-xs font-medium text-gold"
        >
          <feature.icon size={14} />
          {feature.label}
        </motion.span>
      ))}
    </div>
  );
}
