import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Lightweight, single-field sibling of the full PATCH in [id]/route.ts.
// That route requires a full form body and wholesale-replaces members —
// overkill (and destructive to member data) for a plain share-state toggle.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const body = (await req.json()) as { is_shared?: unknown };
  if (typeof body.is_shared !== "boolean") {
    return NextResponse.json({ error: "is_shared must be boolean" }, { status: 400 });
  }

  const { data: plan, error } = await supabase
    .from("manual_plans")
    .update({ is_shared: body.is_shared })
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select("id, is_shared")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!plan) {
    return NextResponse.json({ error: "プランが見つかりません。" }, { status: 404 });
  }

  return NextResponse.json({ id: plan.id, is_shared: plan.is_shared });
}
