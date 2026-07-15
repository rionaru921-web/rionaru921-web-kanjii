import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const FEEDBACK_TO_EMAIL = "steplife.contact@gmail.com";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const body = (await req.json()) as { rating?: unknown; comment?: unknown };
  const rating = Number(body.rating);
  const comment = typeof body.comment === "string" ? body.comment.trim() : "";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "満足度は1〜5で選択してください。" }, { status: 400 });
  }
  if (comment.length === 0) {
    return NextResponse.json({ error: "コメントを入力してください。" }, { status: 400 });
  }
  if (comment.length > 2000) {
    return NextResponse.json({ error: "コメントは2000文字以内で入力してください。" }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "メール送信が設定されていません。管理者にRESEND_API_KEYの設定を依頼してください。" },
      { status: 500 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const resend = new Resend(process.env.RESEND_API_KEY);
  const sentAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

  const { error } = await resend.emails.send({
    // Falls back to Resend's shared sandbox sender when no verified domain
    // is configured yet, so feedback still delivers in early deployments.
    from: process.env.RESEND_FROM_EMAIL || "幹事ラボ <onboarding@resend.dev>",
    to: FEEDBACK_TO_EMAIL,
    subject: `[幹事ラボ] 新しいフィードバック(★${rating})`,
    text: [
      `送信者メールアドレス: ${user.email ?? "不明"}`,
      `表示名: ${profile?.display_name ?? "未設定"}`,
      `user_id: ${user.id}`,
      `満足度: ${"★".repeat(rating)}${"☆".repeat(5 - rating)}`,
      "",
      "コメント:",
      comment,
      "",
      `送信日時: ${sentAt}`,
    ].join("\n"),
  });

  if (error) {
    return NextResponse.json(
      { error: "メール送信に失敗しました。時間をおいて再度お試しください。" },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
