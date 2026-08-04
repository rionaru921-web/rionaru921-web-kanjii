import type { ManualPlan } from "./types";

// Fields that make sense to carry over when duplicating a plan into (or out
// of) a "よく使うプラン" (favorite) row: venue/fee/split/nijikai content.
// Deliberately excludes anything date/time-bound (event_date, end_date,
// payment_deadline), identity/lifecycle fields (id, user_id, share_token,
// created_at, updated_at), and the favorite flags themselves — callers set
// those explicitly for the direction they're copying in.
export function pickReusablePlanFields(plan: ManualPlan) {
  return {
    title: plan.title,
    event_type: plan.event_type,
    event_type_custom_label: plan.event_type_custom_label,
    venue_name: plan.venue_name,
    venue_address: plan.venue_address,
    venue_url: plan.venue_url,
    venue_phone: plan.venue_phone,
    venue_lat: plan.venue_lat,
    venue_lng: plan.venue_lng,
    venue_hotpepper_id: plan.venue_hotpepper_id,
    venue_facilities: plan.venue_facilities,
    fee_amount: plan.fee_amount,
    fee_breakdown: plan.fee_breakdown,
    payment_methods: plan.payment_methods,
    memo: plan.memo,
    dietary_notes: plan.dietary_notes,
    event_note: plan.event_note,
    nijikai_enabled: plan.nijikai_enabled,
    nijikai_venue: plan.nijikai_venue,
    nijikai_budget: plan.nijikai_budget,
    nijikai_url: plan.nijikai_url,
    nijikai_start_time: plan.nijikai_start_time,
    split_mode: plan.split_mode,
    rounding_unit: plan.rounding_unit,
  };
}
