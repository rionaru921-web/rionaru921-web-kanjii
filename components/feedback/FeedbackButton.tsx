"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import FeedbackModal from "./FeedbackModal";
import { useToasts, ToastStack } from "@/components/ui/RealtimeToast";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const { toasts, pushToast } = useToasts();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="フィードバックを送る"
        className="fixed bottom-24 right-4 sm:right-6 z-40 flex h-12 w-12 items-center justify-center gap-2 rounded-full bg-gold-gradient text-white shadow-gold-lg transition-all hover:brightness-110 sm:h-auto sm:w-auto sm:px-5 sm:py-3"
      >
        <MessageCircle size={20} />
        <span className="hidden text-sm font-semibold sm:inline">フィードバック</span>
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
