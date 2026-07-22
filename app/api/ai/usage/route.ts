import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAiUsageStatus } from "@/lib/plans/checkAiUsage";

// Read-only status for the AiUsageBadge widget. Guests have their own
// separate lifetime counter (guest_ai_usage, surfaced only via the 403 on
// /api/ai/suggest) rather than a monthly one, so they get `applicable:
// false` here and the badge simply doesn't render for them.
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    return NextResponse.json({ applicable: false });
  }

  const status = await getAiUsageStatus(user.id);
  return NextResponse.json({ applicable: true, ...status });
}
