"use client";

import { motion } from "framer-motion";
import UseCaseCard from "@/components/landing/UseCaseCard";
import { USE_CASES } from "@/lib/use-cases";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function UseCases() {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-gold text-2xl mb-3" aria-hidden>
            ◇
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink">
            こんな場面で、選ばれています
          </h2>
          <p className="mt-3 text-ink-secondary text-sm md:text-base">
            幹事の一大事も、日常の集まりも。
          </p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0"
        >
          {USE_CASES.map((useCase, i) => (
            <motion.div
              key={useCase.id}
              variants={fadeInUp}
              className="w-[85vw] max-w-80 shrink-0 snap-start md:w-96"
            >
              <UseCaseCard useCase={useCase} index={i} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
