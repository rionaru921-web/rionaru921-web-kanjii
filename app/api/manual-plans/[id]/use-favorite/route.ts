import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pickReusablePlanFields } from "@/lib/manual-plans/favorites";
import type { ManualPlan } from "@/lib/manual-plans/types";

// Duplicates a favorite (is_favorite=true) row into a new, ordinary plan
// (is_favorite=false, no event_date — the organizer fills that in on the
// edit screen this route redirects to). Members are intentionally never
// copied; every occasion has its own attendee list.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const { data: favorite, error: fetchError } = await supabase
    .from("manual_plans")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .eq("is_favorite", true)
    .maybeSingle();

  if (fetchError || !favorite) {
    return NextResponse.json({ error: "よく使うプランが見つかりません。" }, { status: 404 });
  }

  const { data: plan, error: insertError } = await supabase
    .from("manual_plans")
    .insert({
      user_id: user.id,
      ...pickReusablePlanFields(favorite as ManualPlan),
      is_favorite: false,
      favorite_name: null,
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ id: plan.id });
}
