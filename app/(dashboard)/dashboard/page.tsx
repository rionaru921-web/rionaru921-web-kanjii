import Link from "next/link";
import { CalendarCheck, Users, Layers, Wine, Plane, History as HistoryIcon } from "lucide-react";
import GoldButton from "@/components/shared/GoldButton";
import { createClient } from "@/lib/supabase/server";
import type { HistoryPayload } from "@/lib/history/types";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "ゲスト";

  const { data: history } = user
    ? await supabase
        .from("history")
        .select("id, type, title, event_date, created_at, payload")
        .order("created_at", { ascending: false })
    : { data: [] };

  const records = history ?? [];
  const now = new Date();
  const thisMonthCount = records.filter((item) => {
    const created = new Date(item.created_at);
    return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
  }).length;
  const totalParticipants = records.reduce((sum, item) => {
    const payload = item.payload as HistoryPayload;
    return sum + (payload?.pdf?.participants?.length ?? 0);
  }, 0);

  const STATS = [
    { icon: CalendarCheck, label: "今月の開催回数", value: String(thisMonthCount), unit: "回" },
    { icon: Layers, label: "開催回数（累計）", value: String(records.length), unit: "回" },
    { icon: Users, label: "のべ参加人数", value: String(totalParticipants), unit: "人" },
  ];

  const RECENT = records.slice(0, 3);

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-5xl mx-auto">
      <h1 className="font-serif font-bold text-3xl text-ink mb-2 leading-tight">
        おかえりなさい、
        <br className="sm:hidden" />
        {displayName}さん
      </h1>
      <p className="text-sm text-ink-secondary mb-10">
        今日も幹事業務、Kanjiiにお任せください。
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-3xl bg-surface-tertiary p-6 shadow-warm"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold/10 text-gold mb-4">
                <Icon size={18} />
              </span>
              <p className="text-xs text-ink-muted mb-1">{stat.label}</p>
              <p className="font-display-num font-black text-4xl text-ink">
                {stat.value}
                <span className="font-sans text-sm font-normal text-ink-secondary ml-1">
                  {stat.unit}
                </span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <GoldButton href="/nomikai" size="lg" icon={Wine} fullWidth>
          飲み会を計画する
        </GoldButton>
        <GoldButton href="/travel" size="lg" variant="outline" icon={Plane} fullWidth>
          旅行を計画する
        </GoldButton>
      </div>

      <div>
        <h2 className="font-serif font-bold text-lg text-ink mb-4">最近の履歴</h2>
        {RECENT.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14 gap-3 rounded-3xl bg-surface-tertiary shadow-warm">
            <HistoryIcon className="text-ink-muted" size={32} />
            <p className="text-ink-secondary text-sm">まだ履歴がありません。最初の幹事を始めましょう</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {RECENT.map((item) => {
              const Icon = item.type === "nomikai" ? Wine : Plane;
              return (
                <Link
                  key={item.id}
                  href={`/history/${item.id}`}
                  className="flex items-center gap-4 rounded-3xl bg-surface-tertiary shadow-warm p-4 hover:shadow-warm-hover hover:-translate-y-0.5 transition-all"
                >
                  <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-gold/10 text-gold shrink-0">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink truncate">{item.title}</p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {item.event_date ?? new Date(item.created_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
