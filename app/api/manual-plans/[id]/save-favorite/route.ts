import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pickReusablePlanFields } from "@/lib/manual-plans/favorites";
import type { ManualPlan } from "@/lib/manual-plans/types";

// Duplicates the given plan's content into a new manual_plans row with
// is_favorite=true — never mutates the source plan itself (see the Wave 22
// migration comment: an in-place UPDATE would make an in-progress plan
// vanish from the normal plan list).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const body: { favoriteName?: string } = await req.json().catch(() => ({}));
  const favoriteName = body.favoriteName?.trim();
  if (!favoriteName) {
    return NextResponse.json({ error: "名前を入力してください。" }, { status: 400 });
  }

  const { data: source, error: fetchError } = await supabase
    .from("manual_plans")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !source) {
    return NextResponse.json({ error: "プランが見つかりません。" }, { status: 404 });
  }

  const { data: favorite, error: insertError } = await supabase
    .from("manual_plans")
    .insert({
      user_id: user.id,
      ...pickReusablePlanFields(source as ManualPlan),
      is_favorite: true,
      favorite_name: favoriteName,
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ id: favorite.id });
}
