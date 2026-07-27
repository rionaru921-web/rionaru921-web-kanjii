"use client";

import { X } from "lucide-react";
import ModeToggle from "./ModeToggle";
import type { DemoMode, DemoStep } from "./useDemoState";

interface DemoHeaderProps {
  step: DemoStep;
  mode: DemoMode;
  onModeChange: (mode: DemoMode) => void;
  onClose: () => void;
}

export default function DemoHeader({ step, mode, onModeChange, onClose }: DemoHeaderProps) {
  return (
    <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between gap-3 p-4 md:p-6 safe-area-top">
      <div className="font-serif text-sm sm:text-base text-surface-primary">幹事ラボ 体験ツアー</div>
      <div className="flex items-center gap-2">
        {step >= 0 && step <= 4 && <ModeToggle mode={mode} onChange={onModeChange} />}
        <button
          type="button"
          onClick={onClose}
          aria-label="デモを閉じる"
          className="flex h-11 w-11 items-center justify-center rounded-full text-surface-primary/70 transition-colors hover:text-surface-primary hover:bg-surface-primary/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
