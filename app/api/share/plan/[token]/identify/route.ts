import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Public, unauthenticated claim step for the guest_secret model (see
// supabase/migrations/20260713000000_add_guest_secret.sql). A guest picks
// their name once; this mints a bearer secret for that specific member row
// so the PATCH in ../attendance/route.ts can verify "you are who you say
// you are" instead of trusting member_id alone. First claim wins — a
// member row that already has a guest_secret can't be re-claimed, which is
// the intended behavior even for the original claimant if they lose their
// session (the plan owner can reset it via
// /api/manual-plans/[id]/members/[memberId]/reset-guest-secret).
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const body = (await req.json()) as { member_id?: unknown };

  if (typeof body.member_id !== "string") {
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

  const { data: member } = await supabase
    .from("manual_plan_members")
    .select("id, guest_secret")
    .eq("id", body.member_id)
    .eq("plan_id", plan.id)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ error: "メンバーが見つかりません。" }, { status: 404 });
  }

  if (member.guest_secret) {
    return NextResponse.json(
      { error: "このメンバーは既に他の端末で登録済みです。幹事の方に問い合わせてください。" },
      { status: 409 }
    );
  }

  const guestSecret = crypto.randomUUID();

  // The `.is("guest_secret", null)` guard makes this atomic against a
  // concurrent identify call for the same member — only one request can win
  // the race; the loser sees 0 rows updated and gets the same 409 above.
  const { data: claimed, error } = await supabase
    .from("manual_plan_members")
    .update({ guest_secret: guestSecret })
    .eq("id", body.member_id)
    .eq("plan_id", plan.id)
    .is("guest_secret", null)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!claimed) {
    return NextResponse.json(
      { error: "このメンバーは既に他の端末で登録済みです。幹事の方に問い合わせてください。" },
      { status: 409 }
    );
  }

  return NextResponse.json({ guest_secret: guestSecret });
}
