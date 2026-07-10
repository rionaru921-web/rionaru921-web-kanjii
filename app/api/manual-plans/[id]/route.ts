import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface MemberInput {
  name: string;
  email?: string | null;
}

interface UpdateManualPlanBody {
  title: string;
  eventDate?: string | null;
  endDate?: string | null;
  status?: string;
  venueName?: string | null;
  venueAddress?: string | null;
  venueUrl?: string | null;
  venueMapUrl?: string | null;
  feeAmount?: number | null;
  paymentMethods?: string[];
  paymentDeadline?: string | null;
  memo?: string | null;
  dietaryNotes?: string | null;
  members?: MemberInput[];
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const body: UpdateManualPlanBody = await req.json();
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "タイトルは必須です。" }, { status: 400 });
  }

  const { data: plan, error } = await supabase
    .from("manual_plans")
    .update({
      title: body.title.trim(),
      event_date: body.eventDate ?? null,
      end_date: body.endDate ?? null,
      status: body.status ?? "draft",
      venue_name: body.venueName ?? null,
      venue_address: body.venueAddress ?? null,
      venue_url: body.venueUrl ?? null,
      venue_map_url: body.venueMapUrl ?? null,
      fee_amount: body.feeAmount ?? null,
      payment_methods: body.paymentMethods ?? [],
      payment_deadline: body.paymentDeadline ?? null,
      memo: body.memo ?? null,
      dietary_notes: body.dietaryNotes ?? null,
    })
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!plan) {
    return NextResponse.json({ error: "プランが見つかりません。" }, { status: 404 });
  }

  // Replace the member list wholesale — the form only collects name/email
  // with no stable per-row id, so a diff-based update isn't worth the
  // complexity here. Any attendance/payment status a member might get in a
  // future UI would need a different (id-based) update strategy.
  const { error: deleteError } = await supabase
    .from("manual_plan_members")
    .delete()
    .eq("plan_id", plan.id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const members = (body.members ?? []).filter((m) => m.name?.trim());
  if (members.length > 0) {
    const { error: membersError } = await supabase.from("manual_plan_members").insert(
      members.map((m) => ({
        plan_id: plan.id,
        name: m.name.trim(),
        email: m.email?.trim() || null,
      }))
    );
    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ id: plan.id });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  // RLS ("Users can delete own plans") also enforces ownership server-side;
  // this check just gives a clearer error than a silent no-op delete.
  const { error } = await supabase
    .from("manual_plans")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
