import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_LIMITS, type PlanTier } from "@/lib/plans/limits";

export interface AiUsageStatus {
  allowed: boolean;
  currentCount: number;
  maxCount: number; // -1 = unlimited
  planTier: PlanTier;
  yearMonth: string; // "YYYY-MM"
}

function currentYearMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

async function resolveEffectivePlanTier(userId: string): Promise<PlanTier> {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("plan_tier, premium_expires_at")
    .eq("id", userId)
    .maybeSingle();

  const tier = (profile?.plan_tier as PlanTier | undefined) ?? "free";
  if (tier !== "premium") return tier;

  // Premium が期限切れなら free 相当の上限に戻す。
  const stillActive = profile?.premium_expires_at
    ? new Date(profile.premium_expires_at) > new Date()
    : false;
  return stillActive ? "premium" : "free";
}

// Read-only status check — safe to call for the usage badge (no side
// effects), and as the pre-flight gate before an AI call actually runs.
export async function getAiUsageStatus(userId: string): Promise<AiUsageStatus> {
  const planTier = await resolveEffectivePlanTier(userId);
  const maxCount = PLAN_LIMITS[planTier].maxAiSuggestionsPerMonth;
  const yearMonth = currentYearMonth();

  if (maxCount === -1) {
    return { allowed: true, currentCount: 0, maxCount: -1, planTier, yearMonth };
  }

  const admin = createAdminClient();
  const { data: usage } = await admin
    .from("user_ai_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("year_month", yearMonth)
    .maybeSingle();

  const currentCount = usage?.count ?? 0;
  return { allowed: currentCount < maxCount, currentCount, maxCount, planTier, yearMonth };
}

// Increments the counter for the current month. Called only after a
// successful AI suggestion (mirrors the existing guest_ai_usage pattern in
// app/api/ai/suggest/route.ts) — best-effort, so a failed increment never
// blocks or invalidates a result the caller already has. Not called when
// maxCount is -1 (unlimited plans have no reason to pay for the extra
// round-trip).
export async function incrementAiUsage(userId: string): Promise<void> {
  const admin = createAdminClient();
  const yearMonth = currentYearMonth();

  const { data: usage } = await admin
    .from("user_ai_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("year_month", yearMonth)
    .maybeSingle();

  await admin
    .from("user_ai_usage")
    .upsert(
      { user_id: userId, year_month: yearMonth, count: (usage?.count ?? 0) + 1 },
      { onConflict: "user_id,year_month" }
    );
}
