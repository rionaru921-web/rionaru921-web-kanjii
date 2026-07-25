"use client";

import { motion } from "framer-motion";
import { FEATURES } from "@/lib/features";
import { fadeInUp } from "@/lib/animations";
import FeatureRow from "@/components/landing/FeatureRow";

export default function FeatureShowcase() {
  return (
    <section className="py-20 md:py-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-16 md:mb-24"
        >
          <p className="text-gold text-2xl mb-3" aria-hidden>
            ◇
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink">
            機能で選ぶ、幹事ラボ
          </h2>
          <p className="mt-3 text-ink-secondary text-sm md:text-base">
            一つひとつが、幹事の負担を減らすために。
          </p>
        </motion.div>

        <div className="space-y-20 md:space-y-32">
          {FEATURES.map((feature, index) => (
            <FeatureRow key={feature.id} feature={feature} reverse={index % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
