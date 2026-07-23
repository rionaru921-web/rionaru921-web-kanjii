import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchOwnedPlan, type PlanType } from "@/lib/coaching/planContext";

const PLAN_TYPES: PlanType[] = ["nomikai", "travel", "manual"];

/**
 * GET /api/coaching/session?plan_type=nomikai&plan_id=xxx
 */
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    return NextResponse.json({ error: "アカウント登録が必要です" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const planType = searchParams.get("plan_type");
  const planId = searchParams.get("plan_id");

  if (!planType || !planId) {
    return NextResponse.json({ error: "plan_type と plan_id は必須です" }, { status: 400 });
  }

  if (!PLAN_TYPES.includes(planType as PlanType)) {
    return NextResponse.json({ error: "不正な plan_type です" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("coaching_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("plan_type", planType)
    .eq("plan_id", planId)
    .maybeSingle();

  if (error) {
    console.error("[coaching/session GET] error:", error);
    return NextResponse.json({ error: "セッション取得に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ session: data });
}

/**
 * POST /api/coaching/session
 * body: { plan_type, plan_id }
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    return NextResponse.json({ error: "アカウント登録が必要です" }, { status: 401 });
  }

  const body = await request.json();
  const { plan_type, plan_id } = body;

  if (!plan_type || !plan_id) {
    return NextResponse.json({ error: "plan_type と plan_id は必須です" }, { status: 400 });
  }

  if (!PLAN_TYPES.includes(plan_type)) {
    return NextResponse.json({ error: "不正な plan_type です" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("coaching_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("plan_type", plan_type)
    .eq("plan_id", plan_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ session: existing, resumed: true });
  }

  // Verify the plan exists, belongs to this user, and is actually finished
  // before letting them start a coaching session against it — otherwise a
  // caller could point plan_id at someone else's data (context fetch would
  // just fail silently) or burn AI quota reflecting on a plan that hasn't
  // happened yet.
  const owned = await fetchOwnedPlan(supabase, user.id, plan_type, plan_id);
  if (!owned.exists) {
    return NextResponse.json({ error: "対象のプランが見つかりません" }, { status: 404 });
  }
  if (!owned.completed) {
    return NextResponse.json(
      { error: "このプランはまだ完了していません" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("coaching_sessions")
    .insert({
      user_id: user.id,
      plan_type,
      plan_id,
      qa_pairs: [],
      current_step: 0,
      status: "in_progress",
    })
    .select()
    .single();

  if (error) {
    console.error("[coaching/session POST] error:", error);
    return NextResponse.json({ error: "セッション作成に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ session: data, resumed: false });
}
