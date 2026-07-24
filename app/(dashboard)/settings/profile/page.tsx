import type { Metadata } from "next";
import Link from "next/link";
import { User, GraduationCap, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProfileCard from "@/components/dashboard/ProfileCard";

export const metadata: Metadata = {
  title: "プロフィール",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfileSettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle()
    : { data: null };

  const displayName =
    profile?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "ゲスト";

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <h1 className="font-serif font-bold text-2xl text-ink mb-1 flex items-center gap-2">
        <User size={22} className="text-gold" />
        プロフィール
      </h1>
      <p className="text-sm text-ink-secondary mb-6">
        表示名やメールアドレスなど、アカウント情報を確認・編集できます。
      </p>
      {user && <ProfileCard userId={user.id} email={user.email ?? ""} displayName={displayName} />}

      {!user?.is_anonymous && (
        <Link
          href="/settings/growth"
          className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-surface-tertiary border border-gold/20 p-4 hover:border-gold/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <GraduationCap size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">幹事としての成長</p>
              <p className="text-xs text-ink-muted mt-0.5">レベルと振り返り履歴を確認</p>
            </div>
          </div>
          <ChevronRight className="text-ink-muted shrink-0" size={18} />
        </Link>
      )}
    </main>
  );
}
