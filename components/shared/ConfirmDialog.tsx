"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full sm:max-w-sm bg-surface-tertiary shadow-warm-hover rounded-t-3xl sm:rounded-3xl p-6"
        >
          <h3 className="font-serif font-bold text-lg text-ink">{title}</h3>
          <p className="mt-2 text-sm text-ink-secondary leading-relaxed">{message}</p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-gold/15 bg-surface-tertiary py-2.5 text-sm font-medium text-ink transition-colors hover:bg-gold/5"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 rounded-xl bg-gold-gradient py-2.5 text-sm font-semibold text-white shadow-gold transition-opacity hover:opacity-90"
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
