import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateIcs } from "@/lib/ics";
import { buildPlanIcsEvent } from "@/lib/manual-plans/format";
import type { ManualPlan } from "@/lib/manual-plans/types";

// Owner-facing calendar download. Public attendees get the equivalent file
// from /api/share/plan/[token]/ics instead, which uses the admin client and
// requires no auth — this route stays behind the same ownership check as
// the rest of /api/manual-plans/[id]/*.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const { data: plan } = await supabase
    .from("manual_plans")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!plan) {
    return NextResponse.json({ error: "プランが見つかりません。" }, { status: 404 });
  }

  const typedPlan = plan as ManualPlan;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  const shareUrl = `${baseUrl}/share/plan/${typedPlan.share_token}`;
  const ics = generateIcs(buildPlanIcsEvent(typedPlan, shareUrl));

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(typedPlan.title)}.ics"`,
    },
  });
}
