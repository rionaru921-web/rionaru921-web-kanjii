"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ChochinIcon from "@/components/shared/ChochinIcon";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { useEscapeKey } from "@/lib/hooks/useEscapeKey";

interface CompletionCelebrationProps {
  onSkip: () => void;
}

// Shown for ~2.5s after a new plan is created (ManualPlanForm.tsx owns the
// timer), then auto-navigates to the plan detail page. Deliberately no
// confetti/sound — just the lantern and serif type, matching the site's
// restrained tone (see Wave 15/16 "no flashy particles" guidance).
export default function CompletionCelebration({ onSkip }: CompletionCelebrationProps) {
  const reduceMotion = useReducedMotion();
  useScrollLock(true);
  useEscapeKey(true, onSkip);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0.15 : 0.4 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-md px-4"
        role="status"
        aria-live="polite"
      >
        <motion.div
          initial={{ scale: 0.9, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={
            reduceMotion
              ? { duration: 0.2 }
              : { type: "spring", stiffness: 200, damping: 20, delay: 0.15 }
          }
          className="text-center"
        >
          <motion.div
            animate={reduceMotion ? {} : { y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mb-6 flex justify-center"
          >
            <ChochinIcon className="w-20 h-20 sm:w-24 sm:h-24" />
          </motion.div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-surface-primary mb-2">
            プランが完成しました
          </h2>
          <p className="text-sm text-surface-primary/75 mb-8">
            共有URLをコピーして参加者に送りましょう
          </p>

          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-surface-primary/60 underline underline-offset-4 hover:text-surface-primary transition-colors"
          >
            今すぐ見る
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
