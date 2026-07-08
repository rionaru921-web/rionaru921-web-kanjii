import { NextRequest, NextResponse } from "next/server";
import { getShopById, HotpepperApiError } from "@/lib/api/hotpepper";
import { getCached, setCached } from "@/lib/api/cache";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const cacheKey = `shop:${params.id}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const shop = await getShopById(params.id);
    if (!shop) {
      return NextResponse.json({ error: "店舗が見つかりませんでした。" }, { status: 404 });
    }
    setCached(cacheKey, shop);
    return NextResponse.json(shop);
  } catch (err) {
    if (err instanceof HotpepperApiError) {
      const status = err.kind === "rate_limited" ? 429 : err.kind === "missing_key" ? 503 : 502;
      return NextResponse.json({ error: err.message }, { status });
    }
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
