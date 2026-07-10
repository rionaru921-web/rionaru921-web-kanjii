import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import GoldButton from "@/components/shared/GoldButton";
import ManualPlansList, { type ManualPlanListItem } from "@/components/manual-plans/ManualPlansList";
import type { ManualPlan, ManualPlanMember } from "@/lib/manual-plans/types";

export const metadata: Metadata = {
  title: "手動プラン",
  robots: {
    index: false,
    follow: false,
  },
};

// /manual-plans isn't in the middleware's PROTECTED_ROUTES deny-list (that
// file is intentionally left untouched here), so auth is enforced locally
// in each page instead.
export default async function ManualPlansPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/manual-plans");
  }

  // Single embedded query (plan + member ids) instead of a plan fetch
  // followed by N separate member-count fetches — the FK on
  // manual_plan_members.plan_id lets PostgREST join both in one round trip.
  const { data: plans } = await supabase
    .from("manual_plans")
    .select("*, manual_plan_members(id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items: ManualPlanListItem[] = (plans ?? []).map((row) => {
    const { manual_plan_members, ...planFields } = row as ManualPlan & {
      manual_plan_members: Pick<ManualPlanMember, "id">[];
    };
    return { ...(planFields as ManualPlan), memberCount: manual_plan_members?.length ?? 0 };
  });

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif font-bold text-2xl text-ink mb-1">手動プラン</h1>
          <p className="text-sm text-ink-secondary">自分で決めた予定を管理・共有できます</p>
        </div>
        <GoldButton href="/manual-plans/new" icon={Plus} size="md">
          新規作成
        </GoldButton>
      </div>

      <ManualPlansList plans={items} />
    </main>
  );
}
