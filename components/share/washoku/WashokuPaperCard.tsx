"use client";

import { motion } from "framer-motion";

// 障子紙カード: paper-toned card with gold corner brackets and a faint
// washi-paper noise texture. Corner frame size steps up on larger screens
// per the design spec (w-8 h-8 mobile → w-16 h-16 desktop).
export function WashokuPaperCard({
  children,
  delay = 0.4,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className="bg-washoku-paper text-washoku-ink rounded-lg shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-8 h-8 sm:w-16 sm:h-16 border-l-2 border-t-2 border-washoku-brass pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 sm:w-16 sm:h-16 border-r-2 border-t-2 border-washoku-brass pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 sm:w-16 sm:h-16 border-l-2 border-b-2 border-washoku-brass pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 sm:w-16 sm:h-16 border-r-2 border-b-2 border-washoku-brass pointer-events-none" />

      <div className="absolute inset-0 washoku-noise opacity-[0.04] pointer-events-none" />

      <div className="relative p-6 sm:p-10">{children}</div>
    </motion.div>
  );
}
