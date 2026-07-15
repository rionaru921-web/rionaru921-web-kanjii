"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Plus, History } from "lucide-react";

const HIDE_PATHS = ["/", "/dashboard", "/login", "/signup"];

export default function FloatingBottomNav() {
  const pathname = usePathname();

  const shouldHide = HIDE_PATHS.includes(pathname) || pathname.startsWith("/share/");

  if (shouldHide) return null;

  const isCreateActive = pathname.startsWith("/manual-plans/new");
  const isHistoryActive = pathname === "/manual-plans";

  return (
    <AnimatePresence>
      <motion.nav
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        role="navigation"
        aria-label="メインナビゲーション"
        className="fixed inset-x-0 bottom-6 z-40 mx-auto flex w-fit max-w-[90vw] items-center gap-1 rounded-full bg-surface-tertiary/95 px-2 py-2 shadow-gold-lg backdrop-blur-md"
      >
        <Link
          href="/dashboard"
          aria-label="ホーム"
          className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-medium transition-colors ${
            pathname === "/dashboard" ? "bg-gold/10 text-gold" : "text-ink-secondary hover:text-gold"
          }`}
        >
          <Home size={18} />
          <span className="hidden sm:inline">ホーム</span>
        </Link>

        <Link
          href="/manual-plans/new"
          aria-label="プランを作成"
          className={`flex shrink-0 items-center gap-1.5 rounded-full bg-gold-gradient px-4 py-2.5 text-xs font-semibold text-white shadow-gold transition-opacity hover:opacity-90 ${
            isCreateActive ? "ring-2 ring-gold/40 ring-offset-2 ring-offset-surface-tertiary" : ""
          }`}
        >
          <Plus size={18} />
          <span className="hidden sm:inline">作成</span>
        </Link>

        <Link
          href="/manual-plans"
          aria-label="履歴"
          className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-medium transition-colors ${
            isHistoryActive ? "bg-gold/10 text-gold" : "text-ink-secondary hover:text-gold"
          }`}
        >
          <History size={18} />
          <span className="hidden sm:inline">履歴</span>
        </Link>
      </motion.nav>
    </AnimatePresence>
  );
}
