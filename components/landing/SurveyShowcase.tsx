"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, UtensilsCrossed, Wallet, AlertTriangle, MessageSquare, type LucideIcon } from "lucide-react";
import SectionTitle from "@/components/landing/SectionTitle";
import SurveyMockup from "@/components/landing/mockups/SurveyMockup";
import { fadeInUp } from "@/lib/animations";

interface SurveyFeatureItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const SURVEY_FEATURES: SurveyFeatureItemProps[] = [
  { icon: Calendar, title: "日程調整", description: "参加者の都合を集めて、いちばん集まりやすい日を一目で確認" },
  { icon: UtensilsCrossed, title: "ジャンル希望", description: "居酒屋・焼肉・カフェなど、行きたいお店のジャンルを聞ける" },
  { icon: Wallet, title: "予算希望", description: "参加者の予算感を事前に把握してお店選びに活かせる" },
  { icon: AlertTriangle, title: "アレルギー確認", description: "安全な会場・メニュー選びのために、事前に確認できる" },
  { icon: MessageSquare, title: "自由コメント", description: "選択肢にない細かい希望も、コメント欄で拾える" },
];

function SurveyFeatureItem({ icon: Icon, title, description }: SurveyFeatureItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10">
        <Icon className="h-5 w-5 text-gold" />
      </div>
      <div>
        <div className="font-semibold text-ink">{title}</div>
        <p className="mt-0.5 text-sm text-ink-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function SurveyShowcase() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <SectionTitle title="日程調整、終わらない問題を解決" subtitle="複数の候補日程、予算、食事の希望を、参加者にアンケートで一括で聞けます。" />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="flex flex-col gap-6"
          >
            {SURVEY_FEATURES.map((feature) => (
              <SurveyFeatureItem key={feature.title} {...feature} />
            ))}
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <SurveyMockup size="lg" />
          </motion.div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/surveys/new"
            className="inline-flex items-center justify-center rounded-full bg-gold-gradient px-8 py-4 min-h-[44px] text-sm font-serif font-semibold text-white shadow-gold transition-opacity hover:opacity-90"
          >
            アンケートを作ってみる
          </Link>
        </div>
      </div>
    </section>
  );
}
