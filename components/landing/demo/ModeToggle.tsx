"use client";

import { Play, MousePointerClick } from "lucide-react";
import type { DemoMode } from "./useDemoState";

interface ModeToggleProps {
  mode: DemoMode;
  onChange: (mode: DemoMode) => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 p-1">
      <button
        type="button"
        onClick={() => onChange("auto")}
        aria-pressed={mode === "auto"}
        className={`flex items-center gap-1.5 rounded-full px-3 py-2 min-h-[36px] text-xs font-medium transition-colors ${
          mode === "auto"
            ? "bg-gold-gradient text-white"
            : "text-white/70 hover:text-surface-primary"
        }`}
      >
        <Play size={12} />
        自動再生
      </button>
      <button
        type="button"
        onClick={() => onChange("manual")}
        aria-pressed={mode === "manual"}
        className={`flex items-center gap-1.5 rounded-full px-3 py-2 min-h-[36px] text-xs font-medium transition-colors ${
          mode === "manual"
            ? "bg-gold-gradient text-white"
            : "text-white/70 hover:text-surface-primary"
        }`}
      >
        <MousePointerClick size={12} />
        手動
      </button>
    </div>
  );
}
