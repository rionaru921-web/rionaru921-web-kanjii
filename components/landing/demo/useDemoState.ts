"use client";

import { useCallback, useEffect, useState } from "react";

export type DemoMode = "auto" | "manual";
// -1: Welcome, 0-4: Step 1-5, 5: Ending
export type DemoStep = -1 | 0 | 1 | 2 | 3 | 4 | 5;

const MODE_STORAGE_KEY = "kanji-lab-demo-mode";

// No entry for -1 (Welcome) or 5 (Ending) — both are excluded from the
// auto-advance effect below and must only ever be left via an explicit
// button click, never a timer.
const STEP_DURATIONS: Record<DemoStep, number> = {
  [-1]: 0,
  0: 20000,
  1: 20000,
  2: 15000,
  3: 20000,
  4: 15000,
  5: 0,
};

function readStoredMode(): DemoMode {
  if (typeof window === "undefined") return "auto";
  const stored = window.localStorage.getItem(MODE_STORAGE_KEY);
  return stored === "manual" ? "manual" : "auto";
}

export function useDemoState() {
  const [step, setStep] = useState<DemoStep>(-1);
  const [mode, setModeState] = useState<DemoMode>("auto");
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    setModeState(readStoredMode());
  }, []);

  const setMode = useCallback((next: DemoMode) => {
    setModeState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MODE_STORAGE_KEY, next);
    }
  }, []);

  const next = useCallback(() => {
    setStep((s) => (s < 5 ? ((s + 1) as DemoStep) : s));
  }, []);

  const prev = useCallback(() => {
    setStep((s) => (s > -1 ? ((s - 1) as DemoStep) : s));
  }, []);

  const restart = useCallback(() => {
    setStep(-1);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (mode !== "auto" || !isPlaying) return;
    // Welcome (-1) and Ending (5) never auto-advance — the welcome screen
    // must wait for an explicit mode choice, and auto-advancing it on a
    // timer let a stale localStorage "manual" preference silently win a
    // race against the user's own "自動再生で見る" click (the click would
    // land after the timer had already moved past the welcome screen).
    if (step < 0 || step >= 5) return;
    const timer = setTimeout(next, STEP_DURATIONS[step]);
    return () => clearTimeout(timer);
  }, [step, mode, isPlaying, next]);

  return {
    step,
    setStep,
    mode,
    setMode,
    isPlaying,
    setIsPlaying,
    next,
    prev,
    restart,
  };
}
