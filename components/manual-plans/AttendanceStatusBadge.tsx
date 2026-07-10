import { ATTENDANCE_LABELS } from "@/lib/manual-plans/format";
import type { AttendanceStatus } from "@/lib/manual-plans/types";

const ATTENDANCE_STYLES: Record<AttendanceStatus, string> = {
  attending: "text-emerald-600 bg-emerald-50 border-emerald-200",
  declined: "text-gray-500 bg-gray-50 border-gray-200",
  maybe: "text-orange-500 bg-orange-50 border-orange-200",
  pending: "text-ink/40 bg-white border-ink/10",
};

export default function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full text-[11px] font-bold px-2.5 py-1 border shrink-0 ${ATTENDANCE_STYLES[status]}`}
    >
      {ATTENDANCE_LABELS[status]}
    </span>
  );
}
