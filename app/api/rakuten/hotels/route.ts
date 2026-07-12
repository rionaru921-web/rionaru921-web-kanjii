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
  const middleClassCode = sp.get("middleClassCode") ?? undefined;
  const largeClassCode = sp.get("largeClassCode") ?? undefined;
  const smallClassCode = sp.get("smallClassCode") ?? undefined;
  // Display name for the selected area, used only as a keyword fallback if
  // the (unverified) middleClassCode/smallClassCode combination errors or
  // returns nothing — see lib/manual-plans/rakuten-areas.ts.
  const areaLabel = sp.get("areaLabel") ?? undefined;

  if (!keyword && !middleClassCode) {
    return NextResponse.json({ error: "keyword or middleClassCode is required" }, { status: 400 });
  }

  const hits = sp.has("hits") ? Number(sp.get("hits")) : undefined;
  const page = sp.has("page") ? Number(sp.get("page")) : undefined;

  const params = {
    keyword,
    largeClassCode: middleClassCode ? largeClassCode ?? "japan" : undefined,
    middleClassCode,
    smallClassCode,
    hits,
    page,
  };

  const cacheKey = `search:${JSON.stringify(params)}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    let result = await searchRakutenHotels(params);

    if (result.hotels.length === 0 && middleClassCode && areaLabel && !keyword) {
      result = await searchRakutenHotels({ keyword: areaLabel, hits, page });
    }

    setCached(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    // The hardcoded middleClassCode/smallClassCode values aren't verified
    // against the live API — if the area-code search itself errors, retry
    // as a plain keyword search on the area's display name instead of
    // surfacing an opaque API error to the user.
    if (err instanceof RakutenApiError && err.kind === "api" && middleClassCode && areaLabel && !keyword) {
      try {
        const fallback = await searchRakutenHotels({ keyword: areaLabel, hits, page });
        setCached(cacheKey, fallback);
        return NextResponse.json(fallback);
      } catch (fallbackErr) {
        if (fallbackErr instanceof RakutenApiError) {
          const status = fallbackErr.kind === "rate_limited" ? 429 : fallbackErr.kind === "missing_key" ? 503 : 502;
          return NextResponse.json({ error: fallbackErr.message }, { status });
        }
        return NextResponse.json({ error: String(fallbackErr) }, { status: 500 });
      }
    }

    if (err instanceof RakutenApiError) {
      const status = err.kind === "rate_limited" ? 429 : err.kind === "missing_key" ? 503 : 502;
      return NextResponse.json({ error: err.message }, { status });
    }
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
