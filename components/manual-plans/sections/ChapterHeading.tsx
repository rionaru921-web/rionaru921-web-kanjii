"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Story-style section header shared by every chapter of the manual plan
// form. Fades in on scroll like the LP's landing sections (whileInView +
// viewport once), rather than firing all at once on mount.
export default function ChapterHeading({
  number,
  title,
  subtitle,
  action,
}: {
  number: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-center mb-8"
    >
      <p className="text-gold text-lg mb-2" aria-hidden>
        ◇
      </p>
      <p className="font-serif text-xs tracking-[0.3em] text-ink-muted mb-1.5">{number}</p>
      <h2 className="font-serif font-bold text-2xl sm:text-3xl text-ink">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-ink-secondary">{subtitle}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </motion.div>
  );
}
