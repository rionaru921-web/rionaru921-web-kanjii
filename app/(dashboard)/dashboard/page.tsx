import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import WelcomeHero from "@/components/dashboard/WelcomeHero";
import ProfileCard from "@/components/dashboard/ProfileCard";
import StatsSection from "@/components/dashboard/StatsSection";
import QuickActions from "@/components/dashboard/QuickActions";
import DailyTip from "@/components/dashboard/DailyTip";
import RecentPlans, { type RecentPlanItem } from "@/components/dashboard/RecentPlans";
import Announcements from "@/components/dashboard/Announcements";

export const metadata: Metadata = {
  title: "マイダッシュボード",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle()
    : { data: null };

  const displayName =
    profile?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "ゲスト";

  const { data: history } = user
    ? await supabase
        .from("history")
        .select("id, type, title, event_date, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const { data: manualPlans } = user
    ? await supabase
        .from("manual_plans")
        .select("id, title, event_date, end_date, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: [] };

  const { count: manualPlansCount } = user
    ? await supabase
        .from("manual_plans")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
    : { count: 0 };

  const historyRecords = history ?? [];
  const totalPlanCount = historyRecords.length + (manualPlansCount ?? 0);

  const recentItems: RecentPlanItem[] = [
    ...historyRecords.map((h) => ({ kind: "history" as const, ...h })),
    ...(manualPlans ?? []).map((m) => ({ kind: "manual" as const, ...m })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-5xl mx-auto space-y-6">
      <WelcomeHero displayName={displayName} />

      {user && <ProfileCard userId={user.id} email={user.email ?? ""} displayName={displayName} />}

      <StatsSection totalCount={totalPlanCount} />

      <QuickActions />

      <DailyTip />

      <RecentPlans records={recentItems} />

      <Announcements />
    </main>
  );
}
