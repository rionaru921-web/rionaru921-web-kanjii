"use client";

import { useState } from "react";
import FeedbackModal from "@/components/feedback/FeedbackModal";
import { useToasts, ToastStack } from "@/components/ui/RealtimeToast";

export default function FooterFeedbackTrigger() {
  const [open, setOpen] = useState(false);
  const { toasts, pushToast } = useToasts();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 text-xs text-ink-muted hover:text-gold transition-colors underline underline-offset-4"
      >
        ご意見・不具合報告はこちら
      </button>

      {open && (
        <FeedbackModal
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            pushToast("フィードバックありがとうございます！");
          }}
        />
      )}
      <ToastStack toasts={toasts} />
    </>
  );
}
