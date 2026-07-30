"use client";

import { motion } from "framer-motion";
import { MousePointerClick, Play } from "lucide-react";
import type { DemoMode } from "../useDemoState";

interface WelcomeSceneProps {
  onSelectMode: (mode: DemoMode) => void;
}

export default function WelcomeScene({ onSelectMode }: WelcomeSceneProps) {
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

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => onSelectMode("auto")}
          className="flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3.5 min-h-[44px] text-sm font-semibold text-white shadow-gold transition-opacity hover:opacity-90"
        >
          <Play size={16} />
          自動再生で見る
        </button>
        <button
          type="button"
          onClick={() => onSelectMode("manual")}
          className="flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3.5 min-h-[44px] text-sm font-semibold text-surface-primary transition-colors hover:border-white/60"
        >
          <MousePointerClick size={16} />
          手動で進める
        </button>
      </div>
    </motion.div>
  );
}
