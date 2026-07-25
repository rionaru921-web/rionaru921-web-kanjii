"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { FaqQuestion } from "@/lib/faq";

interface FaqItemProps {
  item: FaqQuestion;
}

export default function FaqItem({ item }: FaqItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-gold/20 bg-surface-tertiary overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gold/5 transition-colors"
        aria-expanded={open}
      >
        <span className="font-serif text-ink font-medium">{item.question}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-gold" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 pt-1 text-sm text-ink-secondary leading-relaxed border-t border-gold/10">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
