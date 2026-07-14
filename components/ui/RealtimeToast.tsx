"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export interface ToastItem {
  id: number;
  message: string;
}

const MAX_TOASTS = 3;
const TOAST_DURATION_MS = 4000;

// Shared by the participant-side save confirmation (AttendanceForm) and the
// organizer-side Realtime member-update notification (MemberList) — both
// just need a stack of transient messages, nothing route-specific.
export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const pushToast = useCallback((message: string) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev.slice(-(MAX_TOASTS - 1)), { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  return { toasts, pushToast };
}

export function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 rounded-xl border border-gold/20 bg-surface-tertiary shadow-warm px-4 py-2.5 text-sm text-ink max-w-xs"
          >
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
