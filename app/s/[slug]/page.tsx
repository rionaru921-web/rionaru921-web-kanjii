import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import SurveyResponseForm from "@/components/surveys/SurveyResponseForm";
import type { PublicSurvey } from "@/lib/surveys/types";

// Public, unauthenticated view — same admin-client + single-row-by-token
// pattern as app/share/plan/[token]/page.tsx (see audit_report.md). No RLS
// policy exposes surveys publicly; this route is the only path in.
export const dynamic = "force-dynamic";

async function fetchSurvey(slug: string): Promise<PublicSurvey | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("surveys")
    .select(
      "id, title, description, event_type, ask_dates, ask_budget, ask_genre, ask_attend, date_options, budget_options, genre_options, optional_questions, deadline, status, slug, created_at, updated_at"
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  return data as PublicSurvey | null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const survey = await fetchSurvey(params.slug);
  if (!survey) return { title: "アンケートが見つかりません" };
  return {
    title: `${survey.title} | 幹事ラボ`,
    description: survey.description || "幹事ラボで作られたアンケートに回答する",
  };
}

export default async function PublicSurveyPage({ params }: { params: { slug: string } }) {
  const survey = await fetchSurvey(params.slug);

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <p className="text-center font-serif font-bold text-lg text-gold mb-6">幹事ラボ</p>

        {!survey ? (
          <div className="rounded-3xl bg-surface-tertiary shadow-warm p-8 text-center">
            <p className="text-ink-secondary">このアンケートは見つかりませんでした。</p>
            <p className="text-xs text-ink-muted mt-2">締め切られたか、リンクが正しくない可能性があります。</p>
          </div>
        ) : (
          <div className="rounded-3xl bg-surface-tertiary shadow-warm p-6 sm:p-8">
            <h1 className="font-serif font-bold text-xl text-ink mb-1">{survey.title}</h1>
            {survey.description && (
              <p className="text-sm text-ink-secondary mb-6 whitespace-pre-wrap">{survey.description}</p>
            )}
            <SurveyResponseForm survey={survey} />
          </div>
        )}
      </div>
    </div>
  );
}
