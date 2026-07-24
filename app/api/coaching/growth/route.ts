import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateLevel, progressToNext } from "@/lib/coaching/level";

/**
 * GET /api/coaching/growth
 */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    return NextResponse.json({ error: "アカウント登録が必要です" }, { status: 401 });
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // total/thisMonth are counted independently of the 50-row list fetch below —
  // otherwise a user past 50 completed sessions would have their level
  // progress capped at 50 forever.
  const [{ data: sessions, error }, { count: total }, { count: thisMonthCount }] = await Promise.all([
    supabase
      .from("coaching_sessions")
      .select("id, plan_type, plan_id, ai_summary, ai_strengths, completed_at, created_at")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(50),
    supabase
      .from("coaching_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed"),
    supabase
      .from("coaching_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("completed_at", monthStart),
  ]);

  if (error) {
    console.error("[coaching/growth] error:", error);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }

  const completedCount = total ?? 0;
  const level = calculateLevel(completedCount);
  const progress = progressToNext(completedCount);

  return NextResponse.json({
    stats: {
      total: completedCount,
      thisMonth: thisMonthCount ?? 0,
    },
    level,
    progress,
    sessions: sessions ?? [],
  });
}
