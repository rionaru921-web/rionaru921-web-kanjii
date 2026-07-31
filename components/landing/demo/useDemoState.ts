"use client";

import { useCallback, useState } from "react";

// -1: Welcome, 0-4: Step 1-5, 5: Ending
export type DemoStep = -1 | 0 | 1 | 2 | 3 | 4 | 5;

export function useDemoState() {
  const [step, setStep] = useState<DemoStep>(-1);

  const next = useCallback(() => {
    setStep((s) => (s < 5 ? ((s + 1) as DemoStep) : s));
  }, []);

  const prev = useCallback(() => {
    setStep((s) => (s > -1 ? ((s - 1) as DemoStep) : s));
  }, []);

  const restart = useCallback(() => {
    setStep(-1);
  }, []);

  return {
    step,
    setStep,
    next,
    prev,
    restart,
  };
}
