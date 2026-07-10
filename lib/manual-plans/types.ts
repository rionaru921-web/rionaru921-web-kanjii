export type AttendanceStatus = "pending" | "attending" | "declined" | "maybe";
export type PaymentStatus = "unpaid" | "paid";

export interface ManualPlanMember {
  id: string;
  plan_id: string;
  name: string;
  email: string | null;
  attendance_status: AttendanceStatus;
  payment_status: PaymentStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ManualPlan {
  id: string;
  user_id: string;
  title: string;
  event_date: string | null;
  end_date: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_url: string | null;
  venue_map_url: string | null;
  fee_amount: number | null;
  payment_methods: string[];
  payment_deadline: string | null;
  memo: string | null;
  dietary_notes: string | null;
  share_token: string;
  created_at: string;
  updated_at: string;
}

export type TimelineStatus = "upcoming" | "ongoing" | "ended" | "archived";

const ARCHIVE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

export function getTimelineStatus(plan: Pick<ManualPlan, "event_date" | "end_date">): TimelineStatus {
  const now = Date.now();
  const eventDate = plan.event_date ? new Date(plan.event_date).getTime() : null;
  const endDate = plan.end_date ? new Date(plan.end_date).getTime() : eventDate;

  if (!eventDate) return "upcoming";
  if (now < eventDate) return "upcoming";
  if (endDate && now <= endDate) return "ongoing";
  if (endDate && now > endDate + ARCHIVE_THRESHOLD_MS) return "archived";
  return "ended";
}
