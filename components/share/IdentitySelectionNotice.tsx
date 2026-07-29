"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function IdentitySelectionNotice() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.25 }}
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
