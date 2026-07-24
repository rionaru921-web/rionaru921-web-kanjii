"use client";

import { useEffect } from "react";
import { Home, RotateCw } from "lucide-react";
import ChochinIcon from "@/components/shared/ChochinIcon";

export default function SharePlanError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SharePlanError]", error);
  }, [error]);

  return (
    <div className="washoku flex flex-col items-center justify-center px-4 py-16 text-center">
      <ChochinIcon className="w-24 h-32 animate-chochin-sway origin-top mb-6" />
      <p className="font-serif text-3xl sm:text-4xl font-bold text-washoku-brass tracking-tight mb-4">
        このプランを表示できませんでした
      </p>
      <p className="text-sm text-washoku-paper-muted mb-8 max-w-sm leading-relaxed">
        申し訳ございません。時間をおいて再度お試しいただくか、共有リンクの発行者にご確認ください。
      </p>

      {process.env.NODE_ENV === "development" && (
        <pre className="max-w-lg w-full mb-8 rounded-lg border border-washoku-red-soft bg-washoku-red-soft px-4 py-3 text-left text-xs text-washoku-red overflow-x-auto">
          {error.message}
        </pre>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-2 rounded-full border border-washoku-brass-soft text-washoku-brass font-semibold text-sm px-5 py-2.5 hover:bg-washoku-brass-soft transition-colors"
        >
          <RotateCw size={16} />
          再試行
        </button>
        <a
          href="/"
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-washoku-ink shadow-md"
          style={{
            background: "linear-gradient(135deg, var(--washoku-brass-bright) 0%, var(--washoku-brass) 100%)",
          }}
        >
          <Home size={16} />
          ホームに戻る
        </a>
      </div>
    </div>
  );
}
