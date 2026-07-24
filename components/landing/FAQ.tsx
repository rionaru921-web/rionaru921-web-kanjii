"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import MizuhikiDivider from "@/components/shared/MizuhikiDivider";

const CIRCLED_NUMERALS = ["①", "②", "③", "④", "⑤"];

const FAQ_CATEGORIES = [
  {
    heading: "使い方の基本",
    items: [
      {
        q: "幹事初心者ですが使えますか？",
        a: "はい。プラン作成の各ステップがガイドされます。ゲストモードで無料お試しもできます。",
      },
      {
        q: "参加者もアカウント登録必要ですか？",
        a: "不要です。共有URLをクリックするだけで参加できます。",
      },
      {
        q: "どんな集まりで使えますか？",
        a: "飲み会・旅行・歓迎会・送別会・忘年会・新年会など、あらゆる集まりに対応しています。",
      },
    ],
  },
  {
    heading: "お店提案",
    items: [
      {
        q: "お店提案(AI補助)はどのように行われますか？",
        a: "参加人数・予算・雰囲気を伝えると、AIがお店候補・タイムテーブルを提案します。最終的な決定は幹事であるあなたが行えます。",
      },
      {
        q: "提案されたプランは編集できますか？",
        a: "はい、全て後から自由に編集できます。",
      },
    ],
  },
  {
    heading: "傾斜割り",
    items: [
      {
        q: "傾斜割りって何ですか？",
        a: "「上司は多め、後輩は少なめ」等、役職・年齢に応じて支払額を調整する集金方法です。",
      },
      {
        q: "幹事の負担はどれくらい軽減されますか？",
        a: "各人の金額計算・端数調整・共有まで全部自動化。1つずつ電卓を叩く必要がなくなります。",
      },
      {
        q: "100円単位以外の丸めもできますか？",
        a: "100円・500円・1000円から選べます。",
      },
    ],
  },
  {
    heading: "共有・出欠管理",
    items: [
      {
        q: "LINEで共有できますか？",
        a: "はい、URL共有・LINE共有・PDF出力・QRコード・iCalに対応しています。",
      },
      {
        q: "出欠管理はどう使いますか？",
        a: "参加者が共有URLから○/△/×で回答し、幹事は集計をダッシュボードで確認できます。",
      },
    ],
  },
  {
    heading: "料金・アカウント",
    items: [
      {
        q: "無料で使えますか？",
        a: "はい、基本機能は全て無料でお使いいただけます。",
      },
      {
        q: "ゲストモードとアカウント登録の違いは？",
        a: "ゲストモードは48時間後にデータが削除され、お店提案(AI補助)は3回までです。アカウント登録で無制限にご利用いただけます。",
      },
      {
        q: "途中でアカウント登録に切り替えられますか？",
        a: "はい、ゲストで作ったプランはそのまま引き継げます。",
      },
    ],
  },
];

export default function FAQ() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_CATEGORIES.flatMap((cat) =>
      cat.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      }))
    ),
  };

  return (
    <section id="faq" className="px-4 py-24 sm:py-32 bg-surface-secondary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-ink mb-4">
            よくある質問
          </h2>
          <MizuhikiDivider />
        </div>

        <div className="flex flex-col gap-10">
          {FAQ_CATEGORIES.map((cat, catIndex) => (
            <div key={cat.heading}>
              <div className="flex items-center gap-2.5 mb-4">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-gradient font-serif font-bold text-white text-sm"
                  aria-hidden
                >
                  {CIRCLED_NUMERALS[catIndex] ?? catIndex + 1}
                </span>
                <h3 className="font-serif font-bold text-ink text-base">{cat.heading}</h3>
              </div>

              <div className="flex flex-col gap-3">
                {cat.items.map((faq) => {
                  const key = `${cat.heading}-${faq.q}`;
                  const isOpen = openKey === key;
                  return (
                    <div
                      key={key}
                      className={`rounded-2xl bg-surface-tertiary overflow-hidden shadow-warm transition-shadow ${
                        isOpen ? "border-l-4 border-gold" : "border-l-4 border-transparent"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenKey(isOpen ? null : key)}
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
          ))}
        </div>
      </div>
    </section>
  );
}
