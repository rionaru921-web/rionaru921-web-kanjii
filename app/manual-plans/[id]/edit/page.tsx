import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ManualPlanForm from "@/components/manual-plans/ManualPlanForm";
import type { ManualPlan, ManualPlanMember } from "@/lib/manual-plans/types";

export const metadata: Metadata = {
  title: "プランを編集",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditManualPlanPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/manual-plans/${params.id}/edit`);
  }

  const { data: plan } = await supabase
    .from("manual_plans")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!plan) notFound();

  const { data: members } = await supabase
    .from("manual_plan_members")
    .select("*")
    .eq("plan_id", params.id)
    .order("created_at", { ascending: true });

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <h1 className="font-serif font-bold text-2xl text-ink mb-1">プランを編集</h1>
      <p className="text-sm text-ink-secondary mb-6">内容を変更して保存できます</p>
      <ManualPlanForm
        mode="edit"
        planId={plan.id}
        initialData={plan as ManualPlan}
        initialMembers={(members ?? []) as ManualPlanMember[]}
      />
    </main>
  );
}
