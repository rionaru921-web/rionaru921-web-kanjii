"use client";

import { motion } from "framer-motion";
import { Globe, Unlock, Zap } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const POINTS = [
  { icon: Globe, label: "ブラウザで完結" },
  { icon: Unlock, label: "会員登録不要" },
  { icon: Zap, label: "アプリDL不要" },
];

export default function NoLoginBanner() {
  return (
    <section className="py-16 md:py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="relative overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/5 via-surface-secondary to-surface-primary p-8 md:p-12 text-center shadow-warm-hover"
        >
          <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />

          <motion.p variants={fadeInUp} className="text-gold text-2xl mb-4" aria-hidden>
            ◇
          </motion.p>

          <motion.h2
            variants={fadeInUp}
            className="font-serif text-2xl md:text-3xl font-semibold text-ink text-balance mb-6"
          >
            すぐ使える。登録は、あとから。
          </motion.h2>

          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 md:gap-x-6 mb-6"
          >
            {POINTS.map((point, i) => (
              <span key={point.label} className="inline-flex items-center gap-4 md:gap-6">
                {i > 0 && (
                  <span className="hidden text-ink-muted sm:inline" aria-hidden>
                    ·
                  </span>
                )}
                <span className="inline-flex items-center gap-2 text-ink">
                  <point.icon className="h-5 w-5 text-gold" aria-hidden />
                  <span className="font-serif">{point.label}</span>
                </span>
              </span>
            ))}
          </motion.div>

          <motion.p variants={fadeInUp} className="text-ink-secondary text-base md:text-lg mb-2">
            30秒で、幹事プランを完成。
          </motion.p>

          <motion.p variants={fadeInUp} className="text-ink-muted text-sm">
            保存や履歴確認をしたくなったら、そこで初めて登録。
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
