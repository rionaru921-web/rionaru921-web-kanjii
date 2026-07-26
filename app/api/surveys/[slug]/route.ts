import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
      "id, title, description, event_type, ask_dates, ask_budget, ask_genre, ask_attend, date_options, budget_options, genre_options, deadline, status, slug, created_at, updated_at"
    )
    .eq("slug", params.slug)
    .eq("status", "active")
    .maybeSingle();

  if (error || !survey) {
    return NextResponse.json({ error: "アンケートが見つかりません。" }, { status: 404 });
  }

  return NextResponse.json({ survey });
}
