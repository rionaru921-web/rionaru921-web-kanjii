"use client";

import { useCallback } from "react";

// The fixed action bar (ManualPlanForm) and FloatingBottomNav stack up at
// the bottom of the mobile viewport, and neither reliably repositions when
// the iOS keyboard opens. Scrolling the focused field to the center of the
// (now-shrunk) viewport keeps it clear of both without touching desktop,
// where the field is already visible and this is a no-op.
export function useScrollIntoViewOnFocus() {
  return useCallback((e: React.FocusEvent<HTMLElement>) => {
    if (window.innerWidth >= 640) return;
    const target = e.target;
    setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  }, []);
}
