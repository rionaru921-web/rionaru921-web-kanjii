import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateAttendanceDetail, validateOptionalAnswers } from "@/lib/surveys/validate";
import type { AttendanceDetail, OptionalAnswers } from "@/lib/surveys/types";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ベストエフォート送信: 失敗しても回答の保存自体は成功として扱う
// (cron/send-reminders と同じく、メール送信の失敗で本処理を止めない)。
async function sendResponseConfirmationEmail(
  email: string,
  slug: string,
  survey: { title: string; results_public: boolean }
) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kanji-lab.com";
  const resultsUrl = `${baseUrl}/s/${slug}/results`;
  const safeTitle = escapeHtml(survey.title);

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "幹事ラボ <onboarding@resend.dev>",
      to: email,
      subject: `【幹事ラボ】「${survey.title}」への回答ありがとうございます`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.7; color: #2A2624; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #9F4642;">幹事ラボ</h2>
          <p>アンケート「<strong>${safeTitle}</strong>」にご回答いただきありがとうございました。</p>
          ${
            survey.results_public
              ? `<p>他の参加者の回答もぜひご覧ください:</p>
                 <p><a href="${resultsUrl}" style="display: inline-block; padding: 12px 24px; background: #B8935A; color: #fff; text-decoration: none; border-radius: 24px;">みんなの回答を見る</a></p>`
              : ""
          }
          <hr style="border: none; border-top: 1px solid #E4D9C4; margin: 24px 0;">
          <p style="color: #8B8378; font-size: 12px;">
            幹事ラボ - あらゆる集まりを、あなたが幹事する<br>
            https://kanji-lab.com
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[survey response confirmation email] failed:", err);
  }
}

interface SubmitResponseBody {
  respondent_name: string;
  respondent_email?: string | null;
  selected_dates?: string[];
  selected_budget?: string | null;
  selected_genre?: string | null;
  will_attend?: "yes" | "no" | "maybe" | null;
  attendance_detail?: AttendanceDetail | null;
  optional_answers?: OptionalAnswers;
  free_comment?: string | null;
}

// POST: 回答送信。ゲスト(未ログイン・匿名認証どちらも)可。
// share/plan/[token]/attendance と同じく service-role で書き込むが、
// respondent_user_id だけは(あれば)通常のセッション連動クライアントで
// 取得したユーザーIDを添える — 匿名認証セッションは記録しない
// (surveys の作成同様、回答者の紐付けは実アカウントのみ)。
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const body: SubmitResponseBody = await req.json();

  if (!body.respondent_name?.trim()) {
    return NextResponse.json({ error: "お名前は必須です。" }, { status: 400 });
  }

  const optionalAnswersResult = validateOptionalAnswers(body.optional_answers);
  if (!optionalAnswersResult.ok) {
    return NextResponse.json({ error: optionalAnswersResult.error }, { status: 400 });
  }
  const attendanceDetailResult = validateAttendanceDetail(body.attendance_detail);
  if (!attendanceDetailResult.ok) {
    return NextResponse.json({ error: attendanceDetailResult.error }, { status: 400 });
  }

  const sessionClient = createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  const admin = createAdminClient();

  const { data: survey } = await admin
    .from("surveys")
    .select("id, title, status, deadline, results_public")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!survey || survey.status !== "active") {
    return NextResponse.json({ error: "アンケートが見つかりません。" }, { status: 404 });
  }
  if (survey.deadline && new Date(survey.deadline) < new Date()) {
    return NextResponse.json({ error: "回答の締切を過ぎています。" }, { status: 400 });
  }

  const { data: response, error } = await admin
    .from("survey_responses")
    .insert({
      survey_id: survey.id,
      respondent_user_id: user && !user.is_anonymous ? user.id : null,
      respondent_name: body.respondent_name.trim(),
      respondent_email: body.respondent_email?.trim() || null,
      selected_dates: body.selected_dates ?? [],
      selected_budget: body.selected_budget || null,
      selected_genre: body.selected_genre || null,
      will_attend: body.will_attend || null,
      attendance_detail: attendanceDetailResult.value,
      optional_answers: optionalAnswersResult.value,
      free_comment: body.free_comment?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "回答の保存に失敗しました。" }, { status: 500 });
  }

  const email = body.respondent_email?.trim();
  if (email) {
    await sendResponseConfirmationEmail(email, params.slug, survey);
  }

  return NextResponse.json({ response });
}

// GET: 集計取得(オーナーのみ)。RLSの "Survey owner can read responses"
// ポリシーがそのまま効くので、通常のセッション連動クライアントで良い
// (admin client不要)。
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const { data: survey } = await supabase
    .from("surveys")
    .select("id")
    .eq("slug", params.slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!survey) {
    return NextResponse.json({ error: "見つかりません。" }, { status: 404 });
  }

  const { data: responses, error } = await supabase
    .from("survey_responses")
    .select("*")
    .eq("survey_id", survey.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ responses: responses ?? [] });
}
