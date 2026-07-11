import { NextRequest, NextResponse } from "next/server";
import { searchRakutenHotels, RakutenApiError } from "@/lib/api/rakuten";
import { getCached, setCached } from "@/lib/api/cache";

const RATE_LIMIT_WINDOW_MS = 10_000;
const RATE_LIMIT_MAX_REQUESTS = 3;
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

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "リクエストが多すぎます。しばらく待ってから再度お試しください。" },
      { status: 429 }
    );
  }

  const sp = req.nextUrl.searchParams;
  const keyword = sp.get("keyword") ?? undefined;
  if (!keyword) {
    return NextResponse.json({ error: "keyword is required" }, { status: 400 });
  }

  const params = {
    keyword,
    hits: sp.has("hits") ? Number(sp.get("hits")) : undefined,
    page: sp.has("page") ? Number(sp.get("page")) : undefined,
  };

  const cacheKey = `search:${JSON.stringify(params)}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const result = await searchRakutenHotels(params);
    setCached(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof RakutenApiError) {
      const status = err.kind === "rate_limited" ? 429 : err.kind === "missing_key" ? 503 : 502;
      return NextResponse.json({ error: err.message }, { status });
    }
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
