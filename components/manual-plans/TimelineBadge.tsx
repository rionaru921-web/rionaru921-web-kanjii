import type { TimelineStatus } from "@/lib/manual-plans/types";

const TIMELINE_LABELS: Record<TimelineStatus, string> = {
  upcoming: "予定",
  ongoing: "開催中",
  ended: "終了",
  archived: "過去",
};

const TIMELINE_STYLES: Record<TimelineStatus, string> = {
  upcoming: "text-blue-600 bg-blue-50 border-blue-200",
  ongoing: "text-emerald-600 bg-emerald-50 border-emerald-200",
  ended: "text-gray-600 bg-gray-50 border-gray-200",
  archived: "text-gray-400 bg-gray-50 border-gray-100",
};

export default function TimelineBadge({ status }: { status: TimelineStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full text-[11px] font-bold px-2.5 py-1 border shrink-0 ${TIMELINE_STYLES[status]}`}
    >
      {TIMELINE_LABELS[status]}
    </span>
  );
}
