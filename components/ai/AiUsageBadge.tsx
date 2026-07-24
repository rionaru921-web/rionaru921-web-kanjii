"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface UsageState {
  applicable: boolean;
  currentCount?: number;
  maxCount?: number;
}

// Self-fetching so it can be dropped into the AI suggest form without
// threading server-fetched props through the page. Renders nothing for
// guests (they have a separate lifetime counter, not a monthly one) and
// while loading, to avoid a layout flash.
export default function AiUsageBadge() {
  const [state, setState] = useState<UsageState | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ai/usage")
      .then((res) => (res.ok ? res.json() : { applicable: false }))
      .then((data) => {
        if (!cancelled) setState(data);
      })
      .catch(() => {
        if (!cancelled) setState({ applicable: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!state?.applicable) return null;

  const { currentCount = 0, maxCount = -1 } = state;

  if (maxCount === -1) {
    return (
      <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-gold/10 text-gold text-xs font-semibold px-3 py-1.5">
        <Sparkles size={12} />
        Premium: お店提案(AI補助)無制限
      </span>
    );
  }

  const remaining = Math.max(maxCount - currentCount, 0);
  const isLow = remaining <= 2;

  return (
    <span
      className={`inline-flex items-center gap-1.5 self-start rounded-full text-xs font-semibold px-3 py-1.5 ${
        isLow ? "bg-vermilion/10 text-vermilion-text" : "bg-gold/10 text-gold"
      }`}
    >
      今月のお店提案(AI補助): 残り {remaining} / {maxCount} 回
    </span>
  );
}
