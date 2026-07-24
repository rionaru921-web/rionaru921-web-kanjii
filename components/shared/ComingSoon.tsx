import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import GoldButton from "./GoldButton";

export default function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <main className="px-4 sm:px-8 py-16 max-w-2xl mx-auto flex flex-col items-center text-center min-h-[70vh] justify-center">
      <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 text-gold mb-6">
        <Icon size={30} />
      </span>
      <span className="text-xs rounded-full bg-vermilion/15 text-vermilion-text px-3 py-1 mb-4">
        Coming Soon
      </span>
      <h1 className="font-serif font-bold text-2xl text-ink mb-3">{title}</h1>
      <p className="text-sm text-ink-secondary leading-relaxed mb-8 max-w-sm">
        {description}
      </p>
      <GoldButton href="/dashboard" variant="outline">
        ダッシュボードに戻る
      </GoldButton>
      <Link href="/" className="text-xs text-ink-muted hover:text-gold mt-4 transition-colors">
        幹事ラボ トップへ
      </Link>
    </main>
  );
}
