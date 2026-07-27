import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EventType, FeeBreakdownItem, MemberRole } from "@/lib/manual-plans/types";
import type { SplitMode, RoundingUnit, TierLevel, OrganizerDiscount } from "@/lib/manual-plans/split-types";

interface MemberInput {
  name: string;
  email?: string | null;
  role?: MemberRole;
  tierLevel?: TierLevel;
  weightOverride?: number | null;
  organizerDiscount?: OrganizerDiscount | null;
}

interface CreateManualPlanBody {
  title: string;
  eventType?: EventType | null;
  eventTypeCustomLabel?: string | null;
  eventDate?: string | null;
  endDate?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  venueUrl?: string | null;
  venuePhone?: string | null;
  venueHotpepperId?: string | null;
  venueLat?: number | null;
  venueLng?: number | null;
  venueFacilities?: string[];
  feeAmount?: number | null;
  feeBreakdown?: FeeBreakdownItem[];
  paymentMethods?: string[];
  paymentDeadline?: string | null;
  memo?: string | null;
  dietaryNotes?: string | null;
  eventNote?: string | null;
  nijikaiEnabled?: boolean;
  nijikaiVenue?: string | null;
  nijikaiBudget?: number | null;
  nijikaiUrl?: string | null;
  nijikaiStartTime?: string | null;
  splitMode?: SplitMode;
  roundingUnit?: RoundingUnit;
  members?: MemberInput[];
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const body: CreateManualPlanBody = await req.json();
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "タイトルは必須です。" }, { status: 400 });
  }

  const { data: plan, error } = await supabase
    .from("manual_plans")
    .insert({
      user_id: user.id,
      title: body.title.trim(),
      event_type: body.eventType ?? null,
      event_type_custom_label: body.eventType ? null : body.eventTypeCustomLabel?.trim() || null,
      event_date: body.eventDate ?? null,
      end_date: body.endDate ?? null,
      venue_name: body.venueName ?? null,
      venue_address: body.venueAddress ?? null,
      venue_url: body.venueUrl ?? null,
      venue_phone: body.venuePhone ?? null,
      venue_hotpepper_id: body.venueHotpepperId ?? null,
      venue_lat: body.venueLat ?? null,
      venue_lng: body.venueLng ?? null,
      venue_facilities: body.venueFacilities ?? [],
      fee_amount: body.feeAmount ?? null,
      fee_breakdown: body.feeBreakdown ?? [],
      payment_methods: body.paymentMethods ?? [],
      payment_deadline: body.paymentDeadline ?? null,
      memo: body.memo ?? null,
      dietary_notes: body.dietaryNotes ?? null,
      event_note: body.eventNote ?? null,
      nijikai_enabled: body.nijikaiEnabled ?? false,
      nijikai_venue: body.nijikaiEnabled ? (body.nijikaiVenue ?? null) : null,
      nijikai_budget: body.nijikaiEnabled ? (body.nijikaiBudget ?? null) : null,
      nijikai_url: body.nijikaiEnabled ? (body.nijikaiUrl ?? null) : null,
      nijikai_start_time: body.nijikaiEnabled ? (body.nijikaiStartTime ?? null) : null,
      split_mode: body.splitMode === "tiered" ? "tiered" : "equal",
      rounding_unit: body.roundingUnit ?? 100,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const members = (body.members ?? []).filter((m) => m.name?.trim());
  if (members.length > 0) {
    const { error: membersError } = await supabase.from("manual_plan_members").insert(
      members.map((m) => ({
        plan_id: plan.id,
        name: m.name.trim(),
        email: m.email?.trim() || null,
        role: m.role === "organizer" ? "organizer" : "participant",
        tier_level: m.tierLevel ?? "peer",
        weight_override: m.weightOverride ?? null,
        organizer_discount: m.tierLevel === "organizer" ? (m.organizerDiscount ?? null) : null,
      }))
    );
    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ id: plan.id });
}
