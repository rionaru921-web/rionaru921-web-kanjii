import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EyeOff, ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildSurveyResultsProps } from "@/lib/surveys/build-results";
import SurveyResultsView from "@/components/surveys/SurveyResultsView";
import ChochinIcon from "@/components/shared/ChochinIcon";
import type { PublicSurvey, SurveyResponse } from "@/lib/surveys/types";

// 回答者にも見せる公開集計ページ。app/s/[slug]/page.tsx と同じ
// admin-client + slug 一致のみで絞り込む公開アクセスパターン
// (個別回答は SurveyResultsView が元々一切出さない設計なので、ここでは
// survey.results_public のオン/オフだけをアクセス制御として扱う)。
export const dynamic = "force-dynamic";

async function fetchSurvey(slug: string): Promise<PublicSurvey | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("surveys")
    .select(
      "id, title, description, event_type, ask_dates, ask_budget, ask_genre, ask_attend, date_options, budget_options, genre_options, optional_questions, deadline, status, slug, results_public, created_at, updated_at"
    )
    .eq("slug", slug)
    .maybeSingle();
  return data as PublicSurvey | null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const survey = await fetchSurvey(params.slug);
  if (!survey) return { title: "アンケートが見つかりません" };
  return {
    title: `${survey.title}のみんなの回答 | 幹事ラボ`,
    description: `「${survey.title}」に寄せられた回答の集計です。`,
    robots: survey.results_public ? undefined : { index: false, follow: false },
  };
}

export default async function PublicSurveyResultsPage({ params }: { params: { slug: string } }) {
  const survey = await fetchSurvey(params.slug);
  if (!survey) notFound();

  if (!survey.results_public) {
    return (
      <div className="min-h-dvh bg-surface flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <p className="text-center font-serif font-bold text-lg text-gold mb-6">幹事ラボ</p>
          <div className="rounded-3xl bg-surface-tertiary shadow-warm p-8 flex flex-col items-center text-center gap-4">
            <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 text-gold">
              <EyeOff size={26} />
            </span>
            <p className="text-sm text-ink-secondary">このアンケートの集計は非公開に設定されています。</p>
            <Link
              href={`/s/${params.slug}`}
              className="inline-flex items-center gap-1.5 text-sm text-gold hover:brightness-125"
            >
              <ArrowLeft size={14} />
              アンケートに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const admin = createAdminClient();
  const { data: responses } = await admin.from("survey_responses").select("*").eq("survey_id", survey.id);
  const typedResponses = (responses ?? []) as SurveyResponse[];
  const results = buildSurveyResultsProps(survey, typedResponses);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  const resultsUrl = `${baseUrl}/s/${survey.slug}/results`;

  return (
    <div className="min-h-dvh bg-surface px-4 py-10">
      <div className="w-full max-w-lg mx-auto">
        <p className="text-center font-serif font-bold text-lg text-gold mb-6">幹事ラボ</p>

        <div className="text-center mb-6">
          <ChochinIcon className="w-12 h-16 mx-auto mb-3" />
          <h1 className="font-serif text-2xl text-ink mb-1">{survey.title}</h1>
          <p className="text-ink-secondary text-sm">みんなの回答</p>
        </div>

        <SurveyResultsView survey={survey} shareUrl={resultsUrl} mode="public" {...results} />
      </div>
    </div>
  );
}
