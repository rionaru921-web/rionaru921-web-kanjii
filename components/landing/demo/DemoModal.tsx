"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { useEscapeKey } from "@/lib/hooks/useEscapeKey";
import { useDemoState } from "./useDemoState";
import DemoHeader from "./DemoHeader";
import DemoFooter from "./DemoFooter";
import WelcomeScene from "./scenes/WelcomeScene";

const Step1PlanCreation = dynamic(() => import("./scenes/Step1PlanCreation"), { ssr: false });
const Step2Keisha = dynamic(() => import("./scenes/Step2Keisha"), { ssr: false });
const Step3Share = dynamic(() => import("./scenes/Step3Share"), { ssr: false });
const Step4Survey = dynamic(() => import("./scenes/Step4Survey"), { ssr: false });
const Step5Coach = dynamic(() => import("./scenes/Step5Coach"), { ssr: false });
const EndingScene = dynamic(() => import("./scenes/EndingScene"), { ssr: false });

const STEP_SCENES = [Step1PlanCreation, Step2Keisha, Step3Share, Step4Survey, Step5Coach];

interface DemoModalProps {
  onClose: () => void;
  isLoggedIn: boolean;
}

export default function DemoModal({ onClose, isLoggedIn }: DemoModalProps) {
  const { step, mode, setMode, next, prev, setStep, restart } = useDemoState();

  useScrollLock(true);
  useEscapeKey(true, onClose);

  function handleSelectMode(nextMode: typeof mode) {
    // See useDemoState.ts for the matching diagnostic logs on the timer side.
    console.log("[Demo] mode selected on Welcome screen", nextMode);
    setMode(nextMode);
    next();
  }

  const StepScene = step >= 0 && step <= 4 ? STEP_SCENES[step] : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-label="幹事ラボ 体験ツアー"
      >
        <DemoHeader step={step} mode={mode} onModeChange={setMode} onClose={onClose} />

        <div className="h-full flex items-center justify-center px-4 py-24 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full"
              aria-live="polite"
            >
              {step === -1 && <WelcomeScene onSelectMode={handleSelectMode} />}
              {StepScene && (
                <StepScene
                  autoPlay={mode === "auto"}
                  onInteraction={() => {
                    /* reserved for future analytics; interactions are purely local UI state today */
                  }}
                />
              )}
              {step === 5 && <EndingScene isLoggedIn={isLoggedIn} onRestart={restart} onClose={onClose} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {step >= 0 && step <= 4 && (
          <DemoFooter step={step} onPrev={prev} onNext={next} onSelectStep={(i) => setStep(i as typeof step)} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
