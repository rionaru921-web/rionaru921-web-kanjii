import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { CalendarDays, MapPin, Wallet, Users as UsersIcon, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/manual-plans/StatusBadge";
import PlanDetailActions from "@/components/manual-plans/PlanDetailActions";
import {
  formatDateRange,
  PAYMENT_METHOD_LABELS,
  ATTENDANCE_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/manual-plans/format";
import { yen } from "@/lib/pdf/components";
import type { ManualPlan, ManualPlanMember } from "@/lib/manual-plans/types";

export const metadata: Metadata = {
  title: "プラン詳細",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ManualPlanDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/manual-plans/${params.id}`);
  }

  const { data: plan } = await supabase
    .from("manual_plans")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!plan) notFound();

  const { data: members } = await supabase
    .from("manual_plan_members")
    .select("*")
    .eq("plan_id", params.id)
    .order("created_at", { ascending: true });

  const typedPlan = plan as ManualPlan;
  const typedMembers = (members ?? []) as ManualPlanMember[];

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto space-y-6">
      <div>
        <div className="mb-2">
          <StatusBadge status={typedPlan.status} />
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-ink leading-tight">
          {typedPlan.title}
        </h1>
      </div>

      <PlanDetailActions plan={typedPlan} />

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
          <div className="min-w-0">
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
            {typedPlan.venue_map_url && (
              <a
                href={typedPlan.venue_map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gold hover:text-gold-deep transition-colors mt-1 block"
              >
                地図を見る →
              </a>
            )}
          </div>
        </section>
      )}

      {(typedPlan.fee_amount != null || typedPlan.payment_methods.length > 0) && (
        <section className="rounded-3xl bg-surface-tertiary shadow-warm p-6 flex items-start gap-3">
          <Wallet className="text-gold shrink-0" size={18} />
          <div>
            <p className="text-xs text-ink-muted mb-1">予算・集金</p>
            {typedPlan.fee_amount != null && (
              <p className="text-lg font-display-num font-black text-ink">{yen(typedPlan.fee_amount)}</p>
            )}
            {typedPlan.payment_methods.length > 0 && (
              <p className="text-sm text-ink-secondary mt-1">
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

      <section className="rounded-3xl bg-surface-tertiary shadow-warm p-6">
        <div className="flex items-center gap-2 mb-4">
          <UsersIcon className="text-gold" size={18} />
          <p className="text-xs text-ink-muted">メンバー ({typedMembers.length}人)</p>
        </div>
        {typedMembers.length === 0 ? (
          <p className="text-sm text-ink-secondary">まだメンバーが登録されていません</p>
        ) : (
          <div className="flex flex-col gap-3">
            {typedMembers.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 border-b border-gold/10 pb-3 last:border-0 last:pb-0"
              >
                <p className="text-sm font-medium text-ink truncate">{m.name}</p>
                <div className="flex gap-1.5 shrink-0">
                  <span className="text-[11px] rounded-full bg-gold/10 text-gold px-2 py-0.5">
                    {ATTENDANCE_LABELS[m.attendance_status]}
                  </span>
                  <span className="text-[11px] rounded-full bg-sage/10 text-sage px-2 py-0.5">
                    {PAYMENT_STATUS_LABELS[m.payment_status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

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
    </main>
  );
}
