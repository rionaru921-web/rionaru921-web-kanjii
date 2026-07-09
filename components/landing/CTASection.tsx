"use client";

import { motion } from "framer-motion";
import GoldButton from "@/components/shared/GoldButton";

interface CTASectionProps {
  isLoggedIn: boolean;
}

export default function CTASection({ isLoggedIn }: CTASectionProps) {
  return (
    <section className="px-4 py-24 sm:py-32 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(196,99,63,0.14), transparent 70%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-2xl mx-auto text-center"
      >
        <h2 className="font-serif font-bold text-2xl sm:text-4xl text-ink mb-8 text-balance">
          今すぐ、幹事業務を
          <br className="sm:hidden" />
          手放しましょう
        </h2>
        <GoldButton href={isLoggedIn ? "/dashboard" : "/signup"} size="lg">
          {isLoggedIn ? "マイページへ" : "無料ではじめる"}
        </GoldButton>
      </motion.div>
    </section>
  );
}
