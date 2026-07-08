"use client";

import { motion } from "framer-motion";
import { ClipboardList, Sparkles, Share2 } from "lucide-react";
import MizuhikiDivider from "@/components/shared/MizuhikiDivider";

const STEPS = [
  {
    number: "01",
    icon: ClipboardList,
    title: "希望を入力",
    description: "人数・予算・日時を入力するだけ",
    bg: "bg-surface",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AIが最適プランを提案",
    description: "何百もの選択肢から、あなたに合う組み合わせを厳選",
    bg: "bg-surface-secondary",
  },
  {
    number: "03",
    icon: Share2,
    title: "ワンクリックで共有",
    description: "PDFでスマートに参加者へ",
    bg: "bg-surface-warm",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-24 sm:py-32">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-ink mb-4">
            使い方は、たったの3ステップ
          </h2>
          <MizuhikiDivider />
        </div>

        <div className="grid sm:grid-cols-3 gap-6 md:gap-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative text-center px-6 py-10 rounded-3xl ${step.bg} shadow-warm`}
              >
                <span className="font-display-num block font-black text-7xl text-gold-gradient opacity-80 mb-2 leading-none">
                  {step.number}
                </span>
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-tertiary text-gold mb-4 shadow-warm">
                  <Icon size={22} />
                </span>
                <h3 className="font-serif font-bold text-lg text-ink mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
