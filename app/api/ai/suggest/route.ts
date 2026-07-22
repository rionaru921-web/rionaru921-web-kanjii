import { NextRequest, NextResponse } from "next/server";
import { suggestShops } from "@/lib/ai/suggest";
import { searchHotpepper, HotpepperApiError } from "@/lib/api/hotpepper";
import { buildHotpepperSearchParams } from "@/lib/api/restaurants";
import { getCached, setCached } from "@/lib/api/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAiUsageStatus, incrementAiUsage } from "@/lib/plans/checkAiUsage";
import { PLAN_LIMITS } from "@/lib/plans/limits";
import type { SearchParams } from "@/lib/api/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// AI calls are far more expensive than a plain search, so this endpoint gets
// a tighter budget than /api/hotpepper/search.
const RATE_LIMIT_WINDOW_MS = 30_000;
const RATE_LIMIT_MAX_REQUESTS = 2;
const requestLog = new Map<string, number[]>();

// ゲスト(匿名ユーザー)の生涯AI呼び出し上限。ゲストデータ自体が
// 24〜72hで自動削除される設計のため「1日X回」より説明しやすい
// 「生涯合計」で管理する(guest_ai_usage テーブル)。
const GUEST_AI_LIFETIME_LIMIT = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

interface SuggestRequestBody {
  station?: string;
  budgetPerPerson: number;
  peopleCount: number;
  datetime?: string;
  genreCode?: string;
  privateRoom?: boolean;
  moodTags?: string[];
  memberProfile: string;
  situation: string;
  preferences?: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY が設定されていません。.env.local を確認してください。" },
      { status: 503 }
    );
  }

  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "リクエストが多すぎます。しばらく待ってから再度お試しください。" },
      { status: 429 }
    );
  }

  // ゲスト(匿名ユーザー)だけ生涯回数を数える。本登録ユーザーと、
  // このAPIを直接叩いた無セッションのリクエストは対象外(既存の
  // IPレート制限のみが適用される、従来通りの挙動)。
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isGuest = !!user?.is_anonymous;
  const admin = isGuest ? createAdminClient() : null;

  if (isGuest && admin && user) {
    const { data: usage } = await admin
      .from("guest_ai_usage")
      .select("used_count")
      .eq("user_id", user.id)
      .maybeSingle();

    if ((usage?.used_count ?? 0) >= GUEST_AI_LIFETIME_LIMIT) {
      return NextResponse.json(
        {
          error: `AIプラン作成の無料お試し回数(${GUEST_AI_LIFETIME_LIMIT}回)に達しました。アカウント登録すると、月${PLAN_LIMITS.free.maxAiSuggestionsPerMonth}回までご利用いただけます。`,
          code: "GUEST_AI_LIMIT_REACHED",
        },
        { status: 403 }
      );
    }
  }

  // 登録ユーザー(匿名でない)は月次上限で管理する。ゲストや、このAPIを
  // 直接叩いた無セッションのリクエストはここでは対象外(既存のIPレート
  // 制限のみが適用される、従来通りの挙動)。
  let usageStatus: Awaited<ReturnType<typeof getAiUsageStatus>> | null = null;
  if (user && !isGuest) {
    usageStatus = await getAiUsageStatus(user.id);
    if (!usageStatus.allowed) {
      return NextResponse.json(
        {
          error: `今月のAI提案利用回数(${usageStatus.maxCount}回)を超えました。来月1日にリセットされます。`,
          code: "AI_USAGE_LIMIT_REACHED",
          currentCount: usageStatus.currentCount,
          maxCount: usageStatus.maxCount,
        },
        { status: 403 }
      );
    }
  }

  let body: SuggestRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "リクエストの形式が不正です。" }, { status: 400 });
  }

  if (!body.memberProfile?.trim() || !body.situation?.trim()) {
    return NextResponse.json(
      { error: "参加者について・シチュエーションは必須項目です。" },
      { status: 400 }
    );
  }

  const searchParams: SearchParams = {
    people: body.peopleCount,
    budget: body.budgetPerPerson,
    station: body.station,
    genre: body.genreCode,
    privateRoom: body.privateRoom,
    datetime: body.datetime,
  };

  try {
    // 1. Find candidate shops via HotPepper (cached, same as /api/hotpepper/search).
    const hpParams = buildHotpepperSearchParams(searchParams);
    const cacheKey = `search:${JSON.stringify(hpParams)}`;
    let searchResult = getCached<Awaited<ReturnType<typeof searchHotpepper>>>(cacheKey);
    if (!searchResult) {
      searchResult = await searchHotpepper(hpParams);
      setCached(cacheKey, searchResult);
    }

    if (searchResult.shops.length === 0) {
      return NextResponse.json({
        recommendations: [],
        summary: "該当する店舗が見つかりませんでした。条件を変えてお試しください。",
      });
    }

    // 2. Ask Claude to rank and explain the top picks.
    const result = await suggestShops(
      {
        station: body.station ?? "指定エリア",
        budgetPerPerson: body.budgetPerPerson,
        peopleCount: body.peopleCount,
        datetime: body.datetime,
        memberProfile: body.memberProfile,
        situation: body.situation,
        preferences: body.preferences,
        moodTags: body.moodTags,
      },
      searchResult.shops
    );

    if (isGuest && admin && user) {
      // ベストエフォート: カウント更新に失敗しても提案結果は返す
      // (回数制限は濫用防止のためであり、既に生成済みの結果を
      // 握りつぶす理由にはならない)。
      const { data: usage } = await admin
        .from("guest_ai_usage")
        .select("used_count")
        .eq("user_id", user.id)
        .maybeSingle();
      await admin
        .from("guest_ai_usage")
        .upsert(
          { user_id: user.id, used_count: (usage?.used_count ?? 0) + 1 },
          { onConflict: "user_id" }
        );
    }

    if (user && !isGuest && usageStatus && usageStatus.maxCount !== -1) {
      // Best-effort — swallow errors so a failed counter update can't turn
      // an already-computed result into a 500 for the caller.
      try {
        await incrementAiUsage(user.id);
      } catch (incrementErr) {
        console.error("[api/ai/suggest] failed to increment usage count:", incrementErr);
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof HotpepperApiError) {
      const status = err.kind === "rate_limited" ? 429 : err.kind === "missing_key" ? 503 : 502;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("[api/ai/suggest] unexpected error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
