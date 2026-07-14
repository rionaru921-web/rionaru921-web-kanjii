import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("payment_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  if (user.is_anonymous) {
    return NextResponse.json(
      { error: "集金設定はゲストモードではご利用いただけません。アカウント登録が必要です。" },
      { status: 403 }
    );
  }

  const body = await req.json();

  const { error } = await supabase.from("payment_settings").upsert(
    {
      user_id: user.id,
      bank_name: body.bankName || null,
      bank_branch: body.bankBranch || null,
      bank_account_type: body.bankAccountType || null,
      bank_account_number: body.bankAccountNumber || null,
      bank_account_holder: body.bankAccountHolder || null,
      paypay_id: body.paypayId || null,
      line_pay_id: body.linePayId || null,
      memo: body.memo || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
