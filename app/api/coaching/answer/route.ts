import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getQuestion, TOTAL_STEPS } from "@/lib/coaching/questions";

/**
 * POST /api/coaching/answer
 * body: { session_id, step, answer }
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
  const { session_id, step, answer } = body;

  if (!session_id || typeof step !== "number" || answer === undefined) {
    return NextResponse.json({ error: "パラメータ不足" }, { status: 400 });
  }

  const question = getQuestion(step);
  if (!question) {
    return NextResponse.json({ error: "不正なステップ番号" }, { status: 400 });
  }

  const answerStr = String(answer).trim();
  if (!question.optional && !answerStr) {
    return NextResponse.json({ error: "回答が空です" }, { status: 400 });
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

  if (session.status !== "in_progress") {
    return NextResponse.json({ error: "このセッションは既に完了しています" }, { status: 400 });
  }

  const existingPairs = Array.isArray(session.qa_pairs) ? session.qa_pairs : [];
  const newPair = {
    step,
    key: question.key,
    question: question.question,
    answer: answerStr,
    answered_at: new Date().toISOString(),
  };
  const updatedPairs = [
    ...existingPairs.filter((p: { step: number }) => p.step !== step),
    newPair,
  ].sort((a, b) => a.step - b.step);

  const nextStep = Math.max(step, session.current_step) + 1;
  const isCompleted = step >= TOTAL_STEPS;

  const { data: updated, error: updateError } = await supabase
    .from("coaching_sessions")
    .update({
      qa_pairs: updatedPairs,
      current_step: isCompleted ? TOTAL_STEPS : nextStep,
    })
    .eq("id", session_id)
    .select()
    .single();

  if (updateError) {
    console.error("[coaching/answer] error:", updateError);
    return NextResponse.json({ error: "回答保存に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({
    session: updated,
    is_completed: isCompleted,
    total_steps: TOTAL_STEPS,
  });
}
