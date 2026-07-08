import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const supabase = createAdminClient();

  const { data: shareToken, error: tokenError } = await supabase
    .from("share_tokens")
    .select("*")
    .eq("token", params.token)
    .maybeSingle();

  if (tokenError) {
    return NextResponse.json({ error: tokenError.message }, { status: 500 });
  }
  if (!shareToken) {
    return NextResponse.json({ error: "リンクが見つかりません。" }, { status: 404 });
  }
  if (shareToken.expires_at && new Date(shareToken.expires_at) < new Date()) {
    return NextResponse.json({ error: "このリンクは期限切れです。", expired: true }, { status: 410 });
  }

  const { data: history, error: historyError } = await supabase
    .from("history")
    .select("*")
    .eq("id", shareToken.history_id)
    .maybeSingle();

  if (historyError) {
    return NextResponse.json({ error: historyError.message }, { status: 500 });
  }
  if (!history) {
    return NextResponse.json({ error: "イベント情報が見つかりません。" }, { status: 404 });
  }

  await supabase
    .from("share_tokens")
    .update({ view_count: (shareToken.view_count ?? 0) + 1 })
    .eq("token", params.token);

  return NextResponse.json({
    type: history.type,
    title: history.title,
    eventDate: history.event_date,
    payload: history.payload,
    viewCount: (shareToken.view_count ?? 0) + 1,
  });
}
