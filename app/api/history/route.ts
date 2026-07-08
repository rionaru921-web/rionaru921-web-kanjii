import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { HistoryPayload, HistoryType } from "@/lib/history/types";

interface CreateHistoryBody {
  type: HistoryType;
  title: string;
  eventDate?: string;
  payload: HistoryPayload;
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const body: CreateHistoryBody = await req.json();
  if (!body.title || !body.type || !body.payload) {
    return NextResponse.json({ error: "リクエストの形式が不正です。" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("history")
    .insert({
      user_id: user.id,
      type: body.type,
      title: body.title,
      event_date: body.eventDate ?? null,
      payload: body.payload,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
