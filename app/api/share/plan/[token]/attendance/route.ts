import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AttendanceStatus } from "@/lib/manual-plans/types";

const ALLOWED_STATUSES: AttendanceStatus[] = ["attending", "declined", "maybe"];

// Public, unauthenticated write — same trust model as the read-only share
// page (knowledge of share_token is the access control). The plan lookup
// by token, then the member update scoped to that plan's id, ensures a
// guest can't overwrite another plan's member row by guessing a member_id.
export async function PATCH(req: NextRequest, { params }: { params: { token: string } }) {
  const body = (await req.json()) as { member_id?: unknown; attendance_status?: unknown };

  if (
    typeof body.member_id !== "string" ||
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

  const { data: member, error } = await supabase
    .from("manual_plan_members")
    .update({ attendance_status: body.attendance_status })
    .eq("id", body.member_id)
    .eq("plan_id", plan.id)
    .select("id, attendance_status")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!member) {
    return NextResponse.json({ error: "メンバーが見つかりません。" }, { status: 404 });
  }

  return NextResponse.json({ id: member.id, attendance_status: member.attendance_status });
}
