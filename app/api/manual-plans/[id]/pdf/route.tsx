import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { generateQRDataUrl } from "@/lib/share/qr";
import { ManualPlanPDF } from "@/lib/pdf/templates/ManualPlanPDF";
import { getPayingMembers } from "@/lib/manual-plans/format";
import { calculateSplit, type SplitMemberInput } from "@/lib/manual-plans/calculate-split";
import type { ManualPlan, ManualPlanMember } from "@/lib/manual-plans/types";

// Self-contained server-side PDF generation for manual plans. The existing
// AI-suggestion PDF flow (lib/pdf/generate.ts + pdf.worker.ts) generates
// PDFs client-side in a Web Worker and is tightly coupled to
// NomikaiPDFProps/TravelPDFProps — left untouched per the task's
// instructions. This route reuses only the shared, generic style/helper
// modules (lib/pdf/styles.ts, lib/pdf/components.tsx) for visual
// consistency, via @react-pdf/renderer's Node-native renderToBuffer.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  // Single embedded query instead of a plan fetch followed by a separate
  // members fetch — the FK on manual_plan_members.plan_id lets PostgREST
  // join both in one round trip.
  const { data: plan } = await supabase
    .from("manual_plans")
    .select("*, manual_plan_members(*)")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .order("created_at", { referencedTable: "manual_plan_members", ascending: true })
    .maybeSingle();

  if (!plan) {
    return NextResponse.json({ error: "プランが見つかりません。" }, { status: 404 });
  }

  const { manual_plan_members, ...planFields } = plan as ManualPlan & {
    manual_plan_members: ManualPlanMember[];
  };
  const typedPlan = planFields as ManualPlan;
  const typedMembers = manual_plan_members ?? [];

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  const shareUrl = `${baseUrl}/share/plan/${typedPlan.share_token}`;
  const qrDataUrl = await generateQRDataUrl(shareUrl);

  const payingMembers = getPayingMembers(typedMembers);
  const splitResults =
    typedPlan.split_mode === "tiered"
      ? calculateSplit(
          typedPlan.fee_amount,
          payingMembers.map(
            (m): SplitMemberInput => ({
              id: m.id,
              tierLevel: m.tier_level,
              weightOverride: m.weight_override,
              organizerDiscount: m.organizer_discount,
            })
          ),
          typedPlan.rounding_unit
        )
      : null;
  const splitAmountById = new Map((splitResults ?? []).map((r) => [r.id, r.amount]));

  const buffer = await renderToBuffer(
    <ManualPlanPDF
      title={typedPlan.title}
      eventDate={typedPlan.event_date}
      endDate={typedPlan.end_date}
      venueName={typedPlan.venue_name}
      venueAddress={typedPlan.venue_address}
      venueUrl={typedPlan.venue_url}
      feeAmount={typedPlan.fee_amount}
      paymentMethods={typedPlan.payment_methods}
      paymentDeadline={typedPlan.payment_deadline}
      memo={typedPlan.memo}
      dietaryNotes={typedPlan.dietary_notes}
      splitMode={typedPlan.split_mode}
      members={typedMembers.map((m) => ({
        name: m.name,
        attendanceStatus: m.attendance_status,
        amount: splitAmountById.get(m.id),
      }))}
      shareUrl={shareUrl}
      qrDataUrl={qrDataUrl}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="KanjiLabo_${encodeURIComponent(typedPlan.title)}.pdf"`,
      // "private" (not "public"): this PDF is gated by an auth check above,
      // so a shared/CDN cache must never serve one user's cached response
      // to another user. "private" still lets the requesting browser skip
      // re-generating the PDF on a quick repeat click.
      "Cache-Control": "private, max-age=60",
    },
  });
}
