import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAiUsageStatus, incrementAiUsage } from "@/lib/plans/checkAiUsage";
import { generateCoachFeedback, type QAPair } from "@/lib/coaching/generateFeedback";
import { fetchOwnedPlan, type PlanContext } from "@/lib/coaching/planContext";

/**
 * POST /api/coaching/complete
 * body: { session_id }
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
  const { session_id } = body;

  if (!session_id) {
    return NextResponse.json({ error: "session_id が必要です" }, { status: 400 });
  }

  const usage = await getAiUsageStatus(user.id);
  if (!usage.allowed) {
    return NextResponse.json(
      {
        error: "AI使用回数の上限に達しました",
        code: "AI_LIMIT_REACHED",
        remaining: 0,
      },
      { status: 429 }
    );
  }

  const { data: session, error: fetchError } = await supabase
    .from("coaching_sessions")
    .select("*")
    .eq("id", session_id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !session) {
    return NextResponse.json({ error: "セッションが見つかりません" }, { status: 404 });
  }

  if (session.status === "completed") {
    return NextResponse.json({ session, already_completed: true });
  }

  const qaPairs = (session.qa_pairs as QAPair[]) ?? [];
  if (qaPairs.length === 0) {
    return NextResponse.json({ error: "回答がありません" }, { status: 400 });
  }

  // Best-effort: if the underlying plan was deleted since the session
  // started, fall back to a bare context rather than blocking feedback
  // generation on it — the qa_pairs answers still carry the useful signal.
  let planContext: PlanContext = { type: session.plan_type };
  try {
    const owned = await fetchOwnedPlan(supabase, user.id, session.plan_type, session.plan_id);
    if (owned.exists) {
      planContext = owned.context;
    }
  } catch (e) {
    console.warn("[coaching/complete] plan context fetch failed:", e);
  }

  let feedback;
  try {
    feedback = await generateCoachFeedback(qaPairs, planContext);
  } catch (e) {
    console.error("[coaching/complete] AI generation failed:", e);
    return NextResponse.json(
      { error: "AIフィードバック生成に失敗しました。しばらくしてから再度お試しください。" },
      { status: 500 }
    );
  }

  // Best-effort, same pattern as /api/ai/suggest — a failed counter update
  // shouldn't turn an already-generated result into a 500 for the caller.
  try {
    await incrementAiUsage(user.id);
  } catch (incrementErr) {
    console.error("[coaching/complete] failed to increment usage count:", incrementErr);
  }

  const { data: updated, error: updateError } = await supabase
    .from("coaching_sessions")
    .update({
      ai_summary: feedback.summary,
      ai_strengths: feedback.strengths,
      ai_improvements: feedback.improvements,
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", session_id)
    .select()
    .single();

  if (updateError) {
    console.error("[coaching/complete] update error:", updateError);
    return NextResponse.json({ error: "セッション完了に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ session: updated });
}
