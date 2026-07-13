import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AttendanceStatus } from "@/lib/manual-plans/types";

const ALLOWED_STATUSES: AttendanceStatus[] = ["attending", "declined", "maybe"];

// Public, unauthenticated write — knowledge of share_token gets you into the
// plan, but guest_secret (minted once per member by ../identify/route.ts)
// is what proves you're that specific member. Without it, anyone with the
// share link could flip any other attendee's status — see audit_report.md
// ("ゲスト出欠回答APIが同一メンバー以外も更新可能") and
// supabase/migrations/20260713000000_add_guest_secret.sql.
export async function PATCH(req: NextRequest, { params }: { params: { token: string } }) {
  const body = (await req.json()) as {
    member_id?: unknown;
    attendance_status?: unknown;
    guest_secret?: unknown;
  };

  if (
    typeof body.member_id !== "string" ||
    typeof body.guest_secret !== "string" ||
    !body.guest_secret ||
    !ALLOWED_STATUSES.includes(body.attendance_status as AttendanceStatus)
  ) {
    return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: plan } = await supabase
    .from("manual_plans")
    .select("id")
    .eq("share_token", params.token)
    .maybeSingle();

  if (!plan) {
    return NextResponse.json({ error: "プランが見つかりません。" }, { status: 404 });
  }

  const { data: exists } = await supabase
    .from("manual_plan_members")
    .select("id")
    .eq("id", body.member_id)
    .eq("plan_id", plan.id)
    .maybeSingle();

  if (!exists) {
    return NextResponse.json({ error: "メンバーが見つかりません。" }, { status: 404 });
  }

  const { data: member, error } = await supabase
    .from("manual_plan_members")
    .update({ attendance_status: body.attendance_status })
    .eq("id", body.member_id)
    .eq("plan_id", plan.id)
    .eq("guest_secret", body.guest_secret)
    .select("id, attendance_status")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!member) {
    return NextResponse.json(
      { error: "認証に失敗しました。お名前を選び直してください。" },
      { status: 403 }
    );
  }

  return NextResponse.json({ id: member.id, attendance_status: member.attendance_status });
}
