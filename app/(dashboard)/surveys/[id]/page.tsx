import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { aggregateResponses } from "@/lib/surveys/aggregate";
import SurveyResultsView from "@/components/surveys/SurveyResultsView";
import type { Survey, SurveyResponse } from "@/lib/surveys/types";

export const metadata: Metadata = {
  title: "アンケート結果",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SurveyResultsPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/surveys/${params.id}`);
  }

  const { data: survey } = await supabase
    .from("surveys")
    .select("*")
    .eq("id", params.id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!survey) {
    notFound();
  }

  const typedSurvey = survey as Survey;

  const { data: responses } = await supabase
    .from("survey_responses")
    .select("*")
    .eq("survey_id", typedSurvey.id)
    .order("created_at", { ascending: false });

  const typedResponses = (responses ?? []) as SurveyResponse[];
  const { dateTally, budgetTally, genreTally, attendCounts, maxCount, totalResponses } = aggregateResponses(
    typedResponses,
    typedSurvey.date_options
  );

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  const shareUrl = `${baseUrl}/s/${typedSurvey.slug}`;

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <h1 className="font-serif font-bold text-2xl text-ink mb-1">{typedSurvey.title}</h1>
      {typedSurvey.description && <p className="text-sm text-ink-secondary mb-6">{typedSurvey.description}</p>}

      <SurveyResultsView
        survey={typedSurvey}
        shareUrl={shareUrl}
        dateTally={dateTally}
        budgetTally={budgetTally}
        genreTally={genreTally}
        attendCounts={attendCounts}
        maxCount={maxCount}
        totalResponses={totalResponses}
      />
    </main>
  );
}
