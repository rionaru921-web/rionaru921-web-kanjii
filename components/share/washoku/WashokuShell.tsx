"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ChochinIcon from "@/components/shared/ChochinIcon";

// Page wrapper for the participant-facing share screens ("割烹の暖簾" theme).
// Deliberately independent from the operator dashboard's shared Logo/GoldButton —
// see the share-screen redesign scope notes for why those aren't reused here.
export function WashokuShell({
  eyebrow = "幹事さんから招待されました",
  children,
}: {
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="washoku px-4 py-10 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        className="relative flex items-center justify-center"
      >
        <div className="absolute inset-0 washoku-glow blur-xl scale-150 -z-10" />
        <ChochinIcon className="w-14 h-14 sm:w-16 sm:h-16" />
      </motion.div>

      <p className="mt-4 font-serif text-sm text-washoku-paper-muted">{eyebrow}</p>

      <div className="w-full max-w-lg mt-6 flex flex-col gap-6">{children}</div>

      <Link
        href="/"
        className="mt-10 font-serif text-xs text-washoku-brass hover:text-washoku-paper transition-colors"
      >
        〜 幹事ラボにて謹製 〜
      </Link>
    </div>
  );
}
