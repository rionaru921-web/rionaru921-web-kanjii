"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wine, Plane, PencilLine, ArrowRight, type LucideIcon } from "lucide-react";

interface CreatePlanModalProps {
  open: boolean;
  onClose: () => void;
}

// AIの提案フローは「飲み会」「旅行」の2系統に分かれているため、選択肢は3つ。
const NOMIKAI_AI_PATH = "/nomikai/suggest";
const TRAVEL_AI_PATH = "/travel";
const MANUAL_PATH = "/manual-plans/new";

interface OptionCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  iconStyle: "gold" | "outline";
  onClose: () => void;
}

function OptionCard({ href, icon: Icon, title, description, iconStyle, onClose }: OptionCardProps) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="group flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-3 rounded-2xl border border-gold/20 bg-surface-warm px-4 py-3.5 sm:p-5 transition-all hover:border-gold/40 hover:shadow-warm"
    >
      <div
        className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full shadow-sm ${
          iconStyle === "gold"
            ? "bg-gold-gradient text-white"
            : "bg-surface-tertiary text-gold ring-2 ring-gold/30"
        }`}
      >
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm sm:text-base font-semibold text-ink">{title}</div>
        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm leading-snug sm:leading-relaxed text-ink-secondary line-clamp-2 sm:line-clamp-none">
          {description}
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-1 text-sm font-medium text-gold transition-transform group-hover:translate-x-0.5">
        はじめる <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

export default function CreatePlanModal({ open, onClose }: CreatePlanModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-full max-w-3xl max-h-[90dvh] flex-col overflow-hidden rounded-3xl bg-surface-tertiary shadow-warm-hover"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gold/10 px-6 py-4 sm:px-8 sm:py-5">
              <div>
                <h2 className="text-xl font-serif font-bold text-ink sm:text-2xl">どうやって作りますか？</h2>
                <p className="mt-1 text-sm text-ink-secondary">集まりの計画方法を選んでください</p>
              </div>
              <button
                onClick={onClose}
                aria-label="閉じる"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-gold/5 hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5 sm:px-8">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <OptionCard
                  href={NOMIKAI_AI_PATH}
                  icon={Wine}
                  title="飲み会のお店を提案してもらう"
                  description="条件を伝えるだけで、ぴったりのお店を提案します(AI補助)"
                  iconStyle="gold"
                  onClose={onClose}
                />
                <OptionCard
                  href={TRAVEL_AI_PATH}
                  icon={Plane}
                  title="旅行のプランを提案してもらう"
                  description="目的地・日程・予算から、プランの候補を提案します(AI補助)"
                  iconStyle="gold"
                  onClose={onClose}
                />
                <OptionCard
                  href={MANUAL_PATH}
                  icon={PencilLine}
                  title="自分で作る"
                  description="お店や日時が決まっている集まりを、幹事として共有できます"
                  iconStyle="outline"
                  onClose={onClose}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
