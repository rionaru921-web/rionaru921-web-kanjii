"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeInUp } from "@/lib/animations";

interface SceneLayoutProps {
  chapterLabel: string;
  title: string;
  description: ReactNode;
  hint?: string;
  children: ReactNode;
}

export default function SceneLayout({ chapterLabel, title, description, hint, children }: SceneLayoutProps) {
  return (
    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center w-full max-w-4xl mx-auto">
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="text-center md:text-left order-2 md:order-1"
      >
        <p className="text-gold text-sm mb-1" aria-hidden>
          ◇
        </p>
        <p className="font-serif text-xs tracking-[0.25em] text-surface-primary/60 mb-2">{chapterLabel}</p>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-surface-primary mb-4">{title}</h3>
        <p className="text-sm sm:text-base text-surface-primary/75 leading-relaxed">{description}</p>
        {hint && <p className="mt-4 text-xs text-gold/90">↗ {hint}</p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
        className="order-1 md:order-2 w-full flex justify-center"
      >
        {children}
      </motion.div>
    </div>
  );
}
