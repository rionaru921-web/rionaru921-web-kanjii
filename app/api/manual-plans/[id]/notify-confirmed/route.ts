import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { formatJstDateTime } from "@/lib/date/kanjii-time";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// 幹事が明示的に押すボタンからのみ叩かれる通知(cron ではない)。
// 「確定」というプラン側の状態を新設せず、押すたびに現在の内容で送信する
// 単純な設計 — 会場変更後に再送したい、というケースもそのまま拾える。
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "メール送信が設定されていません。" }, { status: 503 });
  }

  const { data: plan } = await supabase
    .from("manual_plans")
    .select("id, title, event_date, venue_name, share_token, manual_plan_members(name, email)")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!plan) {
    return NextResponse.json({ error: "プランが見つかりません。" }, { status: 404 });
  }
  if (!plan.event_date) {
    return NextResponse.json({ error: "日程が未設定のため送信できません。" }, { status: 400 });
  }

  const members = (plan.manual_plan_members ?? []) as { name: string; email: string | null }[];
  const recipients = Array.from(new Set(members.map((m) => m.email).filter((e): e is string => !!e)));

  if (recipients.length === 0) {
    return NextResponse.json({ error: "送信先のメールアドレスが登録されていません。" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kanji-lab.com";
  const shareUrl = `${baseUrl}/share/plan/${plan.share_token}`;
  const icsUrl = `${baseUrl}/api/share/plan/${plan.share_token}/ics`;
  const dateLabel = formatJstDateTime(plan.event_date);
  const safeTitle = escapeHtml(plan.title);

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { error: sendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "幹事ラボ <onboarding@resend.dev>",
      to: recipients,
      subject: `【幹事ラボ】「${plan.title}」の日程・詳細が確定しました`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.7; color: #2A2624; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #9F4642;">幹事ラボからのお知らせ</h2>
          <p><strong>${safeTitle}</strong> の詳細が確定しました。</p>
          <p>
            日時: ${dateLabel}<br>
            ${plan.venue_name ? `会場: ${escapeHtml(plan.venue_name)}<br>` : ""}
          </p>
          <p>
            <a href="${icsUrl}" style="display: inline-block; padding: 10px 20px; background: #B8935A; color: #fff; text-decoration: none; border-radius: 24px;">カレンダーに追加</a>
          </p>
          <p><a href="${shareUrl}" style="color: #9F4642;">プランの詳細を見る</a></p>
          <hr style="border: none; border-top: 1px solid #E4D9C4; margin: 24px 0;">
          <p style="color: #8B8378; font-size: 12px;">
            幹事ラボ - あらゆる集まりを、あなたが幹事する<br>
            https://kanji-lab.com
          </p>
        </div>
      `,
    });

    if (sendError) {
      console.error("[notify-confirmed] resend error:", sendError);
      return NextResponse.json({ error: "送信に失敗しました。" }, { status: 500 });
    }
  } catch (err) {
    console.error("[notify-confirmed] unexpected error:", err);
    return NextResponse.json({ error: "送信に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({ success: true, sent: recipients.length });
}
