import { NextRequest, NextResponse } from "next/server";
import { searchStationsByName } from "@/lib/api/heartrails";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") ?? "";
  const stations = await searchStationsByName(query);

  return NextResponse.json(
    { stations },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
  );
}
