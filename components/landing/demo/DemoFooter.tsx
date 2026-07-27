"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import DemoProgressDots from "./DemoProgressDots";
import type { DemoStep } from "./useDemoState";

interface DemoFooterProps {
  step: DemoStep;
  onPrev: () => void;
  onNext: () => void;
  onSelectStep: (index: number) => void;
}

export default function DemoFooter({ step, onPrev, onNext, onSelectStep }: DemoFooterProps) {
  return (
    <div className="absolute bottom-0 inset-x-0 z-10 p-4 md:p-6 safe-area-bottom">
      <DemoProgressDots current={step} total={5} onSelect={onSelectStep} />
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={step === 0}
          className="flex items-center gap-1 min-h-[44px] px-3 text-sm text-surface-primary/80 transition-colors hover:text-surface-primary disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft size={18} />
          前へ
        </button>
        <span className="text-xs text-surface-primary/60">Step {step + 1} / 5</span>
        <button
          type="button"
          onClick={onNext}
          disabled={step === 4}
          className="flex items-center gap-1 min-h-[44px] px-3 text-sm text-surface-primary/80 transition-colors hover:text-surface-primary disabled:opacity-30 disabled:pointer-events-none"
        >
          次へ
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
