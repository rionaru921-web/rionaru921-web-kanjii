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
    // Temporary diagnostic logging (Wave 19-Fix) — left in deliberately so
    // real-device Safari testing can confirm from the Console tab whether
    // this effect fires at all, and with what values, instead of guessing
    // blind. Safe to remove once auto-play is confirmed reliable in the
    // field; harmless in production otherwise (console.log only).
    console.log("[Demo] effect fired", { step, mode, isPlaying });

    if (mode !== "auto" || !isPlaying) {
      console.log("[Demo] skip auto-play (mode or isPlaying)", { mode, isPlaying });
      return;
    }
    // Welcome (-1) and Ending (5) never auto-advance — the welcome screen
    // must wait for an explicit mode choice, and auto-advancing it on a
    // timer let a stale localStorage "manual" preference silently win a
    // race against the user's own "自動再生で見る" click (the click would
    // land after the timer had already moved past the welcome screen).
    if (step < 0 || step >= 5) {
      console.log("[Demo] no auto-play for step", step);
      return;
    }

    const duration = STEP_DURATIONS[step];
    console.log("[Demo] scheduling next step in", duration, "ms, from step", step);

    const timer = setTimeout(() => {
      console.log("[Demo] timer fired, advancing from step", step);
      // Defensive guard: only advance if `step` is still what this timer was
      // scheduled for. If some other path (footer nav, mode toggle) already
      // moved `step` on, this stale closure's `next` would otherwise still
      // fire and double-advance from a step the UI has already left.
      setStep((current) => (current === step ? ((step + 1) as DemoStep) : current));
    }, duration);

    return () => {
      console.log("[Demo] cleanup timer for step", step);
      clearTimeout(timer);
    };
  }, [step, mode, isPlaying]);

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
