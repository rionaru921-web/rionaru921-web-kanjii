import "server-only";
import type { createClient } from "@/lib/supabase/server";
import { isCompletedPlan } from "@/lib/manual-plans/types";
import { perPersonFee } from "@/lib/manual-plans/format";
import type { HistoryPayload } from "@/lib/history/types";

export type PlanType = "nomikai" | "travel" | "manual";

export type PlanContext = {
  type: PlanType;
  title?: string;
  venue?: string;
  memberCount?: number;
  budget?: number;
};

export type OwnedPlanResult =
  | { exists: false }
  | { exists: true; completed: boolean; context: PlanContext };

type SupabaseSessionClient = ReturnType<typeof createClient>;

// Looks up a plan by (plan_type, plan_id) scoped to the calling user and
// reports whether it exists, whether it's eligible for coaching (completed),
// and the context used to prompt the AI feedback. Shared by
// POST /api/coaching/session (ownership + completion gate) and
// POST /api/coaching/complete (AI prompt context) so the two call sites
// can't drift on what counts as "this user's completed plan".
export async function fetchOwnedPlan(
  supabase: SupabaseSessionClient,
  userId: string,
  planType: PlanType,
  planId: string
): Promise<OwnedPlanResult> {
  if (planType === "manual") {
    const { data: plan } = await supabase
      .from("manual_plans")
      .select("title, venue_name, fee_amount, event_date, end_date")
      .eq("id", planId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!plan) return { exists: false };

    const { count } = await supabase
      .from("manual_plan_members")
      .select("id", { count: "exact", head: true })
      .eq("plan_id", planId);

    const memberCount = count ?? 0;

    return {
      exists: true,
      completed: isCompletedPlan({ event_date: plan.event_date, end_date: plan.end_date }),
      context: {
        type: "manual",
        title: plan.title,
        venue: plan.venue_name ?? undefined,
        memberCount,
        budget: perPersonFee(plan.fee_amount, memberCount) ?? undefined,
      },
    };
  }

  // nomikai / travel: both live in the single `history` table, distinguished
  // by `type`. Saving to history only happens after the user finalizes the
  // calculation, so unlike manual_plans there's no "in progress" state here
  // — every row is already eligible for coaching.
  const { data: record } = await supabase
    .from("history")
    .select("title, payload")
    .eq("id", planId)
    .eq("user_id", userId)
    .eq("type", planType)
    .maybeSingle();

  if (!record) return { exists: false };

  const payload = record.payload as HistoryPayload;
  const context: PlanContext = { type: planType, title: record.title };

  if (payload.kind === "nomikai") {
    const { pdf } = payload;
    const count = pdf.participants?.length ?? 0;
    context.venue = pdf.shop?.name;
    context.memberCount = count;
    context.budget = count > 0 ? Math.round(pdf.total / count) : undefined;
  } else if (payload.kind === "travel") {
    const { pdf } = payload;
    const count = pdf.participants?.length ?? 0;
    context.venue = pdf.destination;
    context.memberCount = count;
    context.budget = count > 0 ? Math.round(pdf.total / count) : undefined;
  }

  return { exists: true, completed: true, context };
}
