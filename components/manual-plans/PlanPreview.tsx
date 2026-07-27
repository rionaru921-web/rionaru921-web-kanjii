"use client";

import { CalendarDays, MapPin, PartyPopper, Users, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import type { EventType, FeeBreakdownItem } from "@/lib/manual-plans/types";
import type { OrganizerDiscount, RoundingUnit, SplitMode, TierLevel } from "@/lib/manual-plans/split-types";
import type { NijikaiValue } from "@/components/manual-plans/sections/NijikaiSection";
import { PAYMENT_METHOD_LABELS, formatDateRange } from "@/lib/manual-plans/format";
import { VENUE_FACILITY_LABELS } from "@/lib/manual-plans/facility-types";
import { fromDateTimeLocalValue } from "@/lib/date/kanjii-time";
import { calculateSplit, type SplitMemberInput } from "@/lib/manual-plans/calculate-split";
import { formatFeeValue } from "@/lib/manual-plans/fee-parser";
import { PLAN_TEMPLATES } from "@/lib/plan-templates";
import { yen } from "@/lib/format/currency";

interface PreviewMember {
  name: string;
  tierLevel: TierLevel;
  weightOverride: number | null;
  organizerDiscount: OrganizerDiscount | null;
}

interface PlanPreviewProps {
  title: string;
  eventType: EventType | null;
  eventTypeCustomLabel: string;
  eventDate: string;
  endDate: string;
  venueName: string;
  venueAddress: string;
  venueFacilities: string[];
  feeAmount: string;
  feeBreakdown: FeeBreakdownItem[];
  paymentMethods: string[];
  splitMode: SplitMode;
  roundingUnit: RoundingUnit;
  members: PreviewMember[];
  nijikai: NijikaiValue;
}

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink-muted mb-0.5">{label}</p>
        <div className="text-sm text-ink">{children}</div>
      </div>
    </div>
  );
}

// Pure, props-only preview of what an organizer's own plan detail page
// (app/manual-plans/[id]/page.tsx) will look like — deliberately not a
// wrapper around that page, since that page fetches its own data by id and
// a not-yet-saved draft has none. Reuses the same formatting helpers
// (format.ts, calculate-split.ts, fee-parser.ts) so the numbers shown here
// can't drift from what actually gets saved.
export default function PlanPreview({
  title,
  eventType,
  eventTypeCustomLabel,
  eventDate,
  endDate,
  venueName,
  venueAddress,
  venueFacilities,
  feeAmount,
  feeBreakdown,
  paymentMethods,
  splitMode,
  roundingUnit,
  members,
  nijikai,
}: PlanPreviewProps) {
  const eventTypeLabel = eventType
    ? PLAN_TEMPLATES.find((t) => t.eventType === eventType)?.label ?? null
    : eventTypeCustomLabel.trim() || null;

  const totalAmount = feeAmount.trim() ? Number(feeAmount) : null;
  const namedMembers = members.filter((m) => m.name.trim());
  const splitInputs: SplitMemberInput[] = namedMembers.map((m, i) => ({
    id: String(i),
    tierLevel: m.tierLevel,
    weightOverride: m.weightOverride,
    organizerDiscount: m.organizerDiscount,
  }));
  const splitResults = splitMode === "tiered" ? calculateSplit(totalAmount, splitInputs, roundingUnit) : null;
  const perPerson =
    splitMode === "equal" && totalAmount != null && namedMembers.length > 0
      ? Math.ceil(totalAmount / namedMembers.length)
      : null;

  return (
    <div className="rounded-2xl border border-gold/20 bg-surface-tertiary shadow-warm-hover overflow-hidden">
      <div className="bg-gold-gradient text-white px-4 py-3">
        <p className="text-[11px] opacity-80">◇ プレビュー</p>
        <p className="font-serif text-base font-semibold mt-0.5 truncate">{title || "(タイトル未入力)"}</p>
        {eventTypeLabel && <p className="text-[11px] opacity-85 mt-0.5">分類: {eventTypeLabel}</p>}
      </div>

      <div className="p-4 flex flex-col gap-4">
        <Row icon={<CalendarDays size={16} className="text-gold" />} label="日時">
          {eventDate ? formatDateRange(fromDateTimeLocalValue(eventDate), fromDateTimeLocalValue(endDate)) : (
            <span className="text-ink-muted">未定</span>
          )}
        </Row>

        <Row icon={<MapPin size={16} className="text-gold" />} label="会場">
          {venueName || venueAddress ? (
            <div>
              {venueName && <p className="font-medium">{venueName}</p>}
              {venueAddress && <p className="text-xs text-ink-secondary mt-0.5">{venueAddress}</p>}
              {venueFacilities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {venueFacilities.map((f) => (
                    <span key={f} className="text-[11px] px-2 py-0.5 rounded-full bg-gold/10 text-ink">
                      {VENUE_FACILITY_LABELS[f as keyof typeof VENUE_FACILITY_LABELS] ?? f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span className="text-ink-muted">未定</span>
          )}
        </Row>

        <Row icon={<Users size={16} className="text-gold" />} label="参加者">
          {namedMembers.length > 0 ? (
            <div>
              <p>{namedMembers.length}名</p>
              <p className="text-xs text-ink-secondary mt-0.5 truncate">
                {namedMembers
                  .slice(0, 3)
                  .map((m) => m.name)
                  .join("、")}
                {namedMembers.length > 3 && ` 他${namedMembers.length - 3}名`}
              </p>
            </div>
          ) : (
            <span className="text-ink-muted">未追加</span>
          )}
        </Row>

        <Row icon={<Wallet size={16} className="text-gold" />} label="予算">
          {totalAmount != null ? (
            <div>
              <p className="font-serif font-semibold">{yen(totalAmount)}</p>
              {feeBreakdown.filter((i) => i.label.trim()).length > 0 && (
                <ul className="mt-1 flex flex-col gap-0.5">
                  {feeBreakdown
                    .filter((i) => i.label.trim())
                    .map((item, i) => (
                      <li key={i} className="flex items-center justify-between text-xs text-ink-secondary">
                        <span>{item.label}</span>
                        <span>{formatFeeValue(item.amount)}</span>
                      </li>
                    ))}
                </ul>
              )}
              {perPerson != null && (
                <p className="text-xs text-ink-secondary mt-1">
                  1人あたり <span className="font-semibold text-gold">{yen(perPerson)}</span>
                </p>
              )}
              {splitResults && splitResults.length > 0 && (
                <ul className="mt-1 flex flex-col gap-0.5">
                  {namedMembers.map((m, i) => (
                    <li key={i} className="flex items-center justify-between text-xs text-ink-secondary">
                      <span className="truncate">{m.name}</span>
                      <span className="text-gold shrink-0">{yen(splitResults[i]?.amount ?? 0)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {paymentMethods.length > 0 && (
                <p className="text-xs text-ink-secondary mt-1">
                  {paymentMethods.map((m) => PAYMENT_METHOD_LABELS[m] ?? m).join(" / ")}
                </p>
              )}
            </div>
          ) : (
            <span className="text-ink-muted">未定</span>
          )}
        </Row>

        {nijikai.enabled && (
          <Row icon={<PartyPopper size={16} className="text-gold" />} label="二次会">
            {nijikai.venue || <span className="text-ink-muted">会場未定</span>}
          </Row>
        )}
      </div>
    </div>
  );
}
