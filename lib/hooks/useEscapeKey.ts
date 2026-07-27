"use client";

import { useEffect } from "react";

// Also a first-time addition — no Escape-key handling exists anywhere in
// the codebase yet (grepped for "Escape" / keyCode 27, zero hits).
export function useEscapeKey(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onEscape();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, onEscape]);
}
