"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Sparkles, BookOpen } from "lucide-react";
import type { CoachLevel } from "@/lib/coaching/level";
import type { PlanType } from "@/lib/coaching/planContext";

type GrowthData = {
  stats: { total: number; thisMonth: number };
  level: CoachLevel;
  progress: { current: number; threshold: number | null; percentage: number };
  sessions: Array<{
    id: string;
    plan_type: PlanType;
    plan_id: string;
    ai_summary?: string | null;
    ai_strengths?: string[] | null;
    completed_at: string;
  }>;
};

const PLAN_TYPE_LABEL: Record<PlanType, string> = {
  manual: "手動",
  nomikai: "飲み会",
  travel: "旅行",
};

function getPlanDetailPath(planType: PlanType, planId: string): string {
  if (planType === "manual") return `/manual-plans/${planId}`;
  return `/history/${planId}`;
}

export function GrowthContent() {
  const [data, setData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/coaching/growth")
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "エラーが発生しました");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={28} className="text-gold animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-8 text-center text-sm text-ink-secondary">
        {error || "データの取得に失敗しました"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-surface-tertiary shadow-warm border border-gold/20 p-5 text-center"
        >
          <p className="text-xs text-ink-muted">今月の振り返り</p>
          <p className="font-display-num font-black text-3xl sm:text-4xl text-gold mt-1">
            {data.stats.thisMonth}
          </p>
          <p className="text-xs text-ink-muted mt-1">回</p>
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl bg-surface-tertiary shadow-warm border border-gold/20 p-5 text-center"
        >
          <p className="text-xs text-ink-muted">通算の振り返り</p>
          <p className="font-display-num font-black text-3xl sm:text-4xl text-gold mt-1">
            {data.stats.total}
          </p>
          <p className="text-xs text-ink-muted mt-1">回</p>
        </motion.section>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl bg-gold-gradient p-6 shadow-warm text-white"
      >
        <div className="flex items-center gap-4">
          <div className="text-5xl leading-none shrink-0">{data.level.emoji}</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-white/80">現在のレベル</p>
            <p className="font-serif font-bold text-xl sm:text-2xl">
              Lv.{data.level.level} {data.level.name}
            </p>
            <p className="text-sm text-white/90 mt-1">{data.level.description}</p>
          </div>
        </div>

        {data.progress.threshold !== null && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-white/80">
              <span>
                {data.progress.current} / {data.progress.threshold}
              </span>
              <span>次のレベルまであと {data.progress.threshold - data.progress.current}回</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.progress.percentage}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full bg-white/80"
              />
            </div>
          </div>
        )}
      </motion.section>

      <section>
        <h2 className="flex items-center gap-2 font-serif font-bold text-lg text-ink mb-3">
          <BookOpen className="text-gold" size={18} />
          これまでの振り返り
        </h2>

        {data.sessions.length === 0 ? (
          <div className="rounded-3xl bg-surface-tertiary shadow-warm border border-gold/20 p-8 text-center">
            <Sparkles className="mx-auto text-gold" size={28} />
            <p className="text-sm text-ink mt-2">まだ振り返りがありません</p>
            <p className="text-xs text-ink-muted mt-1">
              完了したプランからAIコーチと振り返ってみましょう
            </p>
            <Link
              href="/history"
              className="inline-block mt-4 rounded-xl bg-gold-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-gold transition-opacity hover:opacity-90"
            >
              履歴を見る
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {data.sessions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.03 }}
              >
                <Link
                  href={getPlanDetailPath(s.plan_type, s.plan_id)}
                  className="block rounded-2xl bg-surface-tertiary border border-gold/20 p-4 hover:border-gold/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-ink-muted">
                      {new Date(s.completed_at).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gold/10 text-gold rounded-full">
                      {PLAN_TYPE_LABEL[s.plan_type]}
                    </span>
                  </div>
                  {s.ai_summary && (
                    <p
                      className="text-sm text-ink-secondary overflow-hidden"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {s.ai_summary}
                    </p>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
