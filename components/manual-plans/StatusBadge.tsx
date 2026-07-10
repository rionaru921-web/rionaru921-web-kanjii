import { STATUS_LABELS } from "@/lib/manual-plans/format";
import type { ManualPlanStatus } from "@/lib/manual-plans/types";

const STATUS_STYLES: Record<ManualPlanStatus, string> = {
  draft: "bg-blue-50 text-blue-600 border border-blue-200",
  confirmed: "bg-green-50 text-green-600 border border-green-200",
  completed: "bg-gray-100 text-gray-500 border border-gray-200",
  cancelled: "bg-red-50 text-red-600 border border-red-200",
};

export default function StatusBadge({ status }: { status: ManualPlanStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full text-[11px] font-bold px-2.5 py-1 shrink-0 ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
