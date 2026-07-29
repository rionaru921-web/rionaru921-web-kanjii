import type { Metadata } from "next";
import {
  Clock,
  MapPin,
  Wallet,
  FileText,
  CalendarPlus,
  MessageCircle,
  CheckCircle2,
  PartyPopper,
  Users,
  Crown,
} from "lucide-react";
import type { ReactNode } from "react";
import AttendanceStatusBadge from "@/components/manual-plans/AttendanceStatusBadge";
import { WashokuShell } from "@/components/share/washoku/WashokuShell";
import { WashokuPaperCard } from "@/components/share/washoku/WashokuPaperCard";
import { WashokuCTA } from "@/components/share/washoku/WashokuCTA";
import AttendanceForm from "@/components/share/AttendanceForm";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  formatDateRange,
  PAYMENT_METHOD_LABELS,
  perPersonFee,
  getPayingMembers,
  buildLineShareText,
  getEventTypeLabel,
} from "@/lib/manual-plans/format";
import { VENUE_FACILITY_LABELS } from "@/lib/manual-plans/facility-types";
import { calculateSplit, type SplitMemberInput } from "@/lib/manual-plans/calculate-split";
import { buildGoogleMapsUrl, buildAppleMapsUrl, buildEmbedUrl } from "@/lib/manual-plans/maps";
import { formatFeeValue } from "@/lib/manual-plans/fee-parser";
import { isCompletedPlan } from "@/lib/manual-plans/types";
import { yen } from "@/lib/pdf/components";
import type { ManualPlan, ManualPlanMember } from "@/lib/manual-plans/types";

// Without this, Next's fetch-based Data Cache can treat this dynamic-segment
// page as staticly cacheable indefinitely (no generateStaticParams + a
// service-role client that never touches cookies/headers gives Next no
// other dynamic signal), so an attendee could keep seeing a stale snapshot
// of the plan after the organizer edits it. Forcing dynamic rendering trades
// that indefinite staleness for a fresh row on every request.
export const dynamic = "force-dynamic";

// Public, unauthenticated view. Deliberately at /share/plan/[token] rather
// than /share/[token] — that path is already used by the existing
// history-sharing flow (app/share/[token]/page.tsx), which this task must
// not touch. Uses the service-role admin client (bypasses RLS) instead of a
// public "using (true)" SELECT policy on manual_plans, matching the same
// pattern the history share flow already uses to avoid exposing every
// user's plan data via a direct table read.
function buildGoogleCalendarUrl(plan: ManualPlan): string {
  if (!plan.event_date) return "";
  const start = new Date(plan.event_date);
  const end = plan.end_date ? new Date(plan.end_date) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const toGCalDate = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: plan.title,
    dates: `${toGCalDate(start)}/${toGCalDate(end)}`,
    location: plan.venue_address || plan.venue_name || "",
    details: plan.memo || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// A single "chapter" row within the main card — icon + small label + content,
// divided from the previous chapter by a hairline. Static (no motion): the
// per-row stagger from the design spec would need a client-boundary
// extraction just for this, which isn't worth it next to the card's own
// existing entrance animation.
function Section({ icon, label, children, first }: { icon: ReactNode; label: string; children: ReactNode; first?: boolean }) {
  return (
    <div className={`flex items-start gap-3 ${first ? "" : "border-t border-washoku-brass-soft pt-4"}`}>
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] tracking-wide text-washoku-brass mb-1">{label}</p>
        {children}
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { token: string };
}): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: plan } = await supabase
    .from("manual_plans")
    .select("title, venue_name")
    .eq("share_token", params.token)
    .maybeSingle();

  if (!plan) {
    return { title: "プランが見つかりません" };
  }

  const title = plan.title;
  const description = plan.venue_name
    ? `${plan.venue_name}での集まりに招待されています`
    : "集まりに招待されています";

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharePlanPage({ params }: { params: { token: string } }) {
  const supabase = createAdminClient();

  const { data: plan } = await supabase
    .from("manual_plans")
    .select("*")
    .eq("share_token", params.token)
    .maybeSingle();

  const typedPlan = plan as ManualPlan | null;

  // Explicit column list (not "*") — this result is passed straight into
  // <AttendanceForm>, a Client Component, so whatever we select here gets
  // serialized to every visitor's browser. guest_secret must never be in
  // that list.
  const { data: members } = typedPlan
    ? await supabase
        .from("manual_plan_members")
        .select(
          "id, plan_id, name, email, role, attendance_status, note, created_at, updated_at, tier_level, weight_override, organizer_discount"
        )
        .eq("plan_id", typedPlan.id)
        .order("created_at", { ascending: true })
    : { data: [] };
  const typedMembers = (members ?? []) as ManualPlanMember[];

  const gcalUrl = typedPlan ? buildGoogleCalendarUrl(typedPlan) : "";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  const lineUrl = typedPlan
    ? `https://line.me/R/msg/text/?${encodeURIComponent(
        buildLineShareText(typedPlan, typedMembers, `${baseUrl}/share/plan/${params.token}`)
      )}`
    : "";
  const icsUrl = typedPlan ? `/api/share/plan/${params.token}/ics` : "";
  const mapQuery = typedPlan
    ? [typedPlan.venue_name, typedPlan.venue_address].filter(Boolean).join(" ").trim()
    : "";

  const isCompleted = typedPlan ? isCompletedPlan(typedPlan) : false;
  const organizers = typedMembers.filter((m) => m.role === "organizer");
  const payingMembers = getPayingMembers(typedMembers);
  const payingMemberCount = payingMembers.length;
  const perPerson = typedPlan ? perPersonFee(typedPlan.fee_amount, payingMemberCount) : null;
  const splitResults =
    typedPlan && typedPlan.split_mode === "tiered"
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

  if (!typedPlan) {
    return (
      <WashokuShell eyebrow="">
        <WashokuPaperCard>
          <p className="text-center text-washoku-ink-muted">このリンクは見つかりませんでした。</p>
        </WashokuPaperCard>
      </WashokuShell>
    );
  }

  return (
    <WashokuShell sessionKey={params.token}>
      <WashokuPaperCard>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-washoku-red-soft border border-washoku-red-soft">
            <Users className="w-10 h-10 text-washoku-red" strokeWidth={1.75} />
          </div>
          <div className="mt-4 border-t border-b border-washoku-brass-soft py-3">
            <h1 className="font-serif text-xl sm:text-2xl font-bold">{typedPlan.title}</h1>
            {getEventTypeLabel(typedPlan) && (
              <p className="mt-1 text-xs text-washoku-ink-muted">分類: {getEventTypeLabel(typedPlan)}</p>
            )}
            {organizers.length > 0 && (
              <p className="mt-2 text-xs text-washoku-ink-muted">
                👑 幹事({organizers.length}人): {organizers.map((m) => m.name).join("、")}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Section icon={<Clock className="text-washoku-brass shrink-0" size={18} />} label="日時" first>
            <p className="text-sm">{formatDateRange(typedPlan.event_date, typedPlan.end_date)}</p>
          </Section>

          {(typedPlan.venue_name || typedPlan.venue_address) && (
            <Section icon={<MapPin className="text-washoku-brass shrink-0" size={18} />} label="会場">
              {typedPlan.venue_name && (
                <p className="text-sm font-serif font-semibold">{typedPlan.venue_name}</p>
              )}
              {typedPlan.venue_address && (
                <p className="text-sm text-washoku-ink-muted">{typedPlan.venue_address}</p>
              )}
              {typedPlan.venue_facilities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {typedPlan.venue_facilities.map((f) => (
                    <span
                      key={f}
                      className="text-xs px-2.5 py-1 rounded-full bg-washoku-brass-soft text-washoku-ink"
                    >
                      {VENUE_FACILITY_LABELS[f as keyof typeof VENUE_FACILITY_LABELS] ?? f}
                    </span>
                  ))}
                </div>
              )}
              {mapQuery && (
                <>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="text-washoku-ink-muted">地図で開く:</span>
                    <a
                      href={buildGoogleMapsUrl(mapQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-washoku-red hover:underline"
                    >
                      🗺️ Google Maps
                    </a>
                    <a
                      href={buildAppleMapsUrl(mapQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-washoku-red hover:underline"
                    >
                      🍎 Apple Maps
                    </a>
                  </div>
                  <iframe
                    src={buildEmbedUrl(mapQuery)}
                    className="mt-3 h-40 w-full rounded-lg border border-washoku-brass-soft"
                    loading="lazy"
                    title="地図プレビュー"
                  />
                </>
              )}
            </Section>
          )}

          {(typedPlan.fee_amount != null || typedPlan.fee_breakdown.length > 0) && (
            <Section icon={<Wallet className="text-washoku-brass shrink-0" size={18} />} label="予算・集金">
              {typedPlan.fee_amount != null && (
                <p className="text-sm font-serif font-black">{yen(typedPlan.fee_amount)}</p>
              )}
              {typedPlan.fee_breakdown.length > 0 && (
                <ul className="mt-1.5 flex flex-col gap-0.5">
                  {typedPlan.fee_breakdown.map((item, i) => (
                    <li key={i} className="flex items-center justify-between text-xs text-washoku-ink-muted">
                      <span>{item.label}</span>
                      <span>{formatFeeValue(item.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {typedPlan.split_mode === "equal" && perPerson != null && (
                <p className="mt-1.5 text-xs text-washoku-ink-muted">
                  1人あたり <span className="font-semibold text-washoku-red">{yen(perPerson)}</span>(
                  {payingMemberCount}人で割り勘)
                </p>
              )}
              {typedPlan.split_mode === "tiered" && payingMembers.length > 0 && (
                <div className="mt-1.5 border-t border-washoku-brass-soft pt-2">
                  <p className="text-[11px] text-washoku-ink-muted mb-1">傾斜割り(一人ずつの金額)</p>
                  <ul className="flex flex-col gap-0.5">
                    {payingMembers.map((m) => (
                      <li key={m.id} className="flex items-center justify-between text-xs text-washoku-ink-muted">
                        <span className="truncate">{m.name}</span>
                        <span className="text-washoku-red shrink-0">
                          {yen(splitAmountById.get(m.id) ?? 0)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {typedPlan.payment_methods.length > 0 && (
                <p className="text-xs text-washoku-ink-muted mt-0.5">
                  {typedPlan.payment_methods.map((m) => PAYMENT_METHOD_LABELS[m] ?? m).join(" / ")}
                </p>
              )}
            </Section>
          )}

          {typedMembers.length > 0 && (
            <Section icon={<Users className="text-washoku-brass shrink-0" size={18} />} label="参加者">
              <ul className="flex flex-col gap-1.5">
                {typedMembers.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-1.5 truncate">
                      {m.role === "organizer" && <Crown className="text-washoku-brass shrink-0" size={12} />}
                      {m.name}
                    </span>
                    <AttendanceStatusBadge status={m.attendance_status} />
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {typedPlan.memo && (
            <Section icon={<FileText className="text-washoku-brass shrink-0" size={18} />} label="メモ">
              <p className="text-sm text-washoku-ink-muted whitespace-pre-wrap">{typedPlan.memo}</p>
            </Section>
          )}

          {typedPlan.nijikai_enabled && (
            <Section icon={<PartyPopper className="text-washoku-brass shrink-0" size={18} />} label="二次会">
              {typedPlan.nijikai_venue && (
                <p className="text-sm font-serif font-semibold">{typedPlan.nijikai_venue}</p>
              )}
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-sm text-washoku-ink-muted">
                {typedPlan.nijikai_start_time && <span>{typedPlan.nijikai_start_time}〜</span>}
                {typedPlan.nijikai_budget != null && <span>{yen(typedPlan.nijikai_budget)}</span>}
              </div>
              {typedPlan.nijikai_url && (
                <a
                  href={typedPlan.nijikai_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-washoku-red hover:underline mt-1 inline-block truncate max-w-full"
                >
                  {typedPlan.nijikai_url}
                </a>
              )}
            </Section>
          )}
        </div>
      </WashokuPaperCard>

      {isCompleted ? (
        <div className="rounded-lg border border-washoku-brass-soft bg-washoku-paper text-washoku-ink p-6 flex flex-col items-center gap-2 text-center">
          <CheckCircle2 className="text-washoku-brass" size={24} />
          <p className="text-sm font-serif font-semibold">このイベントは終了しました</p>
          <p className="text-xs text-washoku-ink-muted">ご参加ありがとうございました。</p>
        </div>
      ) : (
        <AttendanceForm shareToken={params.token} members={typedMembers} />
      )}

      <div className="flex flex-col gap-3">
        {lineUrl && (
          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-[#06C755]/40 text-[#06C755] font-semibold text-sm py-3 hover:bg-[#06C755]/10 transition-colors"
          >
            <MessageCircle size={16} />
            LINEで共有
          </a>
        )}

        {icsUrl && (
          <a
            href={icsUrl}
            className="flex items-center justify-center gap-2 rounded-full border border-washoku-brass-soft text-washoku-brass font-semibold text-sm py-3 hover:bg-washoku-brass-soft transition-colors"
          >
            <CalendarPlus size={16} />
            カレンダーに追加(.ics)
          </a>
        )}

        {gcalUrl && (
          <a
            href={gcalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-washoku-brass-soft text-washoku-brass font-semibold text-sm py-3 hover:bg-washoku-brass-soft transition-colors"
          >
            <CalendarPlus size={16} />
            Googleカレンダーに追加
          </a>
        )}

        <WashokuCTA>幹事ラボで自分も幹事してみる</WashokuCTA>
      </div>
    </WashokuShell>
  );
}
