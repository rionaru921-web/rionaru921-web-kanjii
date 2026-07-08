"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";
import AILoadingAnimation from "@/components/ai/AILoadingAnimation";
import AIRecommendation from "@/components/ai/AIRecommendation";
import MizuhikiDivider from "@/components/shared/MizuhikiDivider";
import type { AISuggestResult } from "@/lib/ai/suggest";

export default function SuggestResultPage() {
  return (
    <Suspense fallback={<AILoadingAnimation />}>
      <SuggestResult />
    </Suspense>
  );
}

function SuggestResult() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<AISuggestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const people = Number(searchParams.get("people")) || 2;
  const budget = Number(searchParams.get("budget")) || 5000;
  const station = searchParams.get("station") ?? undefined;
  const genre = searchParams.get("genre") ?? undefined;
  const datetime = searchParams.get("datetime") ?? undefined;
  const privateRoom = searchParams.get("privateRoom") === "true";
  const memberProfile = searchParams.get("memberProfile") ?? "";
  const situation = searchParams.get("situation") ?? "";
  const preferences = searchParams.get("preferences") ?? undefined;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/ai/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            station,
            budgetPerPerson: budget,
            peopleCount: people,
            datetime,
            genreCode: genre,
            privateRoom,
            memberProfile,
            situation,
            preferences,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "AI提案の生成に失敗しました。");
        if (!cancelled) setResult(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "AI提案の生成に失敗しました。");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
    // Runs once per mount for the params this page was loaded with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retryHref = `/nomikai/suggest?${searchParams.toString()}`;
  const backHref = (() => {
    const p = new URLSearchParams();
    p.set("people", String(people));
    p.set("budget", String(budget));
    if (station) p.set("station", station);
    if (genre) p.set("genre", genre);
    if (privateRoom) p.set("privateRoom", "true");
    if (datetime) p.set("datetime", datetime);
    return `/nomikai/results?${p.toString()}`;
  })();

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <Link
        href={retryHref}
        className="inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-gold transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        条件を変更
      </Link>

      {loading && <AILoadingAnimation />}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-3 rounded-2xl border border-vermilion/20 bg-vermilion/5">
          <AlertTriangle className="text-vermilion" size={40} />
          <p className="text-ink-secondary">{error}</p>
          <Link href={retryHref} className="text-gold text-sm underline underline-offset-4">
            条件を変更してやり直す
          </Link>
        </div>
      )}

      {!loading && !error && result && (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-serif font-bold text-xl text-ink mb-3">AI幹事コメント</h1>
            <div className="rounded-3xl bg-surface-tertiary shadow-warm p-5">
              <MizuhikiDivider className="mb-4" />
              <p className="font-serif text-base text-ink leading-relaxed text-center">
                {result.summary}
              </p>
              <MizuhikiDivider className="mt-4" />
            </div>
          </div>

          {result.recommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 gap-3 rounded-3xl bg-surface-tertiary shadow-warm">
              <p className="text-ink-secondary">条件に合う店舗が見つかりませんでした</p>
              <Link href={retryHref} className="text-gold text-sm underline underline-offset-4">
                条件を変更する
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {result.recommendations.map((rec) => (
                <AIRecommendation key={rec.shopId} recommendation={rec} people={people} />
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 items-center pt-2">
            <Link
              href={retryHref}
              className="flex items-center justify-center gap-2 rounded-xl border border-gold/30 text-gold font-semibold py-3 text-sm px-6 hover:bg-gold/5 transition-colors"
            >
              <RefreshCw size={15} />
              もう一度AI提案する
            </Link>
            <Link
              href={backHref}
              className="text-xs text-ink-muted hover:text-gold transition-colors underline underline-offset-4"
            >
              通常検索に戻る
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
