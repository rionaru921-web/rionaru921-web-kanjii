"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import UnifiedCalendar from "./UnifiedCalendar";
import type { CalendarValue } from "@/lib/calendar/types";

interface CalendarPopoverProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  showTimeSelector?: boolean;
  disabled?: boolean;
  className?: string;
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

export default function CalendarPopover({
  value,
  onChange,
  placeholder = "日時を選択",
  minDate,
  showTimeSelector = true,
  disabled,
  className,
}: CalendarPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date | null>(value);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!open) return;
    setDraft(value);
  }, [open, value]);

  // Desktop dropdown is portaled to <body> to escape ancestor overflow-hidden
  // clipping (e.g. accordion sections), so its position must be tracked
  // manually off the trigger's viewport rect instead of via CSS `absolute`.
  useEffect(() => {
    if (!open) return;
    function updateRect() {
      if (triggerRef.current) setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleConfirm() {
    onChange(draft);
    setOpen(false);
  }

  function handleCancel() {
    setDraft(value);
    setOpen(false);
  }

  const displayText = value
    ? format(value, showTimeSelector ? "yyyy/MM/dd HH:mm" : "yyyy/MM/dd")
    : placeholder;

  const panel = open && (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-ink/40 sm:hidden"
        onClick={handleCancel}
      />
      <motion.div
        ref={panelRef}
        initial={isMobile ? { y: "100%" } : { opacity: 0, y: -8 }}
        animate={isMobile ? { y: 0 } : { opacity: 1, y: 0 }}
        exit={isMobile ? { y: "100%" } : { opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        style={
          !isMobile && triggerRect
            ? { position: "fixed", top: triggerRect.bottom + 8, left: triggerRect.left, zIndex: 50 }
            : undefined
        }
        className={
          isMobile
            ? "fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-surface-tertiary p-5 shadow-gold-lg"
            : "rounded-2xl bg-surface-tertiary p-4 shadow-gold-lg"
        }
      >
        <UnifiedCalendar
          mode="single"
          value={draft}
          onChange={(v: CalendarValue) => setDraft(v as Date | null)}
          minDate={minDate}
          showTimeSelector={showTimeSelector}
          size={isMobile ? "lg" : "md"}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-xl border border-gold/15 px-4 py-2 text-sm text-ink-secondary hover:bg-gold/5 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-xl bg-gold-gradient px-4 py-2 text-sm font-semibold text-white shadow-gold hover:opacity-90 transition-opacity"
          >
            確定
          </button>
        </div>
      </motion.div>
    </>
  );

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className={
          className ||
          `flex w-full items-center gap-2 rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-left outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50 ${
            value ? "text-ink" : "text-ink-muted"
          }`
        }
      >
        <CalendarDays size={16} className="shrink-0 text-gold" />
        {displayText}
      </button>

      {typeof document !== "undefined" &&
        createPortal(<AnimatePresence>{panel}</AnimatePresence>, document.body)}
    </div>
  );
}
