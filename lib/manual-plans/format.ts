import type { ManualPlanStatus, AttendanceStatus, PaymentStatus } from "./types";

export const STATUS_LABELS: Record<ManualPlanStatus, string> = {
  draft: "進行中",
  confirmed: "確定",
  completed: "完了",
  cancelled: "キャンセル",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "現金",
  paypay: "PayPay",
  bank_transfer: "銀行振込",
};

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  pending: "未回答",
  attending: "出席",
  declined: "欠席",
  maybe: "未定",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "未払い",
  paid: "支払い済み",
};

export function formatDateTime(iso: string | null): string {
  if (!iso) return "未定";
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return "日時未定";
  const startLabel = formatDateTime(start);
  if (!end) return startLabel;

  const sameDay = new Date(start).toDateString() === new Date(end).toDateString();
  const endLabel = sameDay
    ? new Date(end).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
    : formatDateTime(end);

  return `${startLabel} 〜 ${endLabel}`;
}
