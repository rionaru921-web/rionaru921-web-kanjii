"use client";

import { motion } from "framer-motion";
import type { HowToStepData } from "@/lib/how-to-steps";
import FormMiniMockup from "@/components/landing/mockups/FormMiniMockup";
import ShareMiniMockup from "@/components/landing/mockups/ShareMiniMockup";
import CoachMiniMockup from "@/components/landing/mockups/CoachMiniMockup";

const MOCKUPS = {
  form: FormMiniMockup,
  share: ShareMiniMockup,
  coach: CoachMiniMockup,
} as const;

interface HowToStepProps {
  step: HowToStepData;
}

export default function HowToStep({ step }: HowToStepProps) {
  const Icon = step.icon;
  const Mockup = MOCKUPS[step.mockup];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center text-center"
    >
      <Mockup />

      <span className="font-display-num text-5xl md:text-6xl text-gold-gradient opacity-70 mt-8 leading-none">
        {String(step.step).padStart(2, "0")}
      </span>

      <div className="mt-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
        <Icon className="h-6 w-6 text-gold" />
      </div>

      <h3 className="font-serif text-2xl md:text-3xl font-semibold text-ink mt-4">
        ステップ{step.step}: {step.title}
      </h3>
      <p className="mt-3 max-w-md text-ink-secondary leading-relaxed">{step.description}</p>
    </motion.div>
  );
}
