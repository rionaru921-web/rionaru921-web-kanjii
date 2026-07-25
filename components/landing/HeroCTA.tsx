"use client";

import { motion } from "framer-motion";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

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
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-gold-gradient text-white font-bold shadow-gold hover:shadow-gold-lg transition-shadow duration-200 text-lg py-5 px-10 disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 size={22} className="animate-spin" />
          準備中...
        </>
      ) : (
        <>
          <Sparkles size={22} />
          今すぐ幹事する
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex"
          >
            <ArrowRight size={18} />
          </motion.span>
        </>
      )}
    </motion.button>
  );
}
