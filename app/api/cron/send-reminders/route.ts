import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatJstDateTime } from "@/lib/date/kanjii-time";

export const runtime = "nodejs";
export const maxDuration = 60;

// JST(UTC+09:00, DSTなし)基準で「明日」のカレンダー日の範囲を、
// event_date(timestamptz)に対する UTC の [start, end) として返す。
// cron 自体は毎日 UTC 11:00 = JST 20:00 に発火する想定(vercel.json 参照)。
function getTomorrowJstRangeUtc(): { start: Date; end: Date } {
  const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const jstNow = new Date(Date.now() + JST_OFFSET_MS);
  const jstTomorrow = new Date(jstNow.getTime() + 24 * 60 * 60 * 1000);
  const y = jstTomorrow.getUTCFullYear();
  const m = String(jstTomorrow.getUTCMonth() + 1).padStart(2, "0");
  const d = String(jstTomorrow.getUTCDate()).padStart(2, "0");
  const start = new Date(`${y}-${m}-${d}T00:00:00+09:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET が設定されていません。" },
      { status: 503 }
    );
  }

  // Vercel Cron は起動時に `Authorization: Bearer $CRON_SECRET` を自動付与する。
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY が設定されていません。" },
      { status: 503 }
    );
  }

  const admin = createAdminClient();
  const resend = new Resend(process.env.RESEND_API_KEY);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kanji-lab.com";
  const { start, end } = getTomorrowJstRangeUtc();

  const { data: plans, error } = await admin
    .from("manual_plans")
    .select(
      "id, user_id, share_token, title, event_date, venue_name, manual_plan_members(name, email)"
    )
    .eq("is_favorite", false)
    .eq("reminder_sent", false)
    .gte("event_date", start.toISOString())
    .lt("event_date", end.toISOString());

  if (error) {
    console.error("[cron/send-reminders] fetch failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sentCount = 0;
  let skippedCount = 0;

  for (const plan of plans ?? []) {
    const members = (plan.manual_plan_members ?? []) as { name: string; email: string | null }[];
    const memberEmails = members.map((m) => m.email).filter((e): e is string => !!e);

    const { data: organizer } = await admin.auth.admin.getUserById(plan.user_id);
    const organizerEmail = organizer?.user?.email ?? null;

    const recipients = Array.from(new Set([organizerEmail, ...memberEmails].filter((e): e is string => !!e)));

    if (recipients.length === 0) {
      skippedCount += 1;
      // 送信先が無いだけで、明日が過ぎればどのみち対象外になるので
      // reminder_sent は立てずスキップする(将来メール追加時に拾えるように)。
      continue;
    }

    const shareUrl = `${baseUrl}/share/plan/${plan.share_token}`;
    const dateLabel = formatJstDateTime(plan.event_date);

    try {
      const { error: sendError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "幹事ラボ <onboarding@resend.dev>",
        to: recipients,
        subject: `【幹事ラボ】明日「${plan.title}」が開催されます`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.7; color: #2A2624;">
            <h2 style="color: #9F4642;">明日の開催のお知らせです</h2>
            <p><strong>${plan.title}</strong> が明日開催されます。</p>
            <p>
              日時: ${dateLabel}<br>
              ${plan.venue_name ? `会場: ${plan.venue_name}<br>` : ""}
            </p>
            <p><a href="${shareUrl}" style="color: #9F4642;">プランの詳細を確認する</a></p>
            <hr style="border: none; border-top: 1px solid #E4D9C4; margin: 24px 0;">
            <p style="color: #8B8378; font-size: 12px;">
              幹事ラボ - あらゆる集まりを、あなたが幹事する<br>
              https://kanji-lab.com
            </p>
          </div>
        `,
      });

      if (sendError) {
        console.error(`[cron/send-reminders] send failed for plan ${plan.id}:`, sendError);
        continue;
      }

      await admin.from("manual_plans").update({ reminder_sent: true }).eq("id", plan.id);
      sentCount += 1;
    } catch (err) {
      console.error(`[cron/send-reminders] unexpected error for plan ${plan.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, sentCount, skippedCount, totalPlans: plans?.length ?? 0 });
}
