"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Flower2, Leaf, Wine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MockupProps } from "./mockupTypes";

// Landing-only preview of the Wave 11-A2 survey feature. Visual language is
// borrowed from the real components rather than invented: the chip-style
// choice buttons match SurveyResponseForm.tsx's choiceButtonClass, and the
// gradient-filled bar matches the Bar sub-component in SurveyResultsView.tsx
// (the feature does not use ○/△/× radio buttons in production).
type Tab = "create" | "answer" | "results";
const TABS: { key: Tab; label: string }[] = [
  { key: "create", label: "作成" },
  { key: "answer", label: "回答" },
  { key: "results", label: "集計" },
];

const EVENT_CHIPS: { label: string; icon: LucideIcon }[] = [
  { label: "歓迎会", icon: Flower2 },
  { label: "送別会", icon: Leaf },
  { label: "飲み会", icon: Wine },
];

type Attend = "yes" | "no" | "maybe";
const ATTEND_CHOICES: { value: Attend; label: string }[] = [
  { value: "yes", label: "参加" },
  { value: "no", label: "不参加" },
  { value: "maybe", label: "未定" },
];

const BASE_COUNTS: Record<Attend, number> = { yes: 7, no: 1, maybe: 1 };

const CONTAINER_SIZE = {
  sm: "max-w-sm p-5",
  md: "max-w-md p-6",
  lg: "max-w-xl p-8",
};

export default function SurveyMockup({ size = "md", autoPlay = true, onInteraction }: MockupProps = {}) {
  const [tab, setTab] = useState<Tab>("create");
  const [eventType, setEventType] = useState(0);
  const [myChoice, setMyChoice] = useState<Attend | null>(null);

  function selectTab(next: Tab) {
    setTab(next);
    onInteraction?.({ type: "tab-select", label: next });
  }

  function selectAttend(value: Attend) {
    setMyChoice(value);
    onInteraction?.({ type: "attend-select", label: value });
  }

  const counts: Record<Attend, number> = { ...BASE_COUNTS };
  if (myChoice) counts[myChoice] += 1;
  const total = BASE_COUNTS.yes + BASE_COUNTS.no + BASE_COUNTS.maybe + (myChoice ? 1 : 0);
  const maxCount = Math.max(...Object.values(counts));
  const participationRate = Math.round((counts.yes / total) * 100);

  const entrance = autoPlay
    ? {
        initial: { opacity: 0, y: 8 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-40px" },
        transition: { duration: 0.4 },
      }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
      };

  return (
    <div className={`rounded-2xl border border-gold/20 bg-surface-tertiary shadow-warm-hover mx-auto ${CONTAINER_SIZE[size]}`}>
      <div className="mb-4 flex items-center gap-2 border-b border-gold/10 pb-3">
        <ClipboardList size={16} className="text-gold" />
        <span className="font-serif text-xs text-ink-muted">アンケート</span>
      </div>

      <div className="mb-3 flex gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => selectTab(t.key)}
            className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
              tab === t.key ? "border-gold bg-gold/10 text-ink" : "border-gold/15 text-ink-secondary hover:border-gold/30"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "create" && (
          <motion.div key="create" {...entrance}>
            <p className="mb-2 text-[11px] text-ink-muted">イベント種類を選択</p>
            <div className="flex flex-wrap gap-2">
              {EVENT_CHIPS.map((chip, i) => {
                const selected = i === eventType;
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setEventType(i)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      selected ? "border-gold bg-gold/10 text-ink" : "border-gold/15 text-ink-secondary hover:border-gold/30"
                    }`}
                  >
                    <chip.icon size={12} />
                    {chip.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 rounded-lg border border-gold/20 bg-surface-secondary px-3 py-2 text-sm text-ink">
              {EVENT_CHIPS[eventType].label}のご都合を教えてください
            </div>
          </motion.div>
        )}

        {tab === "answer" && (
          <motion.div key="answer" {...entrance}>
            <p className="mb-2 text-[11px] text-ink-muted">参加できる?</p>
            <div className="flex flex-wrap gap-2">
              {ATTEND_CHOICES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => selectAttend(c.value)}
                  className={`rounded-xl px-3 py-2.5 min-h-[44px] text-sm font-medium border transition-colors ${
                    myChoice === c.value ? "bg-gold-gradient border-transparent text-white" : "border-gold/15 text-ink-secondary hover:border-gold/30"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {tab === "results" && (
          <motion.div key="results" {...entrance}>
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="text-ink-secondary">回答数 {total}名</span>
              <span className="font-serif font-semibold text-gold">参加率 {participationRate}%</span>
            </div>
            <div className="space-y-2.5">
              {ATTEND_CHOICES.map((c) => {
                const pct = Math.round((counts[c.value] / maxCount) * 100);
                return (
                  <div key={c.value} className="flex items-center gap-3 text-sm">
                    <span className="w-12 shrink-0 text-ink-secondary text-xs">{c.label}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-gold/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full rounded-full bg-gold-gradient"
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-xs text-ink">{counts[c.value]}名</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
