"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import MizuhikiDivider from "@/components/shared/MizuhikiDivider";

const FAQS = [
  {
    q: "Kanjiiは無料で使えますか？",
    a: "はい。Freeプランでは月3回まで無料で検索・プラン作成が可能です。より多く使いたい場合はPremiumプラン（月額490円）をご利用ください。",
  },
  {
    q: "対応地域はどこですか？",
    a: "現在は全国主要都市に対応しています。飲み会・旅行ともに順次エリアを拡大中です。",
  },
  {
    q: "個人情報は安全ですか？",
    a: "お預かりした情報は暗号化して管理し、第三者への提供は行いません。安心してご利用いただけます。",
  },
  {
    q: "予約もKanjiiが取ってくれますか？",
    a: "現在はプラン提案までが対応範囲です。予約代行機能は今後のアップデートで提供予定です。",
  },
  {
    q: "解約はいつでもできますか？",
    a: "はい、いつでも解約可能です。違約金などは一切かかりません。",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="px-4 py-24 sm:py-32 bg-surface-secondary">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-ink mb-4">
            よくある質問
          </h2>
          <MizuhikiDivider />
        </div>

        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.q}
                className={`rounded-2xl bg-surface-tertiary overflow-hidden shadow-warm transition-shadow ${
                  isOpen ? "border-l-4 border-gold" : "border-l-4 border-transparent"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span
                    className={`font-serif text-sm sm:text-base font-medium ${
                      isOpen ? "text-gold" : "text-ink"
                    }`}
                  >
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-gold transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm text-ink-secondary leading-relaxed border-t border-gold/10 pt-3">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
