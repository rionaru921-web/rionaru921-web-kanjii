import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import FavoriteCard from "@/components/manual-plans/FavoriteCard";
import type { ManualPlan } from "@/lib/manual-plans/types";

export const metadata: Metadata = {
  title: "よく使うプラン",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ManualPlanFavoritesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/manual-plans/favorites");
  }

  const { data: favorites } = await supabase
    .from("manual_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_favorite", true)
    .order("updated_at", { ascending: false });

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-4xl mx-auto">
      <Link
        href="/manual-plans"
        className="inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-gold transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        手動プランに戻る
      </Link>
      <div className="mb-6">
        <h1 className="font-serif font-bold text-2xl text-ink mb-1">よく使うプラン</h1>
        <p className="text-sm text-ink-secondary">保存しておいた内容から、日時だけ入れ替えてすぐに新しいプランを作れます</p>
      </div>

      {!favorites || favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-3 rounded-3xl bg-surface-tertiary shadow-warm">
          <Bookmark className="text-ink-muted" size={40} />
          <p className="text-ink-secondary">まだ「よく使うプラン」がありません</p>
          <p className="text-xs text-ink-muted">プラン詳細画面から「よく使うプランとして保存」で追加できます</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {(favorites as ManualPlan[]).map((favorite) => (
            <FavoriteCard key={favorite.id} favorite={favorite} />
          ))}
        </div>
      )}
    </main>
  );
}
