"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import MizuhikiDivider from "@/components/shared/MizuhikiDivider";

const REVIEWS = [
  {
    name: "M.T.さん",
    meta: "都内IT企業",
    body: "毎回の飲み会幹事が憂鬱でしたが、Kanjiiに任せたら5分でお店が決まりました。割り勘の計算まで自動なので、もう手放せません。",
    initial: "M",
  },
  {
    name: "H.S.さん",
    meta: "都内大学生",
    body: "サークル旅行の計画で大活躍。行き先を入れるだけでプランが出てくるので、みんなの意見をまとめる時間が要らなくなりました。",
    initial: "H",
  },
  {
    name: "M.S.さん",
    meta: "30代・主婦",
    body: "ママ友との集まりの予算調整がいつも大変でしたが、費用分担がきれいに出るので気を遣わずに済むようになりました。",
    initial: "M",
  },
];

export default function Testimonials() {
  return (
    <section className="px-4 py-24 sm:py-32 bg-surface-secondary">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-ink mb-4">
            お客様の声
          </h2>
          <MizuhikiDivider />
        </div>

        <div className="grid sm:grid-cols-3 gap-6 md:gap-8">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`rounded-3xl bg-surface-tertiary p-7 md:p-8 flex flex-col shadow-warm ${
                i === 1 ? "sm:mt-10" : ""
              }`}
            >
              <span className="font-display-num text-6xl text-gold leading-none mb-2">
                &ldquo;
              </span>
              <p className="text-sm text-ink-secondary leading-relaxed mb-6 flex-1">
                {review.body}
              </p>
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} size={13} className="text-gold fill-gold" />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gold-gradient text-white font-serif font-bold text-sm shrink-0">
                  {review.initial}
                </span>
                <div>
                  <p className="text-sm font-serif font-semibold text-ink">{review.name}</p>
                  <p className="text-xs text-ink-muted">{review.meta}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-[11px] text-ink-muted mt-8">
          ※ 開発中サービスのイメージです
        </p>
      </div>
    </section>
  );
}
