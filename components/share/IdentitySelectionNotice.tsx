"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function IdentitySelectionNotice() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-4 flex items-start gap-2 rounded-lg border border-washoku-red-soft bg-washoku-red-soft px-3 py-2.5 text-xs text-washoku-red"
    >
      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
      <p>
        <span className="font-semibold">⚠️ 必ず自分の名前を選んでください。</span>
        他の参加者の代わりに回答すると、混乱の原因になります。
      </p>
    </motion.div>
  );
}
