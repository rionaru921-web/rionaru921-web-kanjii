import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SurveyForm from "@/components/surveys/SurveyForm";

export const metadata: Metadata = {
  title: "アンケートを作成",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewSurveyPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/surveys/new");
  }

  // Guests (anonymous auth) never actually reach /login=>redirectTo — the
  // middleware bounces any already-authenticated session (anonymous
  // included) straight to /dashboard from /login, dropping the query param
  // (lib/supabase/middleware.ts). So, same as /surveys and
  // /settings/growth, show an inline explanation instead of redirecting.
  if (user.is_anonymous) {
    return (
      <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center gap-3 rounded-3xl bg-surface-tertiary shadow-warm p-8">
          <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gold/10 text-gold">
            <Lock size={20} />
          </span>
          <p className="text-sm text-ink-secondary leading-relaxed">
            アンケート機能はアカウントに紐づけて集計するため、ゲストモードではご利用いただけません。アカウントを作成すると使えるようになります。
          </p>
          <Link
            href="/settings/upgrade"
            className="mt-2 rounded-full bg-gold-gradient text-white text-sm font-bold px-6 py-2.5 hover:brightness-110 transition-all shadow-gold"
          >
            アカウントを作成する
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 sm:px-8 pt-8 sm:pt-10 pb-28 max-w-2xl mx-auto">
      <h1 className="font-serif font-bold text-2xl text-ink mb-1 text-center">アンケートを作成</h1>
      <p className="text-sm text-ink-secondary mb-6 text-center">
        みんなの都合・希望を集めて、幹事の準備をラクにしましょう。
      </p>
      <SurveyForm />
    </main>
  );
}
