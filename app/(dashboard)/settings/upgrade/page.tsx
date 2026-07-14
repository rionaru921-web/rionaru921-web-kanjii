import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GuestUpgradeForm from "@/components/auth/GuestUpgradeForm";

export const metadata: Metadata = {
  title: "アカウント作成",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function UpgradePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ゲスト(匿名ユーザー)専用の画面。既に本登録済みのユーザーが直接
  // このURLを叩いてもやることがないのでダッシュボードへ戻す。
  if (!user?.is_anonymous) {
    redirect("/dashboard");
  }

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-md mx-auto">
      <GuestUpgradeForm />
    </main>
  );
}
