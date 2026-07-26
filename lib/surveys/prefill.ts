import "server-only";
import { createClient } from "@/lib/supabase/server";
import { aggregateResponses } from "./aggregate";
import { DEFAULT_TIER_LEVEL } from "@/lib/manual-plans/split-types";
import type { ManualPlan, ManualPlanMember } from "@/lib/manual-plans/types";
import type { Survey, SurveyResponse } from "./types";

// Bridges a survey's top-voted choices into the shape ManualPlanForm's
// initialData/initialMembers props already expect (see
// app/manual-plans/[id]/edit/page.tsx for the same pattern with a real saved
// plan). Every field ManualPlanForm reads off initialData is optional-chained,
// so a partial, never-persisted object is safe to pass — this file is the
// only thing that knows about surveys; ManualPlanForm itself is untouched.
export async function buildManualPlanPrefillFromSurvey(
  slug: string,
  ownerId: string
): Promise<{ initialData: Partial<ManualPlan>; initialMembers: ManualPlanMember[] } | null> {
  const supabase = createClient();

  const { data: survey } = await supabase
    .from("surveys")
    .select("*")
    .eq("slug", slug)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (!survey) return null;
  const typedSurvey = survey as Survey;

  const { data: responses } = await supabase
    .from("survey_responses")
    .select("*")
    .eq("survey_id", typedSurvey.id);
  const typedResponses = (responses ?? []) as SurveyResponse[];

  const { dateTally, budgetTally, genreTally } = aggregateResponses(typedResponses, typedSurvey.date_options);

  const topDateOption =
    dateTally.length > 0
      ? typedSurvey.date_options.find((opt) => {
          const parsed = new Date(`${opt.date}T00:00:00`);
          const label = opt.time_slot ? `${parsed.getMonth() + 1}/${parsed.getDate()} ${opt.time_slot}` : `${parsed.getMonth() + 1}/${parsed.getDate()}`;
          return label === dateTally[0].label;
        })
      : null;

  const genreNote = genreTally.length > 0 ? `参加者の第一希望ジャンル: ${genreTally[0].label}` : "";

  const initialData: Partial<ManualPlan> = {
    title: typedSurvey.title,
    event_date: topDateOption ? `${topDateOption.date}T${topDateOption.time_slot === "昼" ? "12:00" : "19:00"}:00` : null,
    fee_amount: budgetTally.length > 0 ? Number(budgetTally[0].label) || null : null,
    memo: genreNote || null,
  };

  const initialMembers: ManualPlanMember[] = typedResponses.map((r) => ({
    id: r.id,
    plan_id: "",
    name: r.respondent_name,
    email: r.respondent_email,
    role: "participant",
    attendance_status: r.will_attend === "yes" ? "attending" : r.will_attend === "no" ? "declined" : "pending",
    note: null,
    created_at: r.created_at,
    updated_at: r.created_at,
    tier_level: DEFAULT_TIER_LEVEL,
    weight_override: null,
    organizer_discount: null,
  }));

  return { initialData, initialMembers };
}
