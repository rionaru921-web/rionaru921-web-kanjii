"use client";

import { useEffect } from "react";
import { Home, RotateCw } from "lucide-react";
import ChochinIcon from "@/components/shared/ChochinIcon";
import MizuhikiDivider from "@/components/shared/MizuhikiDivider";
import GoldButton from "@/components/shared/GoldButton";

export default function ManualPlanDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ManualPlanDetailError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface-primary flex flex-col items-center justify-center px-4 py-16 text-center">
      <ChochinIcon className="w-24 h-32 animate-chochin-sway origin-top mb-6" />
      <p className="font-display text-3xl sm:text-4xl font-bold text-gold-gradient tracking-tight mb-4">
        このプランを表示できませんでした
      </p>
      <MizuhikiDivider className="mb-6" />
      <p className="text-sm text-ink-secondary mb-8 max-w-sm leading-relaxed">
        申し訳ございません。時間をおいて再度お試しいただくか、プラン一覧から他のプランをご確認ください。
      </p>

      {process.env.NODE_ENV === "development" && (
        <pre className="max-w-lg w-full mb-8 rounded-xl border border-vermilion/20 bg-vermilion/5 px-4 py-3 text-left text-xs text-vermilion overflow-x-auto">
          {error.message}
        </pre>
      )}

      <div className="flex items-center gap-3">
        <GoldButton onClick={reset} icon={RotateCw} variant="outline">
          再試行
        </GoldButton>
        <GoldButton href="/manual-plans" icon={Home}>
          プラン一覧に戻る
        </GoldButton>
      </div>
    </div>
  );
}
