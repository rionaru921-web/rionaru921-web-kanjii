"use client";

import { useEffect, useState, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Eye } from "lucide-react";

const ZH_NUM = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

interface ChapterProgressProps {
  chapterRefs: RefObject<HTMLElement>[];
  total: number;
  onPreviewClick?: () => void;
}

// Replaces the old desktop-only PlanPreviewCard sidebar, which had nowhere
// to live once the form became a single scrolling column. A thin sticky
// progress bar + "第X章/全Y章" label works identically on mobile and
// desktop, unlike a fixed sidebar.
export default function ChapterProgress({ chapterRefs, total, onPreviewClick }: ChapterProgressProps) {
  const [current, setCurrent] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    function handleScroll() {
      const scrollMid = window.innerHeight * 0.4;
      let idx = 0;
      chapterRefs.forEach((ref, i) => {
        const el = ref.current;
        if (!el) return;
        if (el.getBoundingClientRect().top <= scrollMid) idx = i;
      });
      setCurrent(idx);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const percentage = Math.round(((current + 1) / total) * 100);

  function jumpTo(index: number) {
    chapterRefs[index]?.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <div className="sticky top-0 z-20 -mx-4 sm:mx-0 mb-2 bg-surface/90 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 sm:px-0 py-2 text-xs">
        <span className="font-serif text-ink-secondary">
          第{ZH_NUM[current] ?? current + 1}章 / 全{ZH_NUM[total - 1] ?? total}章
        </span>
        <div className="flex items-center gap-3">
          <span className="text-ink-muted">{percentage}%</span>
          {onPreviewClick && (
            <button
              type="button"
              onClick={onPreviewClick}
              className="lg:hidden flex items-center gap-1 rounded-full border border-gold/20 px-2.5 py-1 text-[11px] font-medium text-gold hover:bg-gold/5 transition-colors"
            >
              <Eye size={12} />
              プレビュー
            </button>
          )}
        </div>
      </div>
      <div className="h-0.5 w-full bg-gold/10">
        <motion.div
          className="h-full bg-gold-gradient"
          animate={{ width: `${percentage}%` }}
          transition={{ duration: reduceMotion ? 0 : 0.3, ease: "easeOut" }}
        />
      </div>
      <div className="flex items-center justify-between gap-1 px-4 sm:px-0 py-2">
        {Array.from({ length: total }).map((_, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <button
              key={i}
              type="button"
              onClick={() => jumpTo(i)}
              aria-label={`第${ZH_NUM[i] ?? i + 1}章へ移動`}
              aria-current={active ? "step" : undefined}
              className={`flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-serif transition-colors ${
                active
                  ? "bg-gold text-white ring-2 ring-gold/30"
                  : done
                    ? "bg-gold/15 text-gold"
                    : "bg-surface-secondary text-ink-muted hover:bg-gold/5"
              }`}
            >
              {done ? <Check size={12} /> : i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
