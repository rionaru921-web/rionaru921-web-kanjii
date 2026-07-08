import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createShareLink } from "@/lib/share/link";
import type { HistoryType } from "@/lib/history/types";

interface CreateShareBody {
  historyType: HistoryType;
  historyId: string;
  expiresInDays?: number;
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const body: CreateShareBody = await req.json();
  if (!body.historyType || !body.historyId) {
    return NextResponse.json({ error: "リクエストの形式が不正です。" }, { status: 400 });
  }

  try {
    const { token, url } = await createShareLink(
      body.historyType,
      body.historyId,
      user.id,
      body.expiresInDays
    );
    return NextResponse.json({ token, url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "共有リンクの作成に失敗しました。" },
      { status: 500 }
    );
  }
}
