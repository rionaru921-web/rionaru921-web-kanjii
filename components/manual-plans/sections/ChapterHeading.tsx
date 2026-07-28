"use client";

import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

// Story-style section header shared by every chapter of the manual plan
// form. Fades in on scroll like the LP's landing sections (whileInView +
// viewport once), rather than firing all at once on mount.
export default function ChapterHeading({
  number,
  title,
  subtitle,
  icon: Icon,
  complete,
  action,
}: {
  number: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  complete?: boolean;
  action?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: reduceMotion ? 0.2 : 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="text-center mb-8"
    >
      {Icon && (
        <div className="mb-2 flex justify-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
            <Icon size={18} className="text-gold" />
          </span>
        </div>
      )}
      <p className="text-gold text-lg mb-2" aria-hidden>
        ◇
      </p>
      <p className="font-serif text-xs tracking-[0.3em] text-ink-muted mb-1.5">{number}</p>
      <h2 className="flex items-center justify-center gap-1.5 font-serif font-bold text-2xl sm:text-3xl text-ink">
        {title}
        <AnimatePresence>
          {complete && (
            <motion.span
              initial={{ scale: 0, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0.15 }
                  : { type: "spring", stiffness: 500, damping: 20 }
              }
              aria-hidden
            >
              <Sparkles size={18} className="text-gold" />
            </motion.span>
          )}
        </AnimatePresence>
      </h2>
      {subtitle && <p className="mt-2 text-sm text-ink-secondary">{subtitle}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </motion.div>
  );
}
