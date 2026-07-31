"use client";

import { X } from "lucide-react";

interface DemoHeaderProps {
  onClose: () => void;
}

export default function DemoHeader({ onClose }: DemoHeaderProps) {
  return (
    <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between gap-3 p-4 md:p-6 safe-area-top">
      <div className="font-serif text-sm sm:text-base text-surface-primary">幹事ラボ 体験ツアー</div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="デモを閉じる"
          className="flex h-11 w-11 items-center justify-center rounded-full text-white/70 transition-colors hover:text-surface-primary hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
