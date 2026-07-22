import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    return NextResponse.json({ error: "アカウント登録が必要です。" }, { status: 401 });
  }
  if (!user.email) {
    return NextResponse.json({ error: "メールアドレスが登録されていません。" }, { status: 400 });
  }

  let interestReason: string | undefined;
  try {
    const body = await req.json();
    interestReason = typeof body?.interestReason === "string" ? body.interestReason.trim().slice(0, 500) : undefined;
  } catch {
    // Body is optional — no reason given is fine.
  }

  const { error } = await supabase.from("premium_waitlist").insert({
    user_id: user.id,
    email: user.email,
    interest_reason: interestReason || null,
  });

  // Unique(user_id) means a repeat submission is a duplicate-key error, not
  // a real failure — the user is already on the list, which is success from
  // their point of view.
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
