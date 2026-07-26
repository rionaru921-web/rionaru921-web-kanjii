import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ManualPlanForm from "@/components/manual-plans/ManualPlanForm";
import FeatureBadges from "@/components/plan-form/FeatureBadges";
import { buildManualPlanPrefillFromSurvey } from "@/lib/surveys/prefill";
import type { ManualPlan } from "@/lib/manual-plans/types";

export const metadata: Metadata = {
  title: "新しいプランを作成",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewManualPlanPage({
  searchParams,
}: {
  searchParams: { from_survey?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/manual-plans/new");
  }

  // Wave 11-A: optional prefill from a survey's top-voted choices. Only
  // fires when ?from_survey=<slug> is present and owned by this user —
  // ManualPlanForm itself doesn't know surveys exist, it just receives the
  // same initialData/initialMembers shape the edit page already passes it.
  const prefill = searchParams.from_survey
    ? await buildManualPlanPrefillFromSurvey(searchParams.from_survey, user.id)
    : null;

  return (
    <main className="px-4 sm:px-8 pt-8 sm:pt-10 pb-28">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif font-bold text-2xl text-ink mb-1 text-center">新しいプランを作成</h1>
        <p className="text-sm text-ink-secondary mb-6 text-center">
          自分で決めた予定を登録して、みんなに共有しましょう。保存すると、その場でURL・PDF・QRで共有できます。
        </p>
        <FeatureBadges />
      </div>
      <ManualPlanForm
        mode="create"
        initialData={prefill?.initialData as ManualPlan | undefined}
        initialMembers={prefill?.initialMembers}
      />
    </main>
  );
}
