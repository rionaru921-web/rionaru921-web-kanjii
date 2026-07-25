"use client";

import { motion } from "framer-motion";
import { HOW_TO_STEPS } from "@/lib/how-to-steps";
import { fadeInUp } from "@/lib/animations";
import HowToStep from "@/components/landing/HowToStep";

export default function HowToGuide() {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <p className="text-gold text-2xl mb-3" aria-hidden>
            ◇
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink">
            実際の画面で、もう少し詳しく。
          </h2>
          <p className="mt-3 text-ink-secondary text-sm md:text-base">
            迷わず幹事を、この一画面で。
          </p>
        </motion.div>

        <div className="space-y-16 md:space-y-24">
          {HOW_TO_STEPS.map((step) => (
            <HowToStep key={step.step} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}
