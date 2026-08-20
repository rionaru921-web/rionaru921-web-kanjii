import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "削除完了",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountDeleteCompletePage() {
  return (
    <main className="px-4 sm:px-8 py-12 sm:py-16 max-w-lg mx-auto">
      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-6 sm:p-8 flex flex-col items-center text-center gap-3">
        <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 text-gold">
          <CheckCircle2 size={26} />
        </span>
        <h1 className="font-serif font-bold text-xl text-ink">アカウントを削除しました</h1>
        <p className="text-sm text-ink-secondary leading-relaxed">
          幹事ラボをご利用いただきありがとうございました。アカウントとすべてのデータの削除が完了しました。
        </p>
        <Link
          href="/"
          className="mt-2 rounded-full bg-gold-gradient text-white text-sm font-bold px-6 py-2.5 hover:brightness-110 transition-all shadow-gold"
        >
          トップページへ戻る
        </Link>
      </div>
    </main>
  );
}
