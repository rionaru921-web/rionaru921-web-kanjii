import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ManualPlanStatus } from "@/lib/manual-plans/types";

const ALLOWED_STATUSES: ManualPlanStatus[] = ["draft", "confirmed", "completed", "cancelled"];

// Lightweight, single-field sibling of the full PATCH in [id]/route.ts.
// That route requires a full form body and wholesale-replaces members —
// overkill (and destructive to member data) for a plain status toggle.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const body = (await req.json()) as { status?: string };
  if (!body.status || !ALLOWED_STATUSES.includes(body.status as ManualPlanStatus)) {
    return NextResponse.json({ error: "不正なステータスです。" }, { status: 400 });
  }

  const { data: plan, error } = await supabase
    .from("manual_plans")
    .update({ status: body.status })
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select("id, status")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!plan) {
    return NextResponse.json({ error: "プランが見つかりません。" }, { status: 404 });
  }

  return NextResponse.json({ id: plan.id, status: plan.status });
}
