import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ManualPlanForm from "@/components/manual-plans/ManualPlanForm";

export const metadata: Metadata = {
  title: "新しいプランを作成",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewManualPlanPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/manual-plans/new");
  }

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <h1 className="font-serif font-bold text-2xl text-ink mb-1">新しいプランを作成</h1>
      <p className="text-sm text-ink-secondary mb-6">
        自分で決めた予定を登録して、みんなに共有しましょう。まずは下書きとして保存され、
        詳細ページの「共有を開始する」ボタンを押すとURL・PDF・QRで共有できます。
      </p>
      <ManualPlanForm mode="create" />
    </main>
  );
}
