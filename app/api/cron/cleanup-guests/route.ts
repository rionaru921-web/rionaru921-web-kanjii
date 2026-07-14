import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

// ゲスト(匿名ユーザー)の自動データ削除。auth.users の行を削除するだけで
// manual_plans / history / share_tokens / profiles / guest_ai_usage は
// すべて on delete cascade で auth.users(id) を参照しているため連鎖削除
// される — 共有URL(manual_plans.share_token)の失効もこれで自動的に
// 達成される。本登録済みユーザー(is_anonymous = false)には触れない。
const GUEST_RETENTION_HOURS = 48;
const PAGE_SIZE = 200;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET が設定されていません。" },
      { status: 503 }
    );
  }

  // Vercel Cron は起動時に `Authorization: Bearer $CRON_SECRET` を自動付与する。
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const cutoff = Date.now() - GUEST_RETENTION_HOURS * 60 * 60 * 1000;

  let deletedCount = 0;
  let page = 1;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PAGE_SIZE });
    if (error) {
      console.error("[cron/cleanup-guests] listUsers failed:", error);
      return NextResponse.json({ error: error.message, deletedCount }, { status: 500 });
    }

    const targets = data.users.filter(
      (u) => u.is_anonymous && new Date(u.created_at).getTime() < cutoff
    );

    for (const target of targets) {
      const { error: deleteError } = await admin.auth.admin.deleteUser(target.id);
      if (deleteError) {
        console.error(`[cron/cleanup-guests] failed to delete ${target.id}:`, deleteError);
        continue;
      }
      deletedCount += 1;
    }

    if (data.users.length < PAGE_SIZE) break;
    page += 1;
  }

  return NextResponse.json({ ok: true, deletedCount });
}
