import type { IcsEvent } from "@/lib/ics";
import { formatJstDateTime, formatJstDateRange } from "@/lib/date/kanjii-time";
import type { AttendanceStatus, ManualPlan, MemberRole } from "./types";

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
