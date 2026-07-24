"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Story() {
  return (
    <section className="px-4 py-24 sm:py-32">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="relative order-2 md:order-1"
        >
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-warm">
            <Image
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80"
              alt="仲間との温かい時間"
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover"
              style={{ filter: "sepia(0.05) saturate(1.1)" }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="order-1 md:order-2"
        >
          <span className="text-xs tracking-[0.2em] text-gold font-serif uppercase mb-4 block">
            Our Story
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-ink mb-6 text-balance leading-relaxed">
            あなたの時間を、
            <br />
            あなたに返します。
          </h2>
          <div className="flex flex-col gap-4 text-ink-secondary leading-relaxed text-sm sm:text-base">
            <p>
              お店選び、日程調整、参加費の計算。幹事を引き受けるたびに、気づけば何時間も費やしていませんか。
            </p>
            <p>
              幹事ラボは、その悩みをシンプルにするための場所です。人数・予算・希望を整理するだけで、プランと費用分担がかたちになります。
            </p>
            <p className="text-ink font-medium">
              浮いた時間は、もっと大事なことに。乾杯の準備は、私たちにお任せください。
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
