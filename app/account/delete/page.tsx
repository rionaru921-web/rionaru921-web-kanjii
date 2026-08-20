import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Info } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DeleteAccountForm from "@/components/account/DeleteAccountForm";

export const metadata: Metadata = {
  title: "アカウント削除",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountDeletePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/account/delete");
  }

  // Guests have no persistent credentials to delete — uninstalling the app
  // (or just letting the anonymous session expire) already removes their
  // data via the same cascade this page would trigger, so there's nothing
  // for this flow to add. Once a guest upgrades to a real account (Wave
  // 22-24's GuestUpgradeForm), they land in the branch below like anyone
  // else.
  if (user.is_anonymous) {
    return (
      <main className="px-4 sm:px-8 py-12 sm:py-16 max-w-lg mx-auto">
        <div className="rounded-3xl bg-surface-tertiary shadow-warm p-6 sm:p-8 flex flex-col items-center text-center gap-3">
          <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gold/10 text-gold">
            <Info size={20} />
          </span>
          <h1 className="font-serif font-bold text-xl text-ink">アカウント削除</h1>
          <p className="text-sm text-ink-secondary leading-relaxed">
            ゲストモードではアカウント登録を行っていないため、削除は不要です。アプリ(またはブラウザ)を削除すれば、作成したデータも合わせて消去されます。
          </p>
          <Link
            href="/settings/profile"
            className="mt-2 text-sm text-gold hover:brightness-125"
          >
            設定に戻る
          </Link>
        </div>
      </main>
    );
  }

  const [{ count: plansCount }, { count: surveysCount }] = await Promise.all([
    supabase.from("manual_plans").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("surveys").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
  ]);

  return (
    <main className="px-4 sm:px-8 py-12 sm:py-16 max-w-lg mx-auto">
      <DeleteAccountForm
        email={user.email ?? ""}
        plansCount={plansCount ?? 0}
        surveysCount={surveysCount ?? 0}
      />
    </main>
  );
}
