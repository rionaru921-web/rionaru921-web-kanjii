"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

interface WelcomeSceneProps {
  onStart: () => void;
}

export default function WelcomeScene({ onStart }: WelcomeSceneProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center text-center max-w-md mx-auto"
    >
      <p className="text-gold text-lg mb-2" aria-hidden>
        ◇
      </p>
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-surface-primary mb-4">
        幹事ラボの体験ツアー、開始
      </h2>
      <p className="text-sm sm:text-base text-white/75 mb-8 leading-relaxed">
        プラン作成から振り返りまで、5つの章で幹事ラボの使い方をご紹介します。
      </p>

      <div className="flex w-full justify-center sm:w-auto">
        <button
          type="button"
          onClick={onStart}
          className="flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3.5 min-h-[44px] text-sm font-semibold text-white shadow-gold transition-opacity hover:opacity-90"
        >
          <Play size={16} />
          デモを始める
        </button>
      </div>
    </motion.div>
  );
}
