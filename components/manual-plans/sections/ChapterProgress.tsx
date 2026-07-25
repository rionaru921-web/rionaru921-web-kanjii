"use client";

import { useEffect, useState, type RefObject } from "react";

const ZH_NUM = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

interface ChapterProgressProps {
  chapterRefs: RefObject<HTMLElement>[];
  total: number;
}

// Replaces the old desktop-only PlanPreviewCard sidebar, which had nowhere
// to live once the form became a single scrolling column. A thin sticky
// progress bar + "第X章/全Y章" label works identically on mobile and
// desktop, unlike a fixed sidebar.
export default function ChapterProgress({ chapterRefs, total }: ChapterProgressProps) {
  const [current, setCurrent] = useState(0);

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

  return (
    <div className="sticky top-0 z-20 -mx-4 sm:mx-0 mb-2 bg-surface/90 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 sm:px-0 py-2 text-xs">
        <span className="font-serif text-ink-secondary">
          第{ZH_NUM[current] ?? current + 1}章 / 全{ZH_NUM[total - 1] ?? total}章
        </span>
        <span className="text-ink-muted">{percentage}%</span>
      </div>
      <div className="h-0.5 w-full bg-gold/10">
        <div
          className="h-full bg-gold-gradient transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
