import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "回答ありがとうございました",
};

export default async function SurveyThanksPage({ params }: { params: { slug: string } }) {
  const supabase = createAdminClient();
  const { data: survey } = await supabase
    .from("surveys")
    .select("title")
    .eq("slug", params.slug)
    .maybeSingle();

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <p className="text-center font-serif font-bold text-lg text-gold mb-6">幹事ラボ</p>

        <div className="rounded-3xl bg-surface-tertiary shadow-warm p-8 flex flex-col items-center text-center gap-4">
          <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 text-gold">
            <CheckCircle2 size={26} />
          </span>
          <div>
            <p className="font-serif font-bold text-lg text-ink">回答ありがとうございました</p>
            {survey?.title && <p className="text-sm text-ink-secondary mt-1">「{survey.title}」への回答を送信しました</p>}
          </div>

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
