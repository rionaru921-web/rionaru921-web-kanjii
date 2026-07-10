"use client";

import { motion } from "framer-motion";

const TIPS = [
  "参加者の予算を先に聞いておくと、お店選びがスムーズです",
  "飲めない人がいる場合、ソフトドリンクの充実度もチェックしましょう",
  "駅から徒歩5分以内のお店を選ぶと、遅刻や迷子を防げます",
  "個室希望なら、予約時に必ず「個室確約」を確認しましょう",
  "早めの予約(2週間前)が、良いお店を押さえるコツです",
  "会計時に慌てないよう、集金アプリでの事前徴収がおすすめ",
  "苦手な食材(アレルギー含む)を事前アンケートで確認しましょう",
  "2次会の目星も一応つけておくと、当日スムーズです",
  "幹事も楽しめる会にするために、当日はスマホを置いて乾杯を",
  "コース料理は2時間制が多いので、時間配分に気をつけて",
];

export default function DailyTip() {
  const index = Math.floor(Date.now() / 86400000) % TIPS.length;
  const tip = TIPS[index];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-3xl bg-surface-warm border border-gold/10 shadow-warm p-6 flex items-start gap-3"
    >
      <span className="text-xl shrink-0">💡</span>
      <div>
        <p className="text-xs font-semibold text-gold mb-1">今日のヒント</p>
        <p className="text-sm text-ink-secondary">{tip}</p>
      </div>
    </motion.section>
  );
}
