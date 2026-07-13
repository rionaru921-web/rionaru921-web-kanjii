import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Owner-facing recovery path for the guest_secret model: if a guest loses
// their session (cleared sessionStorage, new device) they can no longer
// re-claim their member row (first claim wins, by design — see
// app/api/share/plan/[token]/identify/route.ts). This lets the plan owner
// clear guest_secret so that member can identify themselves again.
//
// Uses the session-bound client (not admin) — the existing "Plan owner can
// update members" RLS policy on manual_plan_members already scopes this to
// rows whose plan belongs to auth.uid(), so no extra ownership check is
// needed beyond requiring a signed-in user.
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const { data: member, error } = await supabase
    .from("manual_plan_members")
    .update({ guest_secret: null })
    .eq("id", params.memberId)
    .eq("plan_id", params.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!member) {
    return NextResponse.json({ error: "メンバーが見つかりません。" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
