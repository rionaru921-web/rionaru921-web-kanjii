import { formatDateTime } from "@/lib/manual-plans/format";
import { fromDateTimeLocalValue } from "@/lib/date/kanjii-time";
import { calculateSplit } from "@/lib/manual-plans/calculate-split";
import { perPersonFee } from "@/lib/manual-plans/format";
import type { SplitMode, RoundingUnit, TierLevel, OrganizerDiscount } from "@/lib/manual-plans/split-types";

export interface PlanPreviewMember {
  name: string;
  tierLevel: TierLevel;
  weightOverride: number | null;
  organizerDiscount: OrganizerDiscount | null;
}

interface PlanPreviewCardProps {
  title: string;
  eventDate: string;
  venueName: string;
  feeAmount: string;
  splitMode: SplitMode;
  roundingUnit: RoundingUnit;
  members: PlanPreviewMember[];
}

function PlaceholderText({ children }: { children: string }) {
  return <span className="text-ink-muted">{children}</span>;
}

export default function PlanPreviewCard({
  title,
  eventDate,
  venueName,
  feeAmount,
  splitMode,
  roundingUnit,
  members,
}: PlanPreviewCardProps) {
  const totalAmount = feeAmount.trim() ? Number(feeAmount) : null;
  const memberCount = members.length;

  const requiredChecks = [
    title.trim() !== "",
    eventDate.trim() !== "",
    venueName.trim() !== "",
    feeAmount.trim() !== "",
    memberCount > 0,
  ];
  const completion = Math.round(
    (requiredChecks.filter(Boolean).length / requiredChecks.length) * 100
  );

  const splitResults =
    splitMode === "tiered" && totalAmount != null && memberCount > 0
      ? calculateSplit(
          totalAmount,
          members.map((m, i) => ({
            id: String(i),
            tierLevel: m.tierLevel,
            weightOverride: m.weightOverride,
            organizerDiscount: m.organizerDiscount,
          })),
          roundingUnit
        )
      : null;

  const perPerson = splitMode === "equal" ? perPersonFee(totalAmount, memberCount) : null;

  return (
    <div className="rounded-3xl bg-surface-tertiary shadow-warm p-6 flex flex-col gap-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div>
        <p className="text-xs font-semibold text-gold mb-1">完成プレビュー</p>
        <div className="h-1.5 w-full rounded-full bg-gold/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gold-gradient transition-all duration-300"
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] text-ink-muted">完成度: {completion}%</p>
      </div>

      <div className="flex flex-col gap-3 text-sm">
        <div>
          <p className="text-xs text-ink-muted">タイトル</p>
          <p className="font-serif font-bold text-ink">
            {title.trim() || <PlaceholderText>まだ入力されていません</PlaceholderText>}
          </p>
        </div>

        <div>
          <p className="text-xs text-ink-muted">日時</p>
          <p className="text-ink">
            {eventDate.trim() ? (
              formatDateTime(fromDateTimeLocalValue(eventDate))
            ) : (
              <PlaceholderText>まだ入力されていません</PlaceholderText>
            )}
          </p>
        </div>

        <div>
          <p className="text-xs text-ink-muted">場所</p>
          <p className="text-ink">
            {venueName.trim() || <PlaceholderText>まだ入力されていません</PlaceholderText>}
          </p>
        </div>

        <div>
          <p className="text-xs text-ink-muted">予算</p>
          <p className="text-ink">
            {totalAmount != null ? (
              <>
                <span className="font-display-num text-gold">¥{totalAmount.toLocaleString()}</span>
                {perPerson != null && (
                  <span className="text-xs text-ink-muted"> (1人あたり ¥{perPerson.toLocaleString()})</span>
                )}
              </>
            ) : (
              <PlaceholderText>まだ入力されていません</PlaceholderText>
            )}
          </p>
        </div>

        <div>
          <p className="text-xs text-ink-muted">メンバー</p>
          <p className="text-ink">
            {memberCount > 0 ? (
              `${memberCount}名`
            ) : (
              <PlaceholderText>まだ入力されていません</PlaceholderText>
            )}
          </p>
        </div>
      </div>

      {splitResults && splitResults.length > 0 && (
        <div className="rounded-xl bg-gold/5 border border-gold/15 px-4 py-3">
          <p className="text-xs text-ink-muted mb-1.5">💡 傾斜割りサマリー</p>
          <ul className="flex flex-col gap-1">
            {members.map((m, i) => (
              <li key={i} className="flex items-center justify-between text-sm text-ink">
                <span className="truncate">{m.name}</span>
                <span className="font-display-num text-gold shrink-0">
                  ¥{(splitResults[i]?.amount ?? 0).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
