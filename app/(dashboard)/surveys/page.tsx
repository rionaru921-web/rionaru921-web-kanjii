import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, Lock, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import GoldButton from "@/components/shared/GoldButton";
import type { Survey } from "@/lib/surveys/types";

export const metadata: Metadata = {
  title: "アンケート",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SurveysPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/surveys");
  }

  if (user.is_anonymous) {
    return (
      <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-4xl mx-auto">
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

  const { data: surveys } = await supabase
    .from("surveys")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const items = (surveys ?? []) as Survey[];

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif font-bold text-2xl text-ink mb-1">アンケート</h1>
          <p className="text-sm text-ink-secondary">みんなの都合・希望を集めましょう</p>
        </div>
        <GoldButton href="/surveys/new" icon={Plus} size="md">
          作成
        </GoldButton>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-3 rounded-3xl bg-surface-tertiary shadow-warm">
          <ClipboardList className="text-ink-muted" size={40} />
          <p className="text-ink-secondary">まだアンケートがありません</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((survey) => (
            <Link
              key={survey.id}
              href={`/surveys/${survey.id}`}
              className="flex flex-col gap-2 rounded-3xl bg-surface-tertiary shadow-warm p-5 hover:shadow-warm-hover hover:-translate-y-0.5 transition-[box-shadow,transform]"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-serif font-semibold text-ink truncate">{survey.title}</p>
                <span
                  className={`shrink-0 text-[10px] rounded-full px-2 py-0.5 ${
                    survey.status === "active"
                      ? "bg-gold/10 text-gold"
                      : "bg-ink-muted/15 text-ink-muted"
                  }`}
                >
                  {survey.status === "active" ? "回答受付中" : survey.status === "closed" ? "締切済み" : "アーカイブ"}
                </span>
              </div>
              {survey.description && (
                <p className="text-xs text-ink-muted line-clamp-2">{survey.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
