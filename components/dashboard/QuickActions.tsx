"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Wine, Plane, History, BookOpen, type LucideIcon } from "lucide-react";

interface ActionItem {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  disabled?: boolean;
}

// The app has two separate creation flows (nomikai / travel) rather than a
// single "new plan" screen, so both are surfaced here alongside history and
// guide instead of one generic "新しいプランを作る" button.
const ACTIONS: ActionItem[] = [
  { href: "/nomikai", icon: Wine, title: "飲み会を計画する", description: "お店選びから割り勘まで" },
  { href: "/travel", icon: Plane, title: "旅行を計画する", description: "行き先決めから精算まで" },
  { href: "/history", icon: History, title: "履歴を見る", description: "過去のプランを振り返る" },
  { href: "#", icon: BookOpen, title: "使い方を見る", description: "準備中", disabled: true },
];

export default function QuickActions() {
  return (
    <section>
      <h2 className="font-serif font-bold text-lg text-ink mb-4">⚡ クイックアクション</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ACTIONS.map((action, i) => {
          const Icon = action.icon;
          const card = (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              whileHover={action.disabled ? undefined : { y: -2 }}
              className={`flex h-full flex-col gap-2 rounded-3xl bg-surface-tertiary shadow-warm p-5 transition-shadow ${
                action.disabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-warm-hover"
              }`}
              title={action.disabled ? "準備中" : undefined}
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold/10 text-gold">
                <Icon size={18} />
              </span>
              <p className="text-sm font-semibold text-ink">{action.title}</p>
              <p className="text-xs text-ink-muted">{action.description}</p>
            </motion.div>
          );

          return action.disabled ? (
            <div key={action.title}>{card}</div>
          ) : (
            <Link key={action.title} href={action.href}>
              {card}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
