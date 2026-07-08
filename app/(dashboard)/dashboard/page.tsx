import Link from "next/link";
import { CalendarCheck, Clock, Users, Wine, Plane, MapPin } from "lucide-react";
import GoldButton from "@/components/shared/GoldButton";
import { createClient } from "@/lib/supabase/server";

const STATS = [
  { icon: CalendarCheck, label: "今月の開催回数", value: "03", unit: "回" },
  { icon: Clock, label: "節約時間", value: "18.5", unit: "時間" },
  { icon: Users, label: "総幹事人数", value: "146", unit: "人" },
];

const UPCOMING = [
  {
    title: "忘年会 with 営業部",
    date: "2026-07-18 19:00",
    place: "栄・個室居酒屋 灯火",
    icon: Wine,
  },
  {
    title: "京都旅行(1泊2日)",
    date: "2026-08-02〜08-03",
    place: "京都駅周辺",
    icon: Plane,
  },
];

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "ゲスト";

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
        <h2 className="font-serif font-bold text-lg text-ink mb-4">最近の予定</h2>
        <div className="flex flex-col gap-3">
          {UPCOMING.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href="/dashboard"
                className="flex items-center gap-4 rounded-3xl bg-surface-tertiary shadow-warm p-4 hover:shadow-warm-hover hover:-translate-y-0.5 transition-all"
              >
                <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-gold/10 text-gold shrink-0">
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{item.title}</p>
                  <p className="text-xs text-ink-secondary mt-0.5">{item.date}</p>
                  <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                    <MapPin size={11} />
                    {item.place}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
