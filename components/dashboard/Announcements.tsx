"use client";

import { motion } from "framer-motion";

const ANNOUNCEMENTS = [
  {
    date: "2026-07-09",
    title: "プロフィール編集機能を追加しました",
    body: "表示名とメールアドレスを変更できるようになりました。プロフィールカードの「編集」ボタンから設定してください。",
  },
  {
    date: "2026-07-09",
    title: "ホーム画面をリニューアル",
    body: "ダッシュボードを、より使いやすいホーム画面にリニューアルしました。",
  },
];

export default function Announcements() {
  const recent = ANNOUNCEMENTS.slice(0, 2);

  return (
    <section>
      <h2 className="font-serif font-bold text-lg text-ink mb-4">📢 お知らせ</h2>
      <div className="flex flex-col gap-3">
        {recent.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="rounded-2xl bg-surface-tertiary shadow-warm p-4 pl-5 border-l-4 border-gold"
          >
            <p className="text-xs text-ink-muted mb-1">{item.date}</p>
            <p className="text-sm font-semibold text-ink mb-1">{item.title}</p>
            <p className="text-xs text-ink-secondary">{item.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
