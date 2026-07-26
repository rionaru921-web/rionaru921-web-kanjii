"use client";

import { motion } from "framer-motion";
import { ArrowRight, Loader2, Unlock } from "lucide-react";

interface HeroCTAProps {
  onClick: () => void;
  loading: boolean;
}

export default function HeroCTA({ onClick, loading }: HeroCTAProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label="今すぐ試す（ログイン不要）"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-gold-gradient text-white font-bold shadow-gold hover:shadow-gold-lg transition-shadow duration-200 text-lg py-5 px-10 disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 size={22} className="animate-spin" aria-hidden />
          準備中...
        </>
      ) : (
        <>
          <Unlock size={22} aria-hidden />
          <span>
            今すぐ試す<span className="whitespace-nowrap">（ログイン不要）</span>
          </span>
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex"
          >
            <ArrowRight size={18} aria-hidden />
          </motion.span>
        </>
      )}
    </motion.button>
  );
}
