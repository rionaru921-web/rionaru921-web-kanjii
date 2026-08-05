import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, BarChart3 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import ChochinIcon from "@/components/shared/ChochinIcon";
import ShareButtons from "@/components/surveys/ShareButtons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "回答ありがとうございました",
};

export default async function SurveyThanksPage({ params }: { params: { slug: string } }) {
  const supabase = createAdminClient();
  const { data: survey } = await supabase
    .from("surveys")
    .select("title, results_public")
    .eq("slug", params.slug)
    .maybeSingle();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  const shareUrl = `${baseUrl}/s/${params.slug}`;

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <p className="text-center font-serif font-bold text-lg text-gold mb-6">幹事ラボ</p>

        <div className="rounded-3xl bg-surface-tertiary shadow-warm p-8 flex flex-col items-center text-center gap-4">
          <ChochinIcon className="w-16 h-20 animate-chochin-sway origin-top" />
          <div>
            <p className="font-serif font-bold text-lg text-ink">回答ありがとうございました</p>
            {survey?.title && <p className="text-sm text-ink-secondary mt-1">「{survey.title}」への回答を送信しました</p>}
          </div>

          {survey?.title && survey.results_public && (
            <Link
              href={`/s/${params.slug}/results`}
              className="flex items-center justify-center gap-2 w-full rounded-full border border-gold/30 text-gold font-serif font-semibold py-3 text-sm hover:bg-gold/5 transition-colors"
            >
              <BarChart3 size={16} />
              みんなの回答を見る
            </Link>
          )}

          {survey?.title && (
            <div className="w-full border-t border-gold/10 pt-4">
              <p className="text-xs text-ink-muted mb-3">よかったら、他の参加者にもシェアしてみましょう</p>
              <ShareButtons url={shareUrl} title={survey.title} />
            </div>
          )}

          <div className="w-full border-t border-gold/10 pt-4 mt-2">
            <p className="text-xs text-ink-muted mb-3">幹事ラボは、飲み会・旅行の幹事業務をラクにするツールです</p>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-full bg-gold-gradient text-white font-bold py-3 text-sm hover:brightness-110 transition-all shadow-gold"
            >
              <Sparkles size={16} />
              自分でも幹事プランを作ってみる
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
