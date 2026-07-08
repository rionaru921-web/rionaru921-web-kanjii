"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import MizuhikiDivider from "@/components/shared/MizuhikiDivider";
import GoldButton from "@/components/shared/GoldButton";

const PLANS = [
  {
    name: "Free",
    price: "¥0",
    period: "/月",
    features: ["月3回まで検索", "基本機能", "広告表示"],
    highlighted: false,
  },
  {
    name: "Premium",
    price: "¥490",
    period: "/月",
    features: [
      "無制限利用",
      "AI提案フル機能",
      "広告なし",
      "履歴無制限保存",
      "優先サポート",
    ],
    highlighted: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="px-4 py-24 sm:py-32">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-ink mb-4">
            料金プラン
          </h2>
          <MizuhikiDivider />
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 flex flex-col bg-surface-tertiary ${
                plan.highlighted
                  ? "border-2 border-gold shadow-warm-hover"
                  : "border border-gold/15 shadow-warm"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-wider rounded-full bg-gold-gradient text-white px-3.5 py-1.5 shadow-warm">
                  BEST VALUE
                </span>
              )}

              <h3 className="font-serif font-bold text-lg text-ink mb-1">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display-num font-black text-5xl text-ink">
                  {plan.price}
                </span>
                <span className="text-sm text-ink-muted">{plan.period}</span>
              </div>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-ink-secondary">
                    <Check size={16} className="text-gold shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <GoldButton
                href="/signup"
                variant={plan.highlighted ? "solid" : "outline"}
                fullWidth
              >
                {plan.highlighted ? "Premiumを試す" : "無料ではじめる"}
              </GoldButton>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
