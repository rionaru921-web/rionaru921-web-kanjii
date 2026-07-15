import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const FEEDBACK_TO_EMAIL = "steplife.contact@gmail.com";

const CATEGORY_LABELS: Record<string, string> = {
  bug: "バグ報告",
  feature: "機能要望",
  question: "使い方の質問",
  other: "その他",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Separate from app/api/feedback/route.ts (the dashboard ★評価 satisfaction
// survey, which requires login) — this endpoint backs the site-wide
// floating feedback widget and is intentionally usable while signed out.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { category?: unknown; content?: unknown; email?: unknown };

  const category = typeof body.category === "string" ? body.category : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!CATEGORY_LABELS[category]) {
    return NextResponse.json({ error: "カテゴリを選択してください。" }, { status: 400 });
  }
  if (content.length < 10) {
    return NextResponse.json({ error: "内容は10文字以上でご入力ください。" }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: "内容は2000文字以内で入力してください。" }, { status: 400 });
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "メールアドレスの形式が正しくありません。" }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "メール送信が設定されていません。管理者にRESEND_API_KEYの設定を依頼してください。" },
      { status: 500 }
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const resend = new Resend(process.env.RESEND_API_KEY);
  const sentAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "幹事ラボ <onboarding@resend.dev>",
    to: FEEDBACK_TO_EMAIL,
    replyTo: email || undefined,
    subject: `[幹事ラボ Feedback] ${CATEGORY_LABELS[category]}`,
    text: [
      `カテゴリ: ${CATEGORY_LABELS[category]}`,
      `返信先メールアドレス: ${email || "未入力"}`,
      `user_id: ${user?.id ?? "未ログイン"}`,
      "",
      "内容:",
      content,
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

  return NextResponse.json({ ok: true });
}
