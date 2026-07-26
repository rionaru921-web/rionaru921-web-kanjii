"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionTitle({
  title,
  subtitle,
  className = "mb-12 md:mb-16",
}: SectionTitleProps) {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      className={`text-center ${className}`}
    >
      <p className="text-gold text-2xl mb-3" aria-hidden>
        ◇
      </p>
      <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink">{title}</h2>
      {subtitle && <p className="mt-3 text-ink-secondary text-sm md:text-base">{subtitle}</p>}
    </motion.div>
  );
}
