"use client";

import { useEffect } from "react";

// No modal in this codebase locks body scroll yet (grepped — zero hits for
// body.style.overflow anywhere). The demo modal is full-screen and long-lived
// enough that background scroll bleeding through would be jarring, so this
// is a first-time addition rather than a reuse of an existing pattern.
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}
