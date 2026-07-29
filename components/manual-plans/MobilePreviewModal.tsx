"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { useEscapeKey } from "@/lib/hooks/useEscapeKey";
import PlanPreview from "./PlanPreview";

interface MobilePreviewModalProps {
  onClose: () => void;
  previewProps: React.ComponentProps<typeof PlanPreview>;
}

export default function MobilePreviewModal({ onClose, previewProps }: MobilePreviewModalProps) {
  useScrollLock(true);
  useEscapeKey(true, onClose);
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-label="プランのプレビュー"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full sm:max-w-md max-h-[85dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl safe-area-bottom"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between bg-surface-secondary/95 backdrop-blur-sm px-4 py-3 border-b border-gold/10 rounded-t-3xl sm:rounded-t-3xl">
            <span className="font-serif text-sm font-semibold text-ink">プレビュー</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="閉じる"
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:text-ink hover:bg-gold/5 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4 bg-surface-secondary">
            <PlanPreview {...previewProps} />
            <p className="mt-3 text-center text-xs text-ink-muted">参加者に見える完成イメージです</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
