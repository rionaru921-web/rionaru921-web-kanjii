import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateIcs } from "@/lib/ics";
import { buildPlanIcsEvent } from "@/lib/manual-plans/format";
import type { ManualPlan } from "@/lib/manual-plans/types";

// Public, unauthenticated calendar download for attendees — mirrors the
// service-role admin-client pattern used by app/share/plan/[token]/page.tsx
// so a share_token match is the only access check, same as the page itself.
export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const supabase = createAdminClient();

  const { data: plan } = await supabase
    .from("manual_plans")
    .select("*")
    .eq("share_token", params.token)
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
