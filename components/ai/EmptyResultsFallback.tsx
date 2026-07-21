import Link from "next/link";

export interface RelaxSuggestion {
  label: string;
  icon: string;
  href: string;
}

interface EmptyResultsFallbackProps {
  relaxSuggestions: RelaxSuggestion[];
  retryHref: string;
}

// Shown instead of a dead end when the AI search returns zero candidates:
// one-click links that re-run the same search with a single condition
// loosened (private room, genre, mood tags, budget), so the user doesn't
// have to go back to the form and guess which filter was too strict.
export default function EmptyResultsFallback({
  relaxSuggestions,
  retryHref,
}: EmptyResultsFallbackProps) {
  return (
    <div className="flex flex-col items-center py-10 px-4 gap-4 rounded-3xl bg-surface-tertiary shadow-warm text-center">
      <div className="text-5xl">🏮</div>
      <div>
        <p className="font-serif font-bold text-ink mb-1">条件に合う店舗が見つかりませんでした</p>
        <p className="text-sm text-ink-secondary">
          条件を少し緩めてみると、良い店が見つかるかもしれません
        </p>
      </div>

      <div className="flex flex-col gap-2.5 w-full max-w-sm">
        {relaxSuggestions.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="w-full flex items-center gap-3 rounded-xl border border-gold/30 bg-surface-warm text-ink px-4 py-3 text-sm hover:border-gold/60 hover:bg-gold/5 transition-colors"
          >
            <span className="text-xl">{s.icon}</span>
            <span>{s.label}</span>
          </Link>
        ))}
      </div>

      <Link href={retryHref} className="text-gold text-sm underline underline-offset-4">
        条件を変更する
      </Link>

      <p className="text-xs text-ink-muted mt-1">
        幹事ラボはHotPepper掲載店から提案しています。個人経営の店等は表示されない場合があります。
      </p>
    </div>
  );
}
