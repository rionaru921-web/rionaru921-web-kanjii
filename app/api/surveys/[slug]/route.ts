import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Public, unauthenticated read by slug — same pattern as
// /api/share/plan/[token]: service-role client bypasses RLS, and the
// slug match narrows it to exactly one row. Owner-only columns
// (owner_id) are left out of the select since this is served to anyone
// with the link.
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const supabase = createAdminClient();

  const { data: survey, error } = await supabase
    .from("surveys")
    .select(
      "id, title, description, event_type, ask_dates, ask_budget, ask_genre, ask_attend, date_options, budget_options, genre_options, optional_questions, deadline, status, slug, created_at, updated_at"
    )
    .eq("slug", params.slug)
    .eq("status", "active")
    .maybeSingle();

  if (error || !survey) {
    return NextResponse.json({ error: "アンケートが見つかりません。" }, { status: 404 });
  }

  return NextResponse.json({ survey });
}

// PATCH: 現時点では results_public(集計を回答者にも公開するか)のみ更新可能。
// 通常のセッションクライアント + slug/owner_id 一致で、RLSの
// "Users can update own surveys" ポリシーがそのまま効く(admin client不要)。
export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const body = await req.json();
  if (typeof body.resultsPublic !== "boolean") {
    return NextResponse.json({ error: "resultsPublic はboolean で指定してください。" }, { status: 400 });
  }

  const { data: survey, error } = await supabase
    .from("surveys")
    .update({ results_public: body.resultsPublic })
    .eq("slug", params.slug)
    .eq("owner_id", user.id)
    .select()
    .maybeSingle();

  if (error || !survey) {
    return NextResponse.json({ error: "更新に失敗しました。" }, { status: 404 });
  }

  return NextResponse.json({ survey });
}
