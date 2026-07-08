import { NextRequest, NextResponse } from "next/server";
import { searchHotpepper, HotpepperApiError } from "@/lib/api/hotpepper";
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
  const params = {
    keyword: sp.get("keyword") ?? undefined,
    lat: sp.has("lat") ? Number(sp.get("lat")) : undefined,
    lng: sp.has("lng") ? Number(sp.get("lng")) : undefined,
    range: sp.has("range") ? (Number(sp.get("range")) as 1 | 2 | 3 | 4 | 5) : undefined,
    budget: sp.get("budget") ?? undefined,
    genre: sp.get("genre") ?? undefined,
    privateRoom: sp.get("privateRoom") === "true",
    partyCapacity: sp.has("partyCapacity") ? Number(sp.get("partyCapacity")) : undefined,
    count: sp.has("count") ? Number(sp.get("count")) : undefined,
    start: sp.has("start") ? Number(sp.get("start")) : undefined,
  };

  const cacheKey = `search:${JSON.stringify(params)}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const result = await searchHotpepper(params);
    setCached(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof HotpepperApiError) {
      const status = err.kind === "rate_limited" ? 429 : err.kind === "missing_key" ? 503 : 502;
      return NextResponse.json({ error: err.message }, { status });
    }
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
