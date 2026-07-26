import Link from "next/link";

export interface RelaxSuggestion {
  label: string;
  icon: string;
  href: string;
}

interface EmptyResultsFallbackProps {
  relaxSuggestions: RelaxSuggestion[];
  areaSuggestions?: RelaxSuggestion[];
  retryHref: string;
}

// Shown instead of a dead end when the AI search returns zero candidates —
// even after the server already tried progressively loosening budget/
// genre/search-radius on its own (see lib/ai/relax-search.ts). At this
// point automatic relaxation has been exhausted, so what's offered here is:
// nearby/major-station alternatives (areaSuggestions, if any were found for
// the user's prefecture), one-click links for conditions relaxation
// couldn't touch on its own (private room, mood tags — genre/budget are
// already covered server-side), and manual plan creation as the fallback
// that always works.
export default function EmptyResultsFallback({
  relaxSuggestions,
  areaSuggestions = [],
  retryHref,
}: EmptyResultsFallbackProps) {
  return (
    <div className="flex flex-col items-center py-10 px-4 gap-4 rounded-3xl bg-surface-tertiary shadow-warm text-center">
      <div className="text-5xl">🏮</div>
      <div>
        <p className="font-serif font-bold text-ink mb-1">ご希望のエリアでは見つかりませんでした</p>
        <p className="text-sm text-ink-secondary">
          お店選びのお手伝いとして、次の方法もお試しいただけます
        </p>
      </div>

      {areaSuggestions.length > 0 && (
        <div className="flex flex-col gap-2.5 w-full max-w-sm">
          <p className="text-xs font-semibold text-ink-muted text-left">近隣の主要駅で探す</p>
          {areaSuggestions.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="w-full flex items-center gap-3 rounded-xl border border-gold/40 bg-gold/5 text-ink px-4 py-3 text-sm hover:border-gold/60 hover:bg-gold/10 transition-colors"
            >
              <span className="text-xl">{s.icon}</span>
              <span>{s.label}</span>
            </Link>
          ))}
        </div>
      )}

      {relaxSuggestions.length > 0 && (
        <div className="flex flex-col gap-2.5 w-full max-w-sm">
          <p className="text-xs font-semibold text-ink-muted text-left">条件を変えて探す</p>
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
      )}

      <div className="flex flex-col gap-1.5 items-center pt-1">
        <Link href={retryHref} className="text-gold text-sm underline underline-offset-4">
          条件を変更する
        </Link>
        <Link
          href="/manual-plans/new"
          className="text-ink-secondary text-sm underline underline-offset-4 hover:text-gold transition-colors"
        >
          手動でプランを作成する
        </Link>
      </div>

      <p className="text-xs text-ink-muted mt-1">
        幹事ラボはHotPepper掲載店から提案しています。個人経営の店等は表示されない場合があります。
      </p>
    </div>
  );
}
