import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  // Deleted first, session cleared only on success — if this fails the user
  // stays logged in and can retry instead of being stranded half-deleted.
  // Every table with a user_id/owner_id FK has `on delete cascade` already
  // (manual_plans, manual_plan_members, surveys, survey_responses,
  // profiles, coaching_sessions, user_ai_usage, guest_ai_usage,
  // premium_waitlist, history, share_tokens, payment_settings), so deleting
  // the auth.users row is enough — Postgres cascades the rest.
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json(
      { error: "アカウントの削除に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }

  // Clears the sb-*-auth-token cookie(s) via this response — the browser's
  // session referred to a user that no longer exists.
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
