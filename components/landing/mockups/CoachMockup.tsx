"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, TrendingUp } from "lucide-react";
import type { MockupProps } from "./mockupTypes";

// Step 3 of the real 5-question flow (lib/coaching/questions.ts) — the
// question text is copied verbatim, not invented. The answer choices below
// are illustrative only (the real question is free-text).
const STEP = 3;
const TOTAL_STEPS = 5;
const PERCENT = Math.round((STEP / TOTAL_STEPS) * 100);

const CHOICES = ["お店の雰囲気が良かった", "みんな楽しそうだった", "準備がスムーズだった"];

const CONTAINER_SIZE = {
  sm: "max-w-sm p-5",
  md: "max-w-md p-6",
  lg: "max-w-xl p-8",
};

export default function CoachMockup({ size = "md", autoPlay = true, onInteraction }: MockupProps = {}) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [phase, setPhase] = useState<"question" | "result">("question");

  function selectAnswer(choice: string) {
    setAnswer(choice);
    onInteraction?.({ type: "answer-select", label: choice });
  }

  function proceed() {
    if (!answer) return;
    setPhase("result");
    onInteraction?.({ type: "complete" });
  }

  const barEntrance = autoPlay
    ? { initial: { width: 0 }, whileInView: { width: `${PERCENT}%` }, viewport: { once: true, margin: "-40px" } }
    : { initial: { width: 0 }, animate: { width: `${PERCENT}%` } };

  const contentEntrance = autoPlay
    ? {
        initial: { opacity: 0, y: 8 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-40px" },
        transition: { duration: 0.4, delay: 0.2 },
      }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, delay: 0.2 },
      };

  return (
    <div className={`rounded-2xl border border-gold/20 bg-surface-tertiary shadow-warm-hover mx-auto ${CONTAINER_SIZE[size]}`}>
      <div className="mb-4 flex items-center gap-2 border-b border-gold/10 pb-3">
        <GraduationCap size={16} className="text-gold" />
        <span className="font-serif text-xs text-ink-muted">AI幹事コーチ</span>
      </div>

      <AnimatePresence mode="wait">
        {phase === "question" ? (
          <motion.div key="question">
            <div className="mb-4">
              <div className="flex items-center justify-between text-[11px] text-ink-muted">
                <span className="font-serif">ステップ {STEP}/{TOTAL_STEPS}</span>
                <span className="text-gold">{PERCENT}%</span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-gold/10">
                <motion.div {...barEntrance} transition={{ duration: 0.6, ease: "easeOut" }} className="h-full bg-gold-gradient" />
              </div>
            </div>

            <motion.div {...contentEntrance}>
              <p className="font-serif text-sm font-semibold text-ink mb-3">
                一番良かった点を教えてください
              </p>
              <div className="mb-3 rounded-lg border border-gold/20 bg-surface-secondary px-3 py-2.5 text-sm text-ink-muted min-h-[2.5rem]">
                {answer ?? "お店の雰囲気が..."}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CHOICES.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => selectAnswer(choice)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                      answer === choice ? "border-gold bg-gold/10 text-ink" : "border-gold/15 text-ink-secondary hover:border-gold/30"
                    }`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </motion.div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={proceed}
                disabled={!answer}
                className="inline-flex items-center rounded-full bg-gold-gradient px-4 py-1.5 text-xs font-semibold text-white transition-opacity disabled:opacity-40"
              >
                次へ →
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-3 py-4 text-center"
          >
            <TrendingUp size={28} className="text-gold" />
            <p className="text-sm text-ink-secondary">振り返り、お疲れさまでした</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full border border-gold/20 px-3 py-1 text-ink-muted line-through">Lv.1 幹事見習い</span>
              <span>→</span>
              <motion.span
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="rounded-full bg-gold-gradient px-3 py-1 font-semibold text-white"
              >
                Lv.2 一人前
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
