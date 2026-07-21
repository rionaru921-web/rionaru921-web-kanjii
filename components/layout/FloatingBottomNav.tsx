"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Plus, History } from "lucide-react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

const HIDE_PATHS = ["/", "/dashboard", "/login", "/signup"];

// Editing an existing plan is the one case where the "+作成" shortcut is
// destructive: it navigates to a blank /manual-plans/new, discarding
// whatever's unsaved in the edit form. Home/history don't get this guard —
// they're not reported as an issue and scope is kept to the one bad path.
const EDIT_EXISTING_PLAN_PATTERN = /^\/manual-plans\/[^/]+\/edit$/;

export default function FloatingBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const shouldHide = HIDE_PATHS.includes(pathname) || pathname.startsWith("/share/");

  if (shouldHide) return null;

  const isEditingExistingPlan = EDIT_EXISTING_PLAN_PATTERN.test(pathname);
  const isCreateActive = pathname.startsWith("/manual-plans/new");
  const isHistoryActive = pathname === "/manual-plans";

  function handleCreateClick(e: React.MouseEvent) {
    if (isEditingExistingPlan) {
      e.preventDefault();
      setShowDiscardConfirm(true);
    }
  }

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
          onClick={handleCreateClick}
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

      {showDiscardConfirm && (
        <ConfirmDialog
          title="編集内容が破棄されます"
          message="このプランの編集を終了して、新しいプランを作成しますか？編集中の内容は保存されません。"
          confirmLabel="新規作成する"
          cancelLabel="編集を続ける"
          onConfirm={() => {
            setShowDiscardConfirm(false);
            router.push("/manual-plans/new");
          }}
          onCancel={() => setShowDiscardConfirm(false)}
        />
      )}
    </AnimatePresence>
  );
}
