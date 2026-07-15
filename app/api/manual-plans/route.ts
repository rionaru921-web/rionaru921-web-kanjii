import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { FeeBreakdownItem, MemberRole } from "@/lib/manual-plans/types";
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
  eventDate?: string | null;
  endDate?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  venueUrl?: string | null;
  venueHotpepperId?: string | null;
  venueLat?: number | null;
  venueLng?: number | null;
  feeAmount?: number | null;
  feeBreakdown?: FeeBreakdownItem[];
  paymentMethods?: string[];
  paymentDeadline?: string | null;
  memo?: string | null;
  dietaryNotes?: string | null;
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
      event_date: body.eventDate ?? null,
      end_date: body.endDate ?? null,
      venue_name: body.venueName ?? null,
      venue_address: body.venueAddress ?? null,
      venue_url: body.venueUrl ?? null,
      venue_hotpepper_id: body.venueHotpepperId ?? null,
      venue_lat: body.venueLat ?? null,
      venue_lng: body.venueLng ?? null,
      fee_amount: body.feeAmount ?? null,
      fee_breakdown: body.feeBreakdown ?? [],
      payment_methods: body.paymentMethods ?? [],
      payment_deadline: body.paymentDeadline ?? null,
      memo: body.memo ?? null,
      dietary_notes: body.dietaryNotes ?? null,
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
