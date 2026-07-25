"use client";

import { motion } from "framer-motion";
import UseCaseMockup from "@/components/landing/UseCaseMockup";
import type { UseCase } from "@/lib/use-cases";

interface UseCaseCardProps {
  useCase: UseCase;
  index: number;
}

export default function UseCaseCard({ useCase, index }: UseCaseCardProps) {
  const Icon = useCase.icon;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex h-full flex-col rounded-2xl border border-gold/20 bg-surface-secondary p-6 md:p-8 transition-colors hover:border-gold/40 hover:shadow-warm-hover"
    >
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gold/10">
        <Icon className="h-7 w-7 text-gold" />
      </div>

      <h3 className="font-serif text-xl md:text-2xl font-semibold text-ink mb-2">
        {useCase.title}
      </h3>

      <p className="text-ink-secondary text-sm md:text-base leading-relaxed mb-6">
        {useCase.copy}
      </p>

      <div className="mt-auto">
        <UseCaseMockup mockup={useCase.mockup} delay={index * 0.08} />
      </div>
    </motion.div>
  );
}
