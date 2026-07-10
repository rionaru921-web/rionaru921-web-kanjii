export type ManualPlanStatus = "draft" | "confirmed" | "completed" | "cancelled";
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
  status: ManualPlanStatus;
  share_token: string;
  created_at: string;
  updated_at: string;
}
