import { NextRequest, NextResponse } from "next/server";
import { suggestShops } from "@/lib/ai/suggest";
import { searchHotpepper, HotpepperApiError } from "@/lib/api/hotpepper";
import { buildHotpepperSearchParams } from "@/lib/api/restaurants";
import { getCached, setCached } from "@/lib/api/cache";
import type { SearchParams } from "@/lib/api/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// AI calls are far more expensive than a plain search, so this endpoint gets
// a tighter budget than /api/hotpepper/search.
const RATE_LIMIT_WINDOW_MS = 30_000;
const RATE_LIMIT_MAX_REQUESTS = 2;
const requestLog = new Map<string, number[]>();

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
    const hpParams = { ...buildHotpepperSearchParams(searchParams), count: 20 };
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
      },
      searchResult.shops
    );

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
