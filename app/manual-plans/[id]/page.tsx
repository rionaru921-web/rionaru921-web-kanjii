import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Wallet,
  FileText,
  Home,
  ChevronRight,
  ArrowLeft,
  PartyPopper,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import TimelineBadge from "@/components/manual-plans/TimelineBadge";
import PlanDetailActions from "@/components/manual-plans/PlanDetailActions";
import MemberList from "@/components/manual-plans/MemberList";
import ReceiptsSection from "@/components/manual-plans/ReceiptsSection";
import { formatDateRange, PAYMENT_METHOD_LABELS, perPersonFee, getPayingMembers } from "@/lib/manual-plans/format";
import { buildGoogleMapsUrl, buildAppleMapsUrl, buildEmbedUrl } from "@/lib/manual-plans/maps";
import { calculateAttendanceRate } from "@/lib/manual-plans/attendance-stats";
import { calculateSplit, type SplitMemberInput } from "@/lib/manual-plans/calculate-split";
import { getTimelineStatus, isCompletedPlan } from "@/lib/manual-plans/types";
import { formatFeeValue } from "@/lib/manual-plans/fee-parser";
import { yen } from "@/lib/pdf/components";
import type { AttendanceStatus, ManualPlan, ManualPlanMember } from "@/lib/manual-plans/types";

export const metadata: Metadata = {
  title: "プラン詳細",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ManualPlanDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { just_created?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/manual-plans/${params.id}`);
  }

  // members only depends on params.id, not on the plan row, so it's fetched
  // alongside plan instead of waiting for it.
  const [{ data: plan }, { data: members }] = await Promise.all([
    supabase.from("manual_plans").select("*").eq("id", params.id).eq("user_id", user.id).maybeSingle(),
    supabase.from("manual_plan_members").select("*").eq("plan_id", params.id).order("created_at", { ascending: true }),
  ]);

  if (!plan) notFound();

  const typedPlan = plan as ManualPlan;
  // This page renders member fields directly (never passes the raw row
  // objects into a Client Component), so select("*") — and therefore
  // guest_secret — never reaches the browser. We only ever read it here to
  // derive the hasGuestSecret boolean passed to <MemberGuestSecretReset>.
  const typedMembers = (members ?? []) as (ManualPlanMember & { guest_secret: string | null })[];
  const justCreated = searchParams.just_created === "1";

  const attendanceCounts = typedMembers.reduce(
    (acc, m) => {
      acc[m.attendance_status] += 1;
      return acc;
    },
    { attending: 0, declined: 0, maybe: 0, pending: 0 } as Record<AttendanceStatus, number>
  );

  const attendanceRate = calculateAttendanceRate(attendanceCounts.attending, typedMembers.length);
  const isCompleted = isCompletedPlan(typedPlan);
  const payingMembers = getPayingMembers(typedMembers);
  const payingMemberCount = payingMembers.length;
  const perPerson = perPersonFee(typedPlan.fee_amount, payingMemberCount);
  const mapQuery = [typedPlan.venue_name, typedPlan.venue_address].filter(Boolean).join(" ").trim();

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

  // Sanitized shape handed to the Client Component below — never the raw
  // row with guest_secret (see the comment on typedMembers above).
  const memberListItems = typedMembers.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    attendance_status: m.attendance_status,
    hasGuestSecret: m.guest_secret != null,
    amount: typedPlan.split_mode === "tiered" ? splitAmountById.get(m.id) : undefined,
  }));

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto space-y-6">
      <nav className="flex items-center gap-2 text-sm text-ink/60">
        <Link href="/dashboard" className="flex items-center gap-1 hover:text-gold transition-colors">
          <Home className="h-4 w-4" />
          ホーム
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/manual-plans" className="hover:text-gold transition-colors">
          プラン一覧
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-ink/80">詳細</span>
      </nav>

      {justCreated && (
        <div className="rounded-2xl border border-gold/30 bg-gold/5 px-4 py-3 flex items-start gap-2.5">
          <PartyPopper className="text-gold shrink-0 mt-0.5" size={18} />
          <p className="text-sm font-semibold text-ink">プランを保存しました。共有可能です。</p>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center gap-2">
          <TimelineBadge status={getTimelineStatus(typedPlan)} />
          {attendanceRate.rate !== null && (
            <span className="inline-flex items-center rounded-full text-[11px] font-bold px-2.5 py-1 border shrink-0 text-gold bg-gold/5 border-gold/25">
              {attendanceRate.attending}/{attendanceRate.total}名 参加 ({attendanceRate.rate}%)
            </span>
          )}
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-ink leading-tight">
          {typedPlan.title}
        </h1>
      </div>

      <PlanDetailActions plan={typedPlan} members={typedMembers} isCompleted={isCompleted} />

      <section className="rounded-3xl bg-surface-tertiary shadow-warm p-6 flex items-start gap-3">
        <CalendarDays className="text-gold shrink-0" size={18} />
        <div>
          <p className="text-xs text-ink-muted mb-1">日時</p>
          <p className="text-sm text-ink">{formatDateRange(typedPlan.event_date, typedPlan.end_date)}</p>
        </div>
      </section>

      {(typedPlan.venue_name || typedPlan.venue_address || typedPlan.venue_url) && (
        <section className="rounded-3xl bg-surface-tertiary shadow-warm p-6 flex items-start gap-3">
          <MapPin className="text-gold shrink-0" size={18} />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-muted mb-1">場所</p>
            {typedPlan.venue_name && <p className="text-sm text-ink font-semibold">{typedPlan.venue_name}</p>}
            {typedPlan.venue_address && (
              <p className="text-sm text-ink-secondary mt-0.5">{typedPlan.venue_address}</p>
            )}
            {typedPlan.venue_url && (
              <a
                href={typedPlan.venue_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gold hover:text-gold-deep transition-colors mt-1 inline-block truncate max-w-full"
              >
                {typedPlan.venue_url}
              </a>
            )}
            {mapQuery && (
              <>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="text-ink/60">地図で開く:</span>
                  <a
                    href={buildGoogleMapsUrl(mapQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:underline"
                  >
                    🗺️ Google Maps
                  </a>
                  <a
                    href={buildAppleMapsUrl(mapQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:underline"
                  >
                    🍎 Apple Maps
                  </a>
                </div>
                <iframe
                  src={buildEmbedUrl(mapQuery)}
                  className="mt-3 h-48 w-full rounded-lg border border-gold/20"
                  loading="lazy"
                  title="地図プレビュー"
                />
              </>
            )}
          </div>
        </section>
      )}

      {(typedPlan.fee_amount != null ||
        typedPlan.payment_methods.length > 0 ||
        typedPlan.fee_breakdown.length > 0) && (
        <section className="rounded-3xl bg-surface-tertiary shadow-warm p-6 flex items-start gap-3">
          <Wallet className="text-gold shrink-0" size={18} />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-muted mb-1">予算・集金</p>
            {typedPlan.fee_amount != null && (
              <p className="text-lg font-display-num font-black text-ink">{yen(typedPlan.fee_amount)}</p>
            )}
            {typedPlan.fee_breakdown.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1">
                {typedPlan.fee_breakdown.map((item, i) => (
                  <li key={i} className="flex items-center justify-between text-sm text-ink-secondary">
                    <span>{item.label}</span>
                    <span className="font-display-num">{formatFeeValue(item.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
            {typedPlan.split_mode === "equal" && perPerson != null && (
              <div className="mt-3 rounded-xl bg-gold/5 border border-gold/15 px-4 py-3">
                <p className="text-xs text-ink-muted">💡 参加人数: {payingMemberCount}人</p>
                <p className="text-sm font-semibold text-ink mt-0.5">
                  1人あたり: <span className="font-display-num text-gold">{yen(perPerson)}</span>
                </p>
              </div>
            )}
            {typedPlan.split_mode === "tiered" && payingMembers.length > 0 && (
              <div className="mt-3 rounded-xl bg-gold/5 border border-gold/15 px-4 py-3">
                <p className="text-xs text-ink-muted mb-1.5">💡 参加人数: {payingMembers.length}人(傾斜割り)</p>
                <ul className="flex flex-col gap-1">
                  {payingMembers.map((m) => (
                    <li key={m.id} className="flex items-center justify-between text-sm text-ink">
                      <span className="truncate">{m.name}</span>
                      <span className="font-display-num text-gold shrink-0">
                        {yen(splitAmountById.get(m.id) ?? 0)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {typedPlan.payment_methods.length > 0 && (
              <p className="text-sm text-ink-secondary mt-3">
                {typedPlan.payment_methods.map((m) => PAYMENT_METHOD_LABELS[m] ?? m).join(" / ")}
              </p>
            )}
            {typedPlan.payment_deadline && (
              <p className="text-xs text-ink-muted mt-1">
                支払い期限: {formatDateRange(typedPlan.payment_deadline, null)}
              </p>
            )}
          </div>
        </section>
      )}

      <MemberList planId={typedPlan.id} members={memberListItems} />

      {isCompleted && <ReceiptsSection />}

      {(typedPlan.memo || typedPlan.dietary_notes) && (
        <section className="rounded-3xl bg-surface-tertiary shadow-warm p-6 flex items-start gap-3">
          <FileText className="text-gold shrink-0" size={18} />
          <div>
            <p className="text-xs text-ink-muted mb-1">メモ</p>
            {typedPlan.memo && <p className="text-sm text-ink whitespace-pre-wrap">{typedPlan.memo}</p>}
            {typedPlan.dietary_notes && (
              <p className="text-sm text-ink-secondary whitespace-pre-wrap mt-2">
                アレルギー・苦手なもの: {typedPlan.dietary_notes}
              </p>
            )}
          </div>
        </section>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/manual-plans"
          className="inline-flex items-center gap-1 text-sm text-ink/60 hover:text-gold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          プラン一覧に戻る
        </Link>
      </div>
    </main>
  );
}
