import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { GrowthContent } from "@/components/coaching/GrowthContent";

export const metadata: Metadata = {
  title: "幹事としての成長",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function GrowthPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isGuest = !!user?.is_anonymous;

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <h1 className="font-serif font-bold text-2xl text-ink mb-1 flex items-center gap-2">
        <GraduationCap size={22} className="text-gold" />
        幹事としての成長
      </h1>
      <p className="text-sm text-ink-secondary mb-6">
        振り返りを重ねるごとに、あなたの幹事レベルが上がります。
      </p>

      {isGuest ? (
        <div className="flex flex-col items-center text-center gap-3 rounded-3xl bg-surface-tertiary shadow-warm p-8">
          <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gold/10 text-gold">
            <Lock size={20} />
          </span>
          <p className="text-sm text-ink-secondary leading-relaxed">
            成長記録はアカウントに紐づけて保存するため、ゲストモードではご利用いただけません。アカウントを作成すると確認できるようになります。
          </p>
          <Link
            href="/settings/upgrade"
            className="mt-2 rounded-full bg-gold-gradient text-white text-sm font-bold px-6 py-2.5 hover:brightness-110 transition-all shadow-gold"
          >
            アカウントを作成する
          </Link>
        </div>
      ) : (
        <GrowthContent />
      )}
    </main>
  );
}
