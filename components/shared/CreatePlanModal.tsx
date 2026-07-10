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
      className="group flex flex-col items-start gap-3 rounded-xl border border-gold/20 bg-surface-tertiary p-5 transition-all hover:border-gold/40 hover:shadow-md"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-sm ${
          iconStyle === "gold"
            ? "bg-gold-gradient text-white"
            : "bg-white text-gold ring-2 ring-gold/30"
        }`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <div className="text-base font-semibold text-ink">{title}</div>
        <p className="mt-1 text-xs leading-relaxed text-ink/60">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-sm font-medium text-gold transition-transform group-hover:translate-x-0.5">
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
            className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <button
              onClick={onClose}
              aria-label="閉じる"
              className="absolute right-4 top-4 rounded-full p-1 text-ink/60 transition-colors hover:bg-ink/5"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-semibold text-ink sm:text-2xl">どうやって作りますか？</h2>
            <p className="mt-1.5 text-sm text-ink/60">集まりの計画方法を選んでください</p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <OptionCard
                href={NOMIKAI_AI_PATH}
                icon={Wine}
                title="飲み会をAIに提案"
                description="条件を伝えるだけで、AIがぴったりのお店を提案します"
                iconStyle="gold"
                onClose={onClose}
              />
              <OptionCard
                href={TRAVEL_AI_PATH}
                icon={Plane}
                title="旅行をAIに提案"
                description="目的地・日程・予算から、AIが最適なプランを提案します"
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

            <div className="mt-6 flex justify-center">
              <button
                onClick={onClose}
                className="text-sm text-ink/50 transition-colors hover:text-ink/70"
              >
                キャンセル
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
