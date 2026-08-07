import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildSurveyResultsProps } from "@/lib/surveys/build-results";
import { buildSurveyResponsesCsv } from "@/lib/surveys/csv-export";
import SurveyResultsView from "@/components/surveys/SurveyResultsView";
import ResultsPublicToggle from "@/components/surveys/ResultsPublicToggle";
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
  const results = buildSurveyResultsProps(typedSurvey, typedResponses);
  const csv = buildSurveyResponsesCsv(typedSurvey, typedResponses);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  const shareUrl = `${baseUrl}/s/${typedSurvey.slug}`;

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-1">
        <h1 className="font-serif font-bold text-2xl text-ink">{typedSurvey.title}</h1>
      </div>
      {typedSurvey.description && <p className="text-sm text-ink-secondary mb-4">{typedSurvey.description}</p>}

      <div className="mb-6">
        <ResultsPublicToggle slug={typedSurvey.slug} initialValue={typedSurvey.results_public} />
      </div>

      <SurveyResultsView
        survey={typedSurvey}
        shareUrl={shareUrl}
        mode="owner"
        csv={csv}
        responses={typedResponses}
        {...results}
      />
    </main>
  );
}
