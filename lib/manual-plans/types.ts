import type { SplitMode, RoundingUnit, TierLevel, OrganizerDiscount } from "./split-types";

export type MemberRole = "organizer" | "participant";
export type AttendanceStatus = "pending" | "attending" | "declined" | "maybe";

export interface ManualPlanMember {
  id: string;
  plan_id: string;
  name: string;
  email: string | null;
  role: MemberRole;
  attendance_status: AttendanceStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
  tier_level: TierLevel;
  weight_override: number | null;
  organizer_discount: OrganizerDiscount | null;
}

export interface FeeBreakdownItem {
  label: string;
  amount: string;
}

export type EventType =
  | "welcome"
  | "farewell"
  | "bonenkai"
  | "shinnenkai"
  | "birthday"
  | "anniversary"
  | "trip"
  | "other";

export interface ManualPlan {
  id: string;
  user_id: string;
  title: string;
  event_type: EventType | null;
  event_type_custom_label: string | null;
  event_date: string | null;
  end_date: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_url: string | null;
  venue_phone: string | null;
  venue_lat: number | null;
  venue_lng: number | null;
  venue_hotpepper_id: string | null;
  venue_facilities: string[];
  fee_amount: number | null;
  fee_breakdown: FeeBreakdownItem[];
  payment_methods: string[];
  payment_deadline: string | null;
  memo: string | null;
  dietary_notes: string | null;
  event_note: string | null;
  nijikai_enabled: boolean;
  nijikai_venue: string | null;
  nijikai_budget: number | null;
  nijikai_url: string | null;
  nijikai_start_time: string | null;
  share_token: string;
  split_mode: SplitMode;
  rounding_unit: RoundingUnit;
  is_favorite: boolean;
  favorite_name: string | null;
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

// A plan counts as "completed" once its end (or start, if no end is set)
// has passed — i.e. it's no longer upcoming/ongoing. Reuses
// getTimelineStatus rather than re-deriving the date comparison so the two
// concepts (4-state timeline badge, 2-state completion) can't drift apart.
export function isCompletedPlan(plan: Pick<ManualPlan, "event_date" | "end_date">): boolean {
  const status = getTimelineStatus(plan);
  return status === "ended" || status === "archived";
}
