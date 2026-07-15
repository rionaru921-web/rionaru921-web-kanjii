import type { IcsEvent } from "@/lib/ics";
import { formatJstDateTime, formatJstDateRange } from "@/lib/date/kanjii-time";
import type { AttendanceStatus, ManualPlan, ManualPlanMember, MemberRole } from "./types";
import { calculateSplit, type SplitMemberInput } from "./calculate-split";

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "現金",
  paypay: "PayPay",
  bank_transfer: "銀行振込",
};

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  pending: "未回答",
  attending: "参加",
  declined: "不参加",
  maybe: "未定",
};

export const ROLE_LABELS: Record<MemberRole, string> = {
  organizer: "幹事",
  participant: "参加者",
};

// 表示はブラウザ/サーバーいずれの実行環境でも常に JST 基準になるよう
// lib/date/kanjii-time.ts に変換ロジックを集約している。
export const formatDateTime = formatJstDateTime;
export const formatDateRange = formatJstDateRange;

// Rounds up so the organizer never collects less than the total fee —
// any remainder from an uneven split is absorbed by the group rather than
// left uncollected.
export function perPersonFee(feeAmount: number | null, memberCount: number): number | null {
  if (feeAmount == null || memberCount <= 0) return null;
  return Math.ceil(feeAmount / memberCount);
}

// Who actually pays: if anyone has responded "attending", only they split
// the cost; otherwise everyone on the list is assumed to be paying. Shared
// by the detail page, public share page, LINE text, and PDF so the "who
// pays" rule can't drift between equal and tiered split modes, or between
// any of the surfaces that display it.
export function getPayingMembers<T extends { attendance_status: AttendanceStatus }>(members: T[]): T[] {
  const attending = members.filter((m) => m.attendance_status === "attending");
  return attending.length > 0 ? attending : members;
}

// Shared by PlanDetailActions.tsx (owner view) and
// app/share/plan/[token]/page.tsx (public view) so the two LINE-share flows
// can never drift apart.
export function buildLineShareText(
  plan: Pick<ManualPlan, "title" | "split_mode" | "fee_amount" | "rounding_unit">,
  members: ManualPlanMember[],
  shareUrl: string
): string {
  const base = `幹事さんからのお知らせです\n\n${plan.title}\n${shareUrl}`;
  if (plan.split_mode !== "tiered" || plan.fee_amount == null) return base;

  const payingMembers = getPayingMembers(members);
  const splitInputs: SplitMemberInput[] = payingMembers.map((m) => ({
    id: m.id,
    tierLevel: m.tier_level,
    weightOverride: m.weight_override,
    organizerDiscount: m.organizer_discount,
  }));
  const results = calculateSplit(plan.fee_amount, splitInputs, plan.rounding_unit);
  if (!results) return base;

  const byId = new Map(results.map((r) => [r.id, r.amount]));
  const lines = payingMembers
    .map((m) => `・${m.name}: ¥${(byId.get(m.id) ?? 0).toLocaleString()}`)
    .join("\n");

  return `${base}\n\n【一人ずつの金額】\n${lines}`;
}

// Shared by both the owner-facing (/api/manual-plans/[id]/ics) and public
// (/api/share/plan/[token]/ics) calendar-download routes, so the event
// content stays identical regardless of who downloads it.
export function buildPlanIcsEvent(plan: ManualPlan, shareUrl: string): IcsEvent {
  const location = [plan.venue_name, plan.venue_address].filter(Boolean).join(" ") || undefined;

  return {
    uid: `manual-plan-${plan.id}@kanjii.app`,
    title: plan.title,
    description: plan.memo ?? undefined,
    location,
    startDate: plan.event_date ?? plan.created_at,
    endDate: plan.end_date ?? undefined,
    url: shareUrl,
  };
}
