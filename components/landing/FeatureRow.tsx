"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import type { Feature } from "@/lib/features";
import KeishaMockup from "@/components/landing/mockups/KeishaMockup";
import CalendarMockup from "@/components/landing/mockups/CalendarMockup";
import ShareMockup from "@/components/landing/mockups/ShareMockup";
import CoachMockup from "@/components/landing/mockups/CoachMockup";

const MOCKUPS = {
  keisha: KeishaMockup,
  calendar: CalendarMockup,
  share: ShareMockup,
  coach: CoachMockup,
} as const;

interface FeatureRowProps {
  feature: Feature;
  reverse: boolean;
}

export default function FeatureRow({ feature, reverse }: FeatureRowProps) {
  const Icon = feature.icon;
  const Mockup = MOCKUPS[feature.mockup];
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const mockupX = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    reverse ? [30, 0, 0, -20] : [-30, 0, 0, 20]
  );
  const mockupOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.4, 1, 1, 0.6]);
  const reduceMotion = useReducedMotion();

  return (
    <div ref={ref} className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={reverse ? "md:order-2" : ""}
      >
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gold/10">
          <Icon className="h-7 w-7 text-gold" />
        </div>
        <h3 className="font-serif text-2xl md:text-3xl font-semibold text-ink leading-tight mb-4">
          {feature.title}
        </h3>
        <p className="text-ink-secondary text-base md:text-lg leading-relaxed">
          {feature.subtitle}
        </p>
      </motion.div>

      <motion.div
        style={reduceMotion ? undefined : { x: mockupX, opacity: mockupOpacity, willChange: "transform" }}
        className={reverse ? "md:order-1" : ""}
      >
        <Mockup />
      </motion.div>
    </div>
  );
}
